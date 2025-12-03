// Package server provides HTTP handlers and server functionality for the card games application.
// This file defines the HTTP route configuration for all API endpoints.
//
// Author: Multiple Contributors
// Date: 2025-11-06
package server

// setupRoutes registers all the HTTP handlers for the server.
// It configures routes for authentication, game lobbies, WebSocket connections,
// currency management, player statistics, user information, and store operations.
func (s *Server) setupRoutes() {
	s.Router.HandleFunc("POST /api/register", s.registerHandler)
	s.Router.HandleFunc("POST /api/login", s.loginHandler)
	s.Router.HandleFunc("POST /api/logout", s.logoutHandler)

	// Routes that require auth go down here.
	s.Router.HandleFunc("GET /api/auth", s.authHandler)
	s.Router.HandleFunc("GET /api/active-players", s.activePlayersHandler)

	s.Router.HandleFunc("POST /api/lobby", s.lobbyHandler)
	s.Router.HandleFunc("GET /api/ws/BlackJack/{gameID}", s.blackJackWSHandler)

	s.Router.HandleFunc("/api/currency", s.getCurrencyHandler)
	s.Router.HandleFunc("/api/currency/add", s.addCurrencyHandler)

	s.Router.HandleFunc("GET /api/player-stats", s.playerStatsHandler)
	s.Router.HandleFunc("POST /api/leaderboard-stats", s.leaderboardStatsHandler)

	s.Router.HandleFunc("GET /api/user-info", s.userInfoHandler)

	s.Router.HandleFunc("GET /api/user-friends", s.getFriendsHandler)

	s.Router.HandleFunc("GET /api/getOwned", s.getOwnedHandler)
	s.Router.HandleFunc("GET /api/getEquipped", s.getEquippedHandler)

	s.Router.HandleFunc("/api/get-equipped", s.getEquippedHandler)
	s.Router.HandleFunc("/api/get-owned", s.getOwnedHandler)
	s.Router.HandleFunc("/api/store/buy", s.buyItemHandler)
	s.Router.HandleFunc("/api/store/lootbox", s.lootboxHandler)

}
