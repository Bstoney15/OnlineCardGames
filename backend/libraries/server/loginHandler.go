package server

import (
	"encoding/json"
	"net/http"

	"cardgames/backend/models"
	"golang.org/x/crypto/bcrypt"
)


// handler func that gets a request and response objects. Write to response object to return objects to requster.
func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, "email = ?", req.Email).Error; err != nil {
		SendGenericResponse(w, false, http.StatusUnauthorized, "invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(req.Password)); err != nil {
		SendGenericResponse(w, false, http.StatusUnauthorized, "invalid credentials")
		return
	}

	session, active := s.SM.CheckIfActiveSession(account.ID)
	if !active {
		sessionCookie := createCookie(s.SM.Create(account.ID))
		http.SetCookie(w, sessionCookie)
	} else {
		sessionCookie := createCookie(session.SessionID)
		http.SetCookie(w, sessionCookie)
	}

	SendGenericResponse(w, true, http.StatusOK, nil)
}
