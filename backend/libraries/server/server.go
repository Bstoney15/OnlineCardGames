package server

import (
	"log"
	"net/http"
	"cardgames/backend/libraries/sessionManager"

	"cardgames/backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Server holds dependencies for the application.
type Server struct {
	DB     *gorm.DB
	Router *http.ServeMux
	SM 	   *sessionmanager.SessionManager
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
		SM: 	sm,
	}
	s.setupRoutes()

	log.Println("Server initialization complete. Listening on port 8080")
	return s
}

func runMigrations(db *gorm.DB){
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