package server

import (
	"cardgames/backend/libraries/blackjack"
	"log"
	"net/http"

	"golang.org/x/net/websocket"
)

func (s *Server) blackJackWSHandler(w http.ResponseWriter, r *http.Request) {
	// Implementation for handling WebSocket connections for BlackJack game
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

	game := s.GIM.GetGame(gameID)
	if game == nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	player := game.AddPlayer(userID)
	if player == nil {
		http.Error(w, "Unable to join game", http.StatusForbidden)
		log.Println("Unable to join game")
		return
	}

	wsLogic := func(ws *websocket.Conn) {
		defer ws.Close()
		defer game.MarkPlayerDisconnected(player.ID)

		cookie, _ := r.Cookie("sessionId")

		game.FirstBroadcastUpdate()

		// Here you would implement the logic to handle the BlackJack game over WebSocket
		// This is a placeholder for the actual game handling code

		done := make(chan struct{})

		// Goroutine to read from WebSocket
		go func() {
			defer close(done)
			for {
				var msg blackjack.IncomingUpdate
				if err := websocket.JSON.Receive(ws, &msg); err != nil {
					// WebSocket closed or error
					return
				}
				// Set the PlayerID from the authenticated user, not from the client
				msg.PlayerID = userID

				// Refresh user session on activity
				if cookie != nil {
					s.SM.Get(cookie.Value)
				}

				// Non-blocking send to player's incoming channel
				select {
				case player.Incoming <- msg:
				default:
					// Channel full or closed, skip
				}
			}
		}()

		for {
			select {
			case <-done:
				// WebSocket read goroutine exited
				return
			case update, ok := <-player.Outgoing:
				if !ok {
					// Channel closed (player reconnected elsewhere)
					return
				}
				if err := websocket.JSON.Send(ws, update); err != nil {
					return
				}
			}
		}
	}

	websocket.Handler(wsLogic).ServeHTTP(w, r)

}
