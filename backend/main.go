// Package main is the entry point for the card games backend server.
// It initializes and starts the HTTP server that handles all game and user operations.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package main

import (
	"cardgames/backend/libraries/server"
)

// main initializes the server with database connections and route handlers,
// then starts listening for incoming HTTP requests on port 8080.
func main() {
	// NewServer sets up the database and router
	s := server.NewServer()

	// Start the server
	s.Start(":8080")
}
