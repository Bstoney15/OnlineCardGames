// Package server provides HTTP handlers and server functionality for the card games application.
// This file contains the generic response structure and helper function for consistent API responses.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package server

import (
	"encoding/json"
	"net/http"
	"time"
)

// GenericResponse represents a standardized API response structure.
// It includes success status, HTTP status code, timestamp, and response data.
type GenericResponse struct {
	Success bool        `json:"success"`
	Status  int         `json:"status"`
	Time    time.Time   `json:"time"`
	Data    interface{} `json:"data"`
}

// SendGenericResponse sends a standardized JSON response to the client.
// It sets the appropriate headers, status code, and encodes the response
// with the provided success flag, HTTP status, and data payload.
func SendGenericResponse(w http.ResponseWriter, success bool, status int, data interface{}) {
	response := &GenericResponse{
		Success: success,
		Status:  status,
		Time:    time.Now(),
		Data:    data,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
