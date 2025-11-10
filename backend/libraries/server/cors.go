package server

import (
	"net/http"
	"os"
)

// corsMiddleware wraps a handler to add CORS headers.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only set CORS headers in development
		if os.Getenv("PROD") != "true" {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
			w.Header().Set("Access-Control-Expose-Headers", "Set-Cookie")
			w.Header().Set("Access-Control-Max-Age", "3600")

			// If it's a preflight request, respond with 200 OK
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}
