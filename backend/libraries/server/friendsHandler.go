package server

import (
	"cardgames/backend/models"
	"encoding/json"
	"net/http"
	"strconv"
)

// SendFriendRequest handles sending a friend request
func (s *Server) sendFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		FriendUsername string `json:"friendUsername"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid request")
		return
	}

	// Find the friend by username
	var friendAccount models.Account
	if err := s.DB.Where("username = ?", req.FriendUsername).First(&friendAccount).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "user not found")
		return
	}

	// Don't allow sending request to yourself
	if friendAccount.ID == userID {
		SendGenericResponse(w, false, http.StatusBadRequest, "cannot add yourself as friend")
		return
	}

	// Check if friendship already exists
	var existingFriend models.Friend
	err := s.DB.Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", 
		userID, friendAccount.ID, friendAccount.ID, userID).First(&existingFriend).Error
	
	if err == nil {
		SendGenericResponse(w, false, http.StatusConflict, "friend request already exists")
		return
	}

	// Create friend request
	friendship := models.Friend{
		UserID:   userID,
		FriendID: friendAccount.ID,
		Status:   models.FriendStatusPending,
	}

	if err := s.DB.Create(&friendship).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to send friend request")
		return
	}

	SendGenericResponse(w, true, http.StatusOK, "friend request sent")
}

// AcceptFriendRequest handles accepting a friend request
func (s *Server) acceptFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	friendshipIDStr := r.PathValue("id")
	friendshipID, err := strconv.ParseUint(friendshipIDStr, 10, 32)
	if err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid friendship id")
		return
	}

	var friendship models.Friend
	if err := s.DB.First(&friendship, friendshipID).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "friend request not found")
		return
	}

	// Only the recipient can accept
	if friendship.FriendID != userID {
		SendGenericResponse(w, false, http.StatusForbidden, "not authorized to accept this request")
		return
	}

	// Update status
	friendship.Status = models.FriendStatusAccepted
	if err := s.DB.Save(&friendship).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to accept friend request")
		return
	}

	SendGenericResponse(w, true, http.StatusOK, "friend request accepted")
}

// DeclineFriendRequest handles declining a friend request
func (s *Server) declineFriendRequestHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	friendshipIDStr := r.PathValue("id")
	friendshipID, err := strconv.ParseUint(friendshipIDStr, 10, 32)
	if err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid friendship id")
		return
	}

	var friendship models.Friend
	if err := s.DB.First(&friendship, friendshipID).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "friend request not found")
		return
	}

	// Only the recipient can decline
	if friendship.FriendID != userID {
		SendGenericResponse(w, false, http.StatusForbidden, "not authorized to decline this request")
		return
	}

	if err := s.DB.Delete(&friendship).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to decline friend request")
		return
	}

	SendGenericResponse(w, true, http.StatusOK, "friend request declined")
}

// RemoveFriend handles removing a friend
func (s *Server) removeFriendHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	friendshipIDStr := r.PathValue("id")
	friendshipID, err := strconv.ParseUint(friendshipIDStr, 10, 32)
	if err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "invalid friendship id")
		return
	}

	var friendship models.Friend
	if err := s.DB.First(&friendship, friendshipID).Error; err != nil {
		SendGenericResponse(w, false, http.StatusNotFound, "friendship not found")
		return
	}

	// Either user can remove the friendship
	if friendship.UserID != userID && friendship.FriendID != userID {
		SendGenericResponse(w, false, http.StatusForbidden, "not authorized to remove this friendship")
		return
	}

	if err := s.DB.Delete(&friendship).Error; err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to remove friend")
		return
	}

	SendGenericResponse(w, true, http.StatusOK, "friend removed")
}

// GetFriends returns list of accepted friends
func (s *Server) getFriendsHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	var friendships []models.Friend
	err := s.DB.Preload("User").Preload("Friend").
		Where("(user_id = ? OR friend_id = ?) AND status = ?", userID, userID, models.FriendStatusAccepted).
		Find(&friendships).Error

	if err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to get friends")
		return
	}

	type FriendInfo struct {
		FriendshipID uint   `json:"friendshipId"`
		UserID       uint   `json:"userId"`
		Username     string `json:"username"`
		IsOnline     bool   `json:"isOnline"`
		CurrentGame  string `json:"currentGame"`
	}

	friends := make([]FriendInfo, 0)
	for _, f := range friendships {
		var friendAccount models.Account
		if f.UserID == userID {
			friendAccount = f.Friend
		} else {
			friendAccount = f.User
		}

		// Check if friend is online by looking at active sessions
		isOnline := s.SM.IsUserActive(friendAccount.ID)
		
		// TODO: Add logic to get current game from session or game instance manager
		currentGame := ""

		friends = append(friends, FriendInfo{
			FriendshipID: f.ID,
			UserID:       friendAccount.ID,
			Username:     friendAccount.Username,
			IsOnline:     isOnline,
			CurrentGame:  currentGame,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    friends,
	})
}

// GetFriendRequests returns pending friend requests
func (s *Server) getFriendRequestsHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	var friendships []models.Friend
	err := s.DB.Preload("User").Preload("Friend").
		Where("friend_id = ? AND status = ?", userID, models.FriendStatusPending).
		Find(&friendships).Error

	if err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to get friend requests")
		return
	}

	type RequestInfo struct {
		FriendshipID uint   `json:"friendshipId"`
		UserID       uint   `json:"userId"`
		Username     string `json:"username"`
	}

	requests := make([]RequestInfo, 0)
	for _, f := range friendships {
		requests = append(requests, RequestInfo{
			FriendshipID: f.ID,
			UserID:       f.User.ID,
			Username:     f.User.Username,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    requests,
	})
}

// GetSentRequests returns friend requests sent by the user
func (s *Server) getSentRequestsHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := s.checkCookie(r)
	if !ok {
		SendGenericResponse(w, false, http.StatusUnauthorized, "unauthorized")
		return
	}

	var friendships []models.Friend
	err := s.DB.Preload("User").Preload("Friend").
		Where("user_id = ? AND status = ?", userID, models.FriendStatusPending).
		Find(&friendships).Error

	if err != nil {
		SendGenericResponse(w, false, http.StatusInternalServerError, "failed to get sent requests")
		return
	}

	type RequestInfo struct {
		FriendshipID uint   `json:"friendshipId"`
		UserID       uint   `json:"userId"`
		Username     string `json:"username"`
	}

	requests := make([]RequestInfo, 0)
	for _, f := range friendships {
		requests = append(requests, RequestInfo{
			FriendshipID: f.ID,
			UserID:       f.Friend.ID,
			Username:     f.Friend.Username,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    requests,
	})
}
