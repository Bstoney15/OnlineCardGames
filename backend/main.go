package main

import (
	"cardgames/backend/libraries/server"
)

func main() {
	// NewServer sets up the database and router
	s := server.NewServer()

	// Start the server
	s.Start(":8080")
}
