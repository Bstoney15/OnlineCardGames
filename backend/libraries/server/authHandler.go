// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains the handler for authenticating users via session cookies.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"net/http"
)

// authHandler handles authentication requests by validating session cookies.
// It checks for the presence of a valid session cookie, verifies the session
// exists and is not expired, and returns the user ID if authentication succeeds.
// Returns unauthorized status if the session is missing, invalid, or expired.
func (s *Server) authHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {

		if err == http.ErrNoCookie {
			// If the cookie is not set, return an unauthorized status
			SendGenericResponse(w, false, http.StatusUnauthorized, false)
			return
		}
		// For any other error, return a bad request status
		SendGenericResponse(w, false, http.StatusBadRequest, false)
		return
	}

	sessionID := cookie.Value
	// We can get the session from the session manager
	session, ok := s.SM.Get(sessionID)
	if !ok || session.IsExpired() {
		// If the session is not found or is expired, return an unauthorized status
		SendGenericResponse(w, false, http.StatusUnauthorized, false)
		return
	}

	// If the session is valid, send a success response
	SendGenericResponse(w, true, http.StatusOK, session.UserID)
}
