/*
getFriendsHandler.go
Description: Handles requests to get list of user friends.
Created by: Ryan Grimsley
Date Created: 11/18/25
*/
package server

import (
	"cardgames/backend/models"

	"net/http"
)

func (s *Server) getFriendsHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("sessionId")
	// check error in cookie
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		// else, return generic error
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	sessionId := cookie.Value
	// get session from session manager
	session, ok := s.SM.Get(sessionId)
	// if session not ok or expired
	if !ok || session.IsExpired() {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	//get userId from session
	userId := session.UserID
	var friends []models.Friend
	//query for accepted friends where user is either the sender or receiver
	if err := s.DB.Where("(user_id = ? OR friend_id = ?) AND status = ?", userId, userId, "accepted").Find(&friends).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "UserId not found in friends table")
		return
	}
	// friendIds := make([]uint, 0, len(friends))
	// // collect friend ids
	// for _, friend := range friends {
	// 	friendIds = append(friendIds, friend.FriendID)
	// }
	// // query account to get usernames tied to friendIds
	// var friendAccounts []models.Account
	// if err := s.DB.Where("id IN ?", friendIds).Find(&friendAccounts).Error; err != nil {
	// 	SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to fetch friends")
	// 	return
	// }

	// friendList := make([]map[string]interface{}, 0, len(friendAccounts))
	// for _, account := range friendAccounts {
	// 	friendList = append(friendList, map[string]interface{}{
	// 		"id":       account.ID,
	// 		"username": account.Username,
	// 	})
	// }

	// SendGenericResponse(w, true, http.StatusOK, friendList)

	//Collect all friend IDs from the Friend records
	friendIDs := make([]uint, 0, len(friends))
	for _, f := range friends {
		// Add the friend ID that is not the current user
		if f.UserID == userId {
			friendIDs = append(friendIDs, f.FriendID)
		} else {
			friendIDs = append(friendIDs, f.UserID)
		}
	}

	// Query the Account table to get usernames for each friendID
	var friendAccounts []models.Account
	if len(friendIDs) > 0 {
		if err := s.DB.Where("id IN ?", friendIDs).Find(&friendAccounts).Error; err != nil {
			SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to fetch friend usernames")
			return
		}
	}

	//Build array of usernames (with ids, join dates, and stats)
	friendList := make([]map[string]interface{}, 0, len(friendAccounts))
	for _, acc := range friendAccounts {
		winRate := 0.0
		if acc.WagersPlaced > 0 {
			winRate = (float64(acc.WagersWon) / float64(acc.WagersPlaced)) * 100
		}
		friendList = append(friendList, map[string]interface{}{
			"id":           acc.ID,
			"username":     acc.Username,
			"createdAt":    acc.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			"wagersPlaced": acc.WagersPlaced,
			"winRate":      winRate,
		})
	}

	SendGenericResponse(w, true, http.StatusOK, friendList)
}
