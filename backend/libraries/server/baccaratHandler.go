package server

import (
	"cardgames/backend/libraries/baccarat"
	"log"
	"net/http"

	"golang.org/x/net/websocket"
)

func (s *Server) baccaratWSHandler(w http.ResponseWriter, r *http.Request) {
	// Implementation for handling WebSocket connections for Baccarat game
	userID, isAuth := s.checkCookie(r)
	if !isAuth {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		log.Println("Unauthorized WebSocket connection attempt")
		return
	}

	gameID := r.PathValue("gameID")
	if gameID == "" {
		http.Error(w, "gameID is required", http.StatusBadRequest)
		return
	}

	game := s.GIM.GetBaccaratGame(gameID)
	if game == nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	wsLogic := func(ws *websocket.Conn) {
		defer ws.Close()

		player := game.AddPlayer(userID)
		if player == nil {
			http.Error(w, "Unable to join game", http.StatusForbidden)
			return
		}

		cookie, _ := r.Cookie("sessionId")

		game.FirstBroadcastUpdate()

		done := make(chan struct{})
		incoming := make(chan baccarat.IncomingUpdate)

		go func() {
			defer close(done)
			for {
				var msg baccarat.IncomingUpdate
				if err := websocket.JSON.Receive(ws, &msg); err != nil {
					continue
				}
				// Set the PlayerID from the authenticated user, not from the client
				msg.PlayerID = userID
				incoming <- msg
			}
		}()

		for {
			select {
			case update := <-player.Outgoing:
				if err := websocket.JSON.Send(ws, update); err != nil {
					return
				}
			case msg := <-incoming:
				s.SM.Get(cookie.Value) // refresh user session
				player.Incoming <- msg
			}

		}
	}

	websocket.Handler(wsLogic).ServeHTTP(w, r)

}
