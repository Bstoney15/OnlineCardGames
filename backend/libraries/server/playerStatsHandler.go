package server

import (
	"cardgames/backend/models"
	"net/http"
	"encoding/json"
	"strconv"
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


type StatsRequest struct {
	Field      string `json:"field"`
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
	var req StatsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid request")
		return
	}

	// query for stats based on user id
	var field string = req.Field
	if(field==""){
		field = "Balance"
	}
	var acct_rows []models.Account

	{
		err = s.DB.Raw("SELECT * FROM `accounts` WHERE `accounts`.`deleted_at` IS NULL ORDER BY " + field + " DESC LIMIT 5").Scan(&acct_rows).Error
		if err != nil{
			SendGenericResponse(w, false, http.StatusNotFound, "no accounts found")
			return
		}

		stats := make(map[string]interface{})

		for i:=0; i< len(acct_rows); i++ {
			stats["act" + strconv.Itoa(i) + "_balance"]=       acct_rows[i].Balance
			stats["act" + strconv.Itoa(i) + "_wins"]=          acct_rows[i].WagersWon
			stats["act" + strconv.Itoa(i) + "_losses"]=        acct_rows[i].WagersLost
			stats["act" + strconv.Itoa(i) + "_amountWon"]=     acct_rows[i].AmountWon
			stats["act" + strconv.Itoa(i) + "_wagersPlaced"]=  acct_rows[i].WagersPlaced
			stats["act" + strconv.Itoa(i) + "_username"]=      acct_rows[i].Username
		}

		SendGenericResponse(w, true, 200, stats)
	}
}