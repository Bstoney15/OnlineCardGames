package server

import "net/http"


// handler func that gets a request and response objects. Write to response object to return objects to requster.
func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	// you can access s.db to do transactions on the db

	w.Write([]byte("logged in"))
}