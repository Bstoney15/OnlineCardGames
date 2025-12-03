// Package server provides HTTP handlers and server functionality for the dealing with currency.
// This file contains utility functions and handelrs for adding and gettin currency.
//
// Author: Abdelrahman Zeidan, Connor Williamson
// Date: 2025-11-08

package server

import (
	"encoding/json"
	"net/http"

	"cardgames/backend/models"
)

// addCurrencyRequest represents the expected JSON body for adding currency.
type addCurrencyRequest struct {
	Amount int `json:"amount"`
}

// sendUnauthorized sends a standardized unauthorized response.
func sendUnauthorized(w http.ResponseWriter) {
	http.Error(w, "unauthorized", http.StatusUnauthorized)
}

// getUserIDFromRequest determines the user ID associated with a request.
// When DEV_MODE is true, this function always returns user ID 1 to bypass authentication.
func (s *Server) getUserIDFromRequest(r *http.Request) (uint, bool) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		return 0, false
	}

	data, ok := s.SM.Get(cookie.Value)
	if !ok {
		return 0, false
	}

	return data.UserID, true
}

// getCurrencyHandler handles GET /api/currency.
// It returns the user's current balance.
func (s *Server) getCurrencyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
	})
}

// addCurrencyHandler handles POST /api/currency/add.
// It increases the user's balance by the specified amount.
func (s *Server) addCurrencyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var body addCurrencyRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	if body.Amount <= 0 {
		http.Error(w, "amount must be greater than 0", http.StatusBadRequest)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	account.Balance += body.Amount
	if err := s.DB.Save(&account).Error; err != nil {
		http.Error(w, "could not update balance", http.StatusInternalServerError)
		return
	}

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"message": "currency added",
		"balance": account.Balance,
	})
}
