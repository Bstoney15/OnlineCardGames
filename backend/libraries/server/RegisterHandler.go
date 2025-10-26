package server

import (
	"encoding/json"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"cardgames/backend/models"
)

// registerHandler creates a new user account
func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"email":   account.Email,
		"balance": account.Balance,
	})
}
