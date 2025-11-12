package server

import (
	"cardgames/backend/models"
	"net/http"
	"fmt"
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
	var winRate float32
	if account.WagersPlaced > 0 {
		winRate = (float32(account.WagersWon) / float32(account.WagersPlaced)) * 100
	} else {
		winRate = 0
	}

	//calculate stats (put others later instead of just balance)
	stats := map[string]interface{}{
		"balance":      account.Balance,
		"wins":         account.WagersWon,
		"losses":       account.WagersLost,
		"winRate":      winRate,
		"amountWon":    account.AmountWon,
		"wagersPlaced": account.WagersPlaced,
		"username":     account.Username,
	}

	SendGenericResponse(w, true, 200, stats)
}

// handler to get players stats and return them for player stats page
func (s *Server) leaderboardStatsHandler(w http.ResponseWriter, r *http.Request) {
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

	// TODO: return different leaderboards depending on the request, once other stats are available

	// query for stats based on user id
	var field string = r.Header.Get("Field")
	fmt.Print("String: ")
	fmt.Print(field)
	fmt.Print("\n")
	fmt.Print("Request Header: ")
	fmt.Print(r.Header)
	fmt.Print("\n")
	if(field==""){
		field = "Balance"
	}
	fmt.Print("String: ")
	fmt.Print(field)
	fmt.Print("\n")
	var acct_rows []models.Account

	{
		err = s.DB.Raw("SELECT * FROM `accounts` WHERE `accounts`.`deleted_at` IS NULL ORDER BY " + field + " DESC LIMIT 5").Scan(&acct_rows).Error
		if err != nil{
			SendGenericResponse(w, false, http.StatusNotFound, "no accounts found")
			return
		}

		stats := map[string]interface{}{
			"act0_balance":      acct_rows[0].Balance,
			"act0_wins":         acct_rows[0].WagersWon,
			"act0_losses":       acct_rows[0].WagersLost,
			"act0_amountWon":    acct_rows[0].AmountWon,
			"act0_wagersPlaced": acct_rows[0].WagersPlaced,
			"act0_username":     acct_rows[0].Username,

			"act1_balance":      acct_rows[1].Balance,
			"act1_wins":         acct_rows[1].WagersWon,
			"act1_losses":       acct_rows[1].WagersLost,
			"act1_amountWon":    acct_rows[1].AmountWon,
			"act1_wagersPlaced": acct_rows[1].WagersPlaced,
			"act1_username":     acct_rows[1].Username,

			"act2_balance":      acct_rows[2].Balance,
			"act2_wins":         acct_rows[2].WagersWon,
			"act2_losses":       acct_rows[2].WagersLost,
			"act2_amountWon":    acct_rows[2].AmountWon,
			"act2_wagersPlaced": acct_rows[2].WagersPlaced,
			"act2_username":     acct_rows[2].Username,

			"act3_balance":      acct_rows[3].Balance,
			"act3_wins":         acct_rows[3].WagersWon,
			"act3_losses":       acct_rows[3].WagersLost,
			"act3_amountWon":    acct_rows[3].AmountWon,
			"act3_wagersPlaced": acct_rows[3].WagersPlaced,
			"act3_username":     acct_rows[3].Username,

			"act4_balance":      acct_rows[4].Balance,
			"act4_wins":         acct_rows[4].WagersWon,
			"act4_losses":       acct_rows[4].WagersLost,
			"act4_amountWon":    acct_rows[4].AmountWon,
			"act4_wagersPlaced": acct_rows[4].WagersPlaced,
			"act4_username":     acct_rows[4].Username,
		}

		fmt.Print("Ret:")
		fmt.Print(  stats )
		fmt.Print("\n")
		fmt.Print("----------------------------------\n")

		SendGenericResponse(w, true, 200, stats)
	}
}