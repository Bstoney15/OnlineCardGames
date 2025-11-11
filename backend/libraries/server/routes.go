package server

// setupRoutes registers all the HTTP handlers for the server.
func (s *Server) setupRoutes() {
	s.Router.HandleFunc("GET /api/ping", s.pingHandler)

	s.Router.HandleFunc("POST /api/register", s.registerHandler)
	s.Router.HandleFunc("POST /api/login", s.loginHandler)

	s.Router.HandleFunc("GET /api/leaderboards", s.pingHandler)// needs to be implemented

	// Routes that require auth go down here. 
	s.Router.HandleFunc("GET /api/auth", s.authHandler)
	s.Router.HandleFunc("GET /api/active-players", s.activePlayersHandler)

	s.Router.HandleFunc("POST /api/lobby", s.lobbyHandler)
	s.Router.HandleFunc("GET /api/ws/BlackJack/{gameID}", s.blackJackWSHandler)

	s.Router.HandleFunc("/api/currency", s.getCurrencyHandler)
	s.Router.HandleFunc("/api/currency/add", s.addCurrencyHandler)

	s.Router.HandleFunc("GET /api/player-stats", s.playerStatsHandler)
	s.Router.HandleFunc("GET /api/leaderboard-stats", s.leaderboardStatsHandler)
}
