package server

import (
	"net/http"

	"cardgames/backend/models"
)

// userInfoHandler handles requests for user information.
func (s *Server) userInfoHandler(w http.ResponseWriter, r *http.Request) {
	id, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, id).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	SendGenericResponse(w, true, 200, account)
}
