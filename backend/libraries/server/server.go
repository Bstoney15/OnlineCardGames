package server

import (
	"log"
	"net/http"

	"cardgames/backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Server holds dependencies for the application.
type Server struct {
	DB     *gorm.DB
	Router *http.ServeMux
}

// NewServer creates and returns a new Server instance.
func NewServer() *Server {
	log.Println("Initializing server...")

	db, err := gorm.Open(sqlite.Open("cards.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	runMigrations(db)

	log.Println("Setting up router...")
	s := &Server{
		DB:     db,
		Router: http.NewServeMux(),
	}
	s.setupRoutes()
	log.Println("Router setup complete.")

	log.Println("Server initialization complete.")
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