package server

import (
	"cardgames/backend/models"
	"net/http"
)

// handler to get players stats and return them for player stats page
func (s *Server) playerStatsHandler(w http.ResponseWriter, r *http.Request) {
	// get player stats from database here

	// get session cookie (same as authHandler)
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			// If the cookie is not set, return an unauthorized status
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		// For any other error, return a bad request status
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	sessionID := cookie.Value

	// We can get the session from the session manager
	session, ok := s.SM.Get(sessionID)
	if !ok || session.IsExpired() {
		// If the session is not found or is expired, return an unauthorized status
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// get userId from session
	userID := session.UserID
	// query for stats based on user id
	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "user not found")
		return
	}
	//calculate stats (put others later instead of just balance)
	stats := map[string]interface{}{
		"balance": account.Balance,
		// "wins": ...,
		// "losses": ...,
		// "winRate": ...,
		// "amountWon": ...,
	}

	SendGenericResponse(w, true, 200, stats)
}
