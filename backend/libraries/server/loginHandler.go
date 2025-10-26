package server

import (
	"backend/sessionManager"
	"encoding/json"
	"net/http"
	"strings"
)

var sm = sessionManager.NewSessionManager()

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// handler func that gets a request and response objects. Write to response object to return objects to requster.
func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	// you can access s.db to do transactions on the db
	// the session manager is s.SM

	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Verify credentials
	pwd, exists := users[req.Username]
	if !exists || strings.TrimSpace(pwd) != strings.TrimSpace(req.Password) {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	/*
		// Create session using the username (not hardcoded 1)
		sessionID := sm.set(req.Username)

		// Set cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    sessionID,
			Path:     "/",
			Expires:  time.Now().Add(5 * time.Minute),
			HttpOnly: true,
		})
	*/
	// Send JSON response
	w.Header().Set("Content-Type", "application/json")
	resp := map[string]string{"message": "Login successful"}
	json.NewEncoder(w).Encode(resp)
	//SendGenericResponse(w, true, 200, nil)
}
