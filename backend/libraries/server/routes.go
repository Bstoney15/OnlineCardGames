package server

// setupRoutes registers all the HTTP handlers for the server.
func (s *Server) setupRoutes() {
	s.Router.HandleFunc("/ping", s.pingHandler)

	s.Router.HandleFunc("/register", s.registerHandler)
	s.Router.HandleFunc("/login", s.loginHandler)

}
