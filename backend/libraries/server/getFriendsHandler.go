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
	//query for friends based on userID
	// ! might want to update to query for where UserID=userId and FriendID=userId,
	// 		im not sure if the table will have all a users friends under just their UserID
	if err := s.DB.Where(&models.Friend{UserID: userId}).Find(&friends).Error; err != nil {
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
		friendIDs = append(friendIDs, f.FriendID)
	}

	// Query the Account table to get usernames for each friendID
	var friendAccounts []models.Account
	if len(friendIDs) > 0 {
		if err := s.DB.Where("id IN ?", friendIDs).Find(&friendAccounts).Error; err != nil {
			SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to fetch friend usernames")
			return
		}
	}

	//Build array of usernames (with ids optionally)
	friendList := make([]map[string]interface{}, 0, len(friendAccounts))
	for _, acc := range friendAccounts {
		friendList = append(friendList, map[string]interface{}{
			"id":       acc.ID,
			"username": acc.Username,
		})
	}

	SendGenericResponse(w, true, http.StatusOK, friendList)
}
