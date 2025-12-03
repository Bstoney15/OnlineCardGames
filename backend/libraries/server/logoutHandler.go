// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains the handler for user logout operations.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"net/http"
)

// logoutHandler handles user logout requests by invalidating the session.
// It extracts the session ID from the cookie, removes the session from the
// session manager, and clears the session cookie from the client's browser.
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
