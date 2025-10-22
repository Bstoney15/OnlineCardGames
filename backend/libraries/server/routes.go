package server

// setupRoutes registers all the HTTP handlers for the server.
func (s *Server) setupRoutes() {
	s.Router.HandleFunc("/ping", s.pingHandler)

	
}
