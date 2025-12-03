// Author: Abdelrahman Zeidan
//Date: October 22, 2025
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

// Handles creating a new user account
func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	// Ensures the route only accepts POST
	if r.Method != http.MethodPost {
		SendGenericResponse(w, false, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	// Reads the incoming JSON request
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid request")
		return
	}

	// Hashes the user's password before saving
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "error creating user")
		return
	}

	// Builds the account model that will be stored in the database
	account := models.Account{
		Email:        req.Email,
		PasswordHash: string(hashed),
		Balance:      100,
		Username:     req.Username,
	}

	// Attempts to write the new account to the database
	if err := s.DB.Create(&account).Error; err != nil {
		SendGenericResponse(w, false, http.StatusConflict, "email already exists")
		return
	}

	log.Printf("Created new user: %s", account.Email)

	// Builds the response returned after registration
	res := RegisterResponse{
		Email:   account.Email,
		Balance: account.Balance,
	}

	// Creates a session cookie for the new user
	cookie := createCookie(s.SM.Create(account.ID))
	http.SetCookie(w, cookie)

	// Sends success response
	SendGenericResponse(w, true, http.StatusCreated, res)
}
