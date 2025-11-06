package server

import (
	"net/http"
)

// createSession creates a new session and sets the session cookie.
func createSession(w http.ResponseWriter, sessionID string) {
	cookie := http.Cookie{
		Name:     "sessionId",
		Value:    sessionID,
		HttpOnly: true,
		Path:     "/",
		MaxAge:   3600, // 1 hour
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	http.SetCookie(w, &cookie)
}