package server

import (
	"net/http"
	"golang.org/x/net/websocket"
	"cardgames/backend/libraries/blackjack"
)


func (s *Server) blackJackWSHandler(w http.ResponseWriter, r *http.Request) {
	// Implementation for handling WebSocket connections for BlackJack game
	userID, isAuth := s.checkCookie(r)
	if !isAuth {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	gameID := r.URL.Query().Get("gameID")
	if gameID == "" {
		http.Error(w, "gameID is required", http.StatusBadRequest)
		return
	}

	game := s.GIM.GetGame(gameID)
	if game == nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	player := game.AddPlayer(userID)

	if player == nil {
		http.Error(w, "Unable to join game", http.StatusForbidden)
		return
	}	

	wsLogic := func(ws *websocket.Conn) {
		defer ws.Close()

		// Here you would implement the logic to handle the BlackJack game over WebSocket
		// This is a placeholder for the actual game handling code

		done := make(chan struct{})
		incoming := make(chan blackjack.IncomingUpdate)

		go func() {
			defer close(done)
			for {
				var msg blackjack.IncomingUpdate
				if err := websocket.JSON.Receive(ws, &msg); err != nil {
					continue
				}
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
					player.Incoming <- msg
			}

		}
	}

	websocket.Handler(wsLogic).ServeHTTP(w, r)
}