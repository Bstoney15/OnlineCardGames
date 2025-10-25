package server

import (
	"encoding/json"
	"net/http"
	"time"
)

type GenericResponse struct {
	Success bool        `json:"success"`
	Status  int      `json:"status"`
	Time    time.Time   `json:"time"`
	Data    interface{} `json:"data"`
}


// call this function with the arguments to add them to the response. Adds success bool status code and a return body to the requester. 
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
