package server

import (
	"net/http"
	"os"
)

// createSession creates a new session and sets the session cookie.
func createSession(w http.ResponseWriter, sessionID string) {
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
		// Development: cross-site cookie for localhost:5173 -> localhost:8080
		cookie.SameSite = http.SameSiteNoneMode
		cookie.Secure = true
	}

	http.SetCookie(w, &cookie)
}
