// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains the handler for game lobby operations including joining and creating games.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"encoding/json"
	"net/http"
)

// LobbyRequest represents the JSON request body for lobby operations.
// It specifies the game type and visibility (public or private) for the game.
type LobbyRequest struct {
	Game       string `json:"game"`
	Visibility string `json:"visibility"`
}

// lobbyHandler handles requests to join or create game lobbies.
// It authenticates the user, parses the request for game type and visibility,
// then either finds an available public game or creates a new private game.
// Returns the game ID on success for the client to connect via WebSocket.
func (s *Server) lobbyHandler(w http.ResponseWriter, r *http.Request) {
	_, ok := s.checkCookie(r)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var req LobbyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid request")
		return
	}

	switch req.Game {
	case "blackjack":

		switch req.Visibility {
		case "public":

			id, err := s.GIM.FindAvailablePublicGame()
			if err != nil {
				SendGenericResponse(w, false, http.StatusInternalServerError, "could not create or find game")
				return
			}
			SendGenericResponse(w, true, http.StatusOK, map[string]string{"gameId": id})
			return
		case "private":

			id, err := s.GIM.CreatePrivateGame()
			if err != nil {
				SendGenericResponse(w, false, http.StatusInternalServerError, "could not create game")
				return
			}
			SendGenericResponse(w, true, http.StatusOK, map[string]string{"gameId": id})
			return

		default:
			SendGenericResponse(w, false, http.StatusBadRequest, "invalid visibility")
			return
		}

	default:
		SendGenericResponse(w, false, http.StatusBadRequest, "unsupported game")
		return
	}
}
