package server

import (
	"net/http"
)

func (s *Server) activePlayersHandler(w http.ResponseWriter, r *http.Request) {
	activeSessions := s.SM.ActiveSessions()
	SendGenericResponse(w, true, http.StatusOK, activeSessions)
}
