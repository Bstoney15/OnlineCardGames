package server

import (
	"net/http"
)

// logoutHandler handles user logout by invalidating the session token.
func (s *Server) logoutHandler(w http.ResponseWriter, r *http.Request) {
	// Extract the session token from the request (e.g., from headers or cookies).
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	sessionID := cookie.Value

	// Invalidate the session token.
	s.SM.Delete(sessionID)

	// Clear the session cookie.
	clearedCookie := &http.Cookie{
		Name:     "sessionId",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	}
	http.SetCookie(w, clearedCookie)
}
