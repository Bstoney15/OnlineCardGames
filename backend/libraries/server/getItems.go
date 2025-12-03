// Package server provides HTTP handlers and server functionality for dealing with items.
// This file contains handlers for getting equipped and owned items.
//
// Author: Henry Michael Hoopes
// Date: 2025-11-19
package server

import (
	"cardgames/backend/models"
	"net/http"
)


//function for getting equipped item and color
func (s *Server) getEquippedHandler(w http.ResponseWriter, r *http.Request) {
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

	stats := map[string]interface{}{
		"item":      account.EquipedItem,
		"color":     account.EquipedColor,
	}

	SendGenericResponse(w, true, 200, stats)
}

//function for getting owned items and colors
func (s *Server) getOwnedHandler(w http.ResponseWriter, r *http.Request) {
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

	stats := map[string]interface{}{
		"items":      account.OwnedItems,
		"colors":     account.OwnedColors,
	}

	SendGenericResponse(w, true, 200, stats)
}