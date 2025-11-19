package server

import (
	"net/http"
	"encoding/json"
)

type LobbyRequest struct {
	Game      string `json:"game"`
	Visibility string `json:"visibility"`
}


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

		case "baccarat":

			switch req.Visibility {
			case "public":

				id, err := s.GIM.FindAvailablePublicBaccaratGame()
				if err != nil {
					SendGenericResponse(w, false, http.StatusInternalServerError, "could not create or find game")
					return
				}
				SendGenericResponse(w, true, http.StatusOK, map[string]string{"gameId": id})
				return
			case "private":

				id, err := s.GIM.CreatePrivateBaccaratGame()
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