package server

import (
	"encoding/json"
	"log"
	"net/http"

	"cardgames/backend/libraries/sessionManager"
	"cardgames/backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Server holds dependencies for the application.
type Server struct {
	DB     *gorm.DB
	Router *http.ServeMux
	SM     *sessionmanager.SessionManager
}

// NewServer creates and returns a new Server instance.
func NewServer() *Server {

	// database set up
	db, err := gorm.Open(sqlite.Open("cards.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	runMigrations(db)

	// session manager set up
	sm := sessionmanager.NewSessionManager()

	// set server config
	s := &Server{
		DB:     db,
		Router: http.NewServeMux(),
		SM:     sm,
	}
	s.setupRoutes()

	log.Println("Server initialization complete. Listening on port 8080")
	return s
}

func runMigrations(db *gorm.DB) {
	err := db.AutoMigrate(&models.Account{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}
}

// Start runs the HTTP server on a given address.
func (s *Server) Start(addr string) {
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, corsMiddleware(s.Router)))
}



// handleRegister handles account creation requests.
func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "email and password required", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	account := models.Account{
		Email:        req.Email,
		PasswordHash: string(hash),
		Balance:      100,
	}

	if err := s.DB.Create(&account).Error; err != nil {
		http.Error(w, "email already exists", http.StatusConflict)
		return
	}

	log.Printf("✅ Created new account: %s", account.Email)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"email":   account.Email,
		"balance": account.Balance,
	})
}

