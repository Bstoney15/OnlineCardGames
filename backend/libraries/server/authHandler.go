package server

import (
	"net/http"
)

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
	SendGenericResponse(w, true, http.StatusOK, true)
}
