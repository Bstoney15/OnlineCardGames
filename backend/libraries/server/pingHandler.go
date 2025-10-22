package server

import "net/http"

// handler func that gets a request and response objects. Write to response object to return objects to requster.
func (s *Server) pingHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("pong"))
}
