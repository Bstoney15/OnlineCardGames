// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains utility functions for cookie-based session authentication.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"net/http"
	"os"
)

// createCookie creates a new HTTP cookie for session management.
// It configures the cookie with appropriate security settings based on
// the environment (production vs development). In production, strict
// same-site and secure flags are enabled; in development, lax mode is used.
func createCookie(sessionID string) *http.Cookie {
	isProd := os.Getenv("PROD") == "true"

	cookie := http.Cookie{
		Name:     "sessionId",
		Value:    sessionID,
		HttpOnly: true,
		Path:     "/",
		MaxAge:   3600, // 1 hour
	}

	if isProd {
		// Production: same-site, secure cookie
		cookie.SameSite = http.SameSiteStrictMode
		cookie.Secure = true
	} else {
		// Development: Lax mode works for localhost without requiring HTTPS
		cookie.SameSite = http.SameSiteLaxMode
		cookie.Secure = false // Allow HTTP in development
	}

	return &cookie
}

// checkCookie validates the session cookie from an incoming HTTP request.
// It retrieves the session ID from the cookie, looks up the session in the
// session manager, and verifies it has not expired.
// Returns the user ID and true if valid, or 0 and false if invalid or missing.
func (s *Server) checkCookie(r *http.Request) (uint, bool) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			return 0, false
		}
		return 0, false
	}

	sessionID := cookie.Value
	session, ok := s.SM.Get(sessionID)
	if !ok || session.IsExpired() {
		return 0, false
	}

	return session.UserID, true
}
