/*
playerStatsHandler.go
Description: Handles calls from the frontend for player stats through the playerStatsHandler.

	Also handles requests for the leaderboard stats.

Created By: Ryan Grimsley
Date Created: 11/03/25
*/
package server

import (
	"cardgames/backend/models"
	"encoding/json"
	"net/http"
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

	// Calculate stats from wagers table
	var wagersPlaced int64
	var wagersWon int64
	var totalAmountWon int64

	s.DB.Model(&models.Wager{}).Where("account_id = ?", userID).Count(&wagersPlaced)
	s.DB.Model(&models.Wager{}).Where("account_id = ? AND wager_won = ?", userID, true).Count(&wagersWon)
	s.DB.Model(&models.Wager{}).Where("account_id = ?", userID).Select("COALESCE(SUM(amount_won), 0)").Scan(&totalAmountWon)

	wagersLost := wagersPlaced - wagersWon

	var winRate float32
	if wagersPlaced > 0 {
		winRate = (float32(wagersWon) / float32(wagersPlaced)) * 100
	} else {
		winRate = 0
	}

	//calculate stats (put others later instead of just balance)
	stats := map[string]interface{}{
		"balance":      account.Balance,
		"wins":         wagersWon,
		"losses":       wagersLost,
		"winRate":      winRate,
		"amountWon":    totalAmountWon,
		"wagersPlaced": wagersPlaced,
		"username":     account.Username,
	}

	SendGenericResponse(w, true, 200, stats)
}

type StatsRequest struct {
	Field string `json:"field"`
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
	if field == "" {
		field = "Balance"
	}

	// Define a struct to hold aggregated stats per account
	type AccountStats struct {
		ID           uint
		Username     string
		Balance      int
		WagersPlaced int64
		WagersWon    int64
		WagersLost   int64
		AmountWon    int64
	}

	// Get all accounts first
	var accounts []models.Account
	if err := s.DB.Find(&accounts).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "no accounts found")
		return
	}

	// Calculate stats for each account from wagers table
	var accountStats []AccountStats
	for _, acct := range accounts {
		var wagersPlaced int64
		var wagersWon int64
		var totalAmountWon int64

		s.DB.Model(&models.Wager{}).Where("account_id = ?", acct.ID).Count(&wagersPlaced)
		s.DB.Model(&models.Wager{}).Where("account_id = ? AND wager_won = ?", acct.ID, true).Count(&wagersWon)
		s.DB.Model(&models.Wager{}).Where("account_id = ?", acct.ID).Select("COALESCE(SUM(amount_won), 0)").Scan(&totalAmountWon)

		accountStats = append(accountStats, AccountStats{
			ID:           acct.ID,
			Username:     acct.Username,
			Balance:      acct.Balance,
			WagersPlaced: wagersPlaced,
			WagersWon:    wagersWon,
			WagersLost:   wagersPlaced - wagersWon,
			AmountWon:    totalAmountWon,
		})
	}

	// Sort by requested field
	switch field {
	case "Wagers_Won", "wins":
		for i := 0; i < len(accountStats)-1; i++ {
			for j := i + 1; j < len(accountStats); j++ {
				if accountStats[j].WagersWon > accountStats[i].WagersWon {
					accountStats[i], accountStats[j] = accountStats[j], accountStats[i]
				}
			}
		}
	case "Wagers_Lost", "losses":
		for i := 0; i < len(accountStats)-1; i++ {
			for j := i + 1; j < len(accountStats); j++ {
				if accountStats[j].WagersLost > accountStats[i].WagersLost {
					accountStats[i], accountStats[j] = accountStats[j], accountStats[i]
				}
			}
		}
	case "Amount_Won", "amountWon":
		for i := 0; i < len(accountStats)-1; i++ {
			for j := i + 1; j < len(accountStats); j++ {
				if accountStats[j].AmountWon > accountStats[i].AmountWon {
					accountStats[i], accountStats[j] = accountStats[j], accountStats[i]
				}
			}
		}
	case "Wagers_Placed", "wagersPlaced":
		for i := 0; i < len(accountStats)-1; i++ {
			for j := i + 1; j < len(accountStats); j++ {
				if accountStats[j].WagersPlaced > accountStats[i].WagersPlaced {
					accountStats[i], accountStats[j] = accountStats[j], accountStats[i]
				}
			}
		}
	default: // Balance
		for i := 0; i < len(accountStats)-1; i++ {
			for j := i + 1; j < len(accountStats); j++ {
				if accountStats[j].Balance > accountStats[i].Balance {
					accountStats[i], accountStats[j] = accountStats[j], accountStats[i]
				}
			}
		}
	}

	// Limit to top 5
	if len(accountStats) > 5 {
		accountStats = accountStats[:5]
	}

	stats := make(map[string]interface{})

	for i := 0; i < len(accountStats); i++ {
		stats["act"+strconv.Itoa(i)+"_balance"] = accountStats[i].Balance
		stats["act"+strconv.Itoa(i)+"_wins"] = accountStats[i].WagersWon
		stats["act"+strconv.Itoa(i)+"_losses"] = accountStats[i].WagersLost
		stats["act"+strconv.Itoa(i)+"_amountWon"] = accountStats[i].AmountWon
		stats["act"+strconv.Itoa(i)+"_wagersPlaced"] = accountStats[i].WagersPlaced
		stats["act"+strconv.Itoa(i)+"_username"] = accountStats[i].Username
	}

	SendGenericResponse(w, true, 200, stats)
}
