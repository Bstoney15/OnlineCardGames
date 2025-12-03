// File contains functions for creating server, migrating server, and starting server
//
// Author: Benjamin Stonestreet
// Date: 2025-10-22

package server

import (
	"log"
	"net/http"

	gameinstancemanager "cardgames/backend/libraries/gameInstanceManager"
	sessionmanager "cardgames/backend/libraries/sessionManager"
	"cardgames/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const DEV_MODE = true

// Server holds dependencies for the application.
type Server struct {
	DB     *gorm.DB
	Router *http.ServeMux
	SM     *sessionmanager.SessionManager
	GIM    *gameinstancemanager.GameInstanceManager
}

// NewServer creates and returns a new Server instance.
func NewServer() *Server {

	db, err := gorm.Open(sqlite.Open("cards.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	runMigrations(db)

	// session manager set up
	sm := sessionmanager.NewSessionManager()

	// game instance manager set up
	gim := gameinstancemanager.NewGameInstanceManager(db)
	gim.Start() // Start the background cleanup goroutine

	// set server config
	s := &Server{
		DB:     db,
		Router: http.NewServeMux(),
		SM:     sm,
		GIM:    gim,
	}
	s.setupRoutes()

	log.Println("Server initialization complete. Listening on port 8080")
	return s
}

// Runs migrations
func runMigrations(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.Account{},
		&models.Friend{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	err = db.AutoMigrate(&models.Wager{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	err = db.AutoMigrate(&models.Friend{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}
}

// Start runs the HTTP server on a given address.
func (s *Server) Start(addr string) {
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, s.Router))
}
