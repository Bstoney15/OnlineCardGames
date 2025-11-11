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
	Username string `json:"username"`
}

type RegisterResponse struct {
	Email   string `json:"email"`
	Balance int    `json:"balance"`
}

// registerHandler creates a new user account
func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { // can be set in the router and probably should be
		SendGenericResponse(w, false, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid request")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "error creating user")
		return
	}

	account := models.Account{
		Email:        req.Email,
		PasswordHash: string(hashed),
		Balance:      100,
		Username:     req.Username,
	}

	if err := s.DB.Create(&account).Error; err != nil {
		SendGenericResponse(w, false, http.StatusConflict, "email already exists")
		return
	}

	log.Printf("Created new user: %s", account.Email)

	res := RegisterResponse{
		Email:   account.Email,
		Balance: account.Balance,
	}

	cookie := createCookie(s.SM.Create(account.ID))
	http.SetCookie(w, cookie)

	SendGenericResponse(w, true, http.StatusCreated, res)
}
