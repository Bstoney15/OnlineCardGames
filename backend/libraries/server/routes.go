package server

// setupRoutes registers all the HTTP handlers for the server.
func (s *Server) setupRoutes() {
	s.Router.HandleFunc("/api/ping", s.pingHandler)

	s.Router.HandleFunc("/api/register", s.registerHandler)
	s.Router.HandleFunc("/api/login", s.loginHandler)

	s.Router.HandleFunc("/api/leaderboards", s.pingHandler)// needs to be implemented

	// Routes that require auth go down here. 
	s.Router.HandleFunc("/api/auth", s.authHandler)
	s.Router.HandleFunc("/api/active-players", s.activePlayersHandler)

	s.Router.HandleFunc("/api/get-blackjack-lobby", s.pingHandler)

}
