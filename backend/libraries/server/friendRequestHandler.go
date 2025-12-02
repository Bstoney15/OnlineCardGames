package server

import (
	"cardgames/backend/models"
	"encoding/json"
	"net/http"
)

// sendFriendRequestHandler handles sending a friend request to another user
func (s *Server) sendFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	
	sessionId := cookie.Value
	session, ok := s.SM.Get(sessionId)
	if !ok || session.IsExpired() {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	
	userId := session.UserID
	
	// Parse request body to get target username
	var reqBody struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	// Find the target user by username
	var targetAccount models.Account
	if err := s.DB.Where("username = ?", reqBody.Username).First(&targetAccount).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "User not found")
		return
	}
	
	// Check if user is trying to add themselves
	if targetAccount.ID == userId {
		SendGenericResponse(w, false, http.StatusBadRequest, "Cannot send friend request to yourself")
		return
	}
	
	// Check if friendship already exists (in either direction)
	var existingFriend models.Friend
	err = s.DB.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userId, targetAccount.ID, targetAccount.ID, userId,
	).First(&existingFriend).Error
	
	if err == nil {
		// Friendship exists
		if existingFriend.Status == "accepted" {
			SendGenericResponse(w, false, http.StatusConflict, "Already friends")
			return
		}
		SendGenericResponse(w, false, http.StatusConflict, "Friend request already sent")
		return
	}
	
	// Create new friend request
	newFriend := models.Friend{
		UserID:   userId,
		FriendID: targetAccount.ID,
		Status:   "pending",
	}
	
	if err := s.DB.Create(&newFriend).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to send friend request")
		return
	}
	
	SendGenericResponse(w, true, http.StatusOK, "Friend request sent")
}

// acceptFriendRequestHandler handles accepting a friend request
func (s *Server) acceptFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	
	sessionId := cookie.Value
	session, ok := s.SM.Get(sessionId)
	if !ok || session.IsExpired() {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	
	userId := session.UserID
	
	// Parse request body to get friend request ID
	var reqBody struct {
		RequestID uint `json:"requestId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	// Find the friend request
	var friendRequest models.Friend
	if err := s.DB.Where("id = ? AND friend_id = ? AND status = ?", reqBody.RequestID, userId, "pending").First(&friendRequest).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "Friend request not found")
		return
	}
	
	// Update status to accepted
	friendRequest.Status = "accepted"
	if err := s.DB.Save(&friendRequest).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to accept friend request")
		return
	}
	
	SendGenericResponse(w, true, http.StatusOK, "Friend request accepted")
}

// rejectFriendRequestHandler handles rejecting a friend request
func (s *Server) rejectFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	
	sessionId := cookie.Value
	session, ok := s.SM.Get(sessionId)
	if !ok || session.IsExpired() {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	
	userId := session.UserID
	
	// Parse request body to get friend request ID
	var reqBody struct {
		RequestID uint `json:"requestId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	// Find and delete the friend request
	result := s.DB.Where("id = ? AND friend_id = ? AND status = ?", reqBody.RequestID, userId, "pending").Delete(&models.Friend{})
	if result.Error != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to reject friend request")
		return
	}
	if result.RowsAffected == 0 {
		SendGenericResponse(w, false, http.StatusNotFound, "Friend request not found")
		return
	}
	
	SendGenericResponse(w, true, http.StatusOK, "Friend request rejected")
}

// getPendingRequestsHandler returns all pending friend requests for the current user
func (s *Server) getPendingRequestsHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	
	sessionId := cookie.Value
	session, ok := s.SM.Get(sessionId)
	if !ok || session.IsExpired() {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	
	userId := session.UserID
	
	// Get all pending requests where the current user is the recipient
	var pendingRequests []models.Friend
	if err := s.DB.Where("friend_id = ? AND status = ?", userId, "pending").Find(&pendingRequests).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to fetch pending requests")
		return
	}
	
	// Get usernames for all pending requests
	senderIds := make([]uint, 0, len(pendingRequests))
	for _, req := range pendingRequests {
		senderIds = append(senderIds, req.UserID)
	}
	
	var senderAccounts []models.Account
	if len(senderIds) > 0 {
		if err := s.DB.Where("id IN ?", senderIds).Find(&senderAccounts).Error; err != nil {
			SendGenericResponse(w, false, http.StatusInternalServerError, "Failed to fetch sender information")
			return
		}
	}
	
	// Build response with usernames
	requestList := make([]map[string]interface{}, 0, len(pendingRequests))
	for _, req := range pendingRequests {
		for _, acc := range senderAccounts {
			if acc.ID == req.UserID {
				requestList = append(requestList, map[string]interface{}{
					"requestId": req.ID,
					"userId":    acc.ID,
					"username":  acc.Username,
				})
				break
			}
		}
	}
	
	SendGenericResponse(w, true, http.StatusOK, requestList)
}
