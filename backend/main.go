package main

import (
	"log"
	"net/http"

	"cardgames/backend/libraries/server"
)

func main() {
	// NewServer sets up the database and router
	s := server.NewServer()

	log.Println("Starting server on :8080")
	// ListenAndServe is a blocking call that starts the server.
	if err := http.ListenAndServe(":8080", s.Router); err != nil {
		log.Fatalf("Could not listen on :8080: %v\n", err)
	}
}
