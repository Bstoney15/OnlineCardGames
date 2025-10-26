package server

import (
	"encoding/json"
	"log"
	"net/http"

	"cardgames/backend/models"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterResponse struct {
	Email   string `json:"email"`
	Balance int    `json:"balance"`
}

// registerHandler creates a new user account
func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { // can be set in the router and probably should be
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "error creating user", http.StatusInternalServerError)
		return
	}

	account := models.Account{
		Email:        req.Email,
		PasswordHash: string(hashed),
		Balance:      100,
	}

	if err := s.DB.Create(&account).Error; err != nil {
		http.Error(w, "email already exists", http.StatusConflict)
		return
	}

	log.Printf("Created new user: %s", account.Email)

	res := RegisterResponse{
		Email:   account.Email,
		Balance: account.Balance,
	}

	createSession(w, s.SM.Create(account.ID))

	SendGenericResponse(w, true, http.StatusCreated, res)
}
