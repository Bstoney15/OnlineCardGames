package server

import (
	"encoding/json"
	"net/http"
)

// getOnlineStatusHandler returns whether specific user IDs are online
func (s *Server) getOnlineStatusHandler(w http.ResponseWriter, r *http.Request) {
	// get cookie to verify user is authenticated
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
	
	// Parse request body to get user IDs to check
	var reqBody struct {
		UserIDs []uint `json:"userIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		SendGenericResponse(w, false, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	// Check which users are online
	onlineStatus := make(map[uint]bool)
	for _, userID := range reqBody.UserIDs {
		_, isOnline := s.SM.CheckIfActiveSession(userID)
		onlineStatus[userID] = isOnline
	}
	
	SendGenericResponse(w, true, http.StatusOK, onlineStatus)
}
