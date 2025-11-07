package server

import (
	"encoding/json"
	"net/http"

	"cardgames/backend/models"
)

// small helper struct for POST body
type addCurrencyRequest struct {
	Amount int `json:"amount"`
}

// helper to send a consistent error
func sendUnauthorized(w http.ResponseWriter) {
	http.Error(w, "unauthorized", http.StatusUnauthorized)
}

// getUserIDFromRequest pulls the session cookie and looks it up in the SessionManager
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

// GET /api/currency
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

	// reuse your generic response style
	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
	})
}

// POST /api/currency/add
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
		http.Error(w, "amount must be > 0", http.StatusBadRequest)
		return
	}

	// load user
	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	// update balance
	account.Balance = account.Balance + body.Amount
	if err := s.DB.Save(&account).Error; err != nil {
		http.Error(w, "could not update balance", http.StatusInternalServerError)
		return
	}

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"message": "currency added",
		"balance": account.Balance,
	})
}
