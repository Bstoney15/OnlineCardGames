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
		// Development: cross-site cookie for localhost:5173 -> localhost:8080
		cookie.SameSite = http.SameSiteNoneMode
		cookie.Secure = true
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
