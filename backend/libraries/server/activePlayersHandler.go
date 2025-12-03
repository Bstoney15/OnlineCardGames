// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains the handler for retrieving active players in the system.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"net/http"
)

// activePlayersHandler handles requests to retrieve the list of currently active players.
// It queries the session manager for all active sessions and returns them in the response.
func (s *Server) activePlayersHandler(w http.ResponseWriter, r *http.Request) {
	activeSessions := s.SM.ActiveSessions()
	SendGenericResponse(w, true, http.StatusOK, activeSessions)
}
