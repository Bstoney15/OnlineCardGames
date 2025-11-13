package server

import (
	"net/http"
	"os"
)

// createSession creates a new session and sets the session cookie.
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
