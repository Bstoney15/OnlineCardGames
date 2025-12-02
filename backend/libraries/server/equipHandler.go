package server

import (
	"encoding/json"
	"net/http"
	"cardgames/backend/models"
)

type EquipRequest struct {
	ItemID  *int `json:"itemId"`
	ColorID *int `json:"colorId"`
}

func (s *Server) equipHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var body EquipRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	// --- EQUIP ITEM ---
	if body.ItemID != nil {
		idx := *body.ItemID

		if idx >= 0 && idx < len(account.OwnedItems) && account.OwnedItems[idx] == '1' {
			account.EquipedItem = idx
		}
	}

	// --- EQUIP COLOR ---
	if body.ColorID != nil {
		idx := *body.ColorID

		if idx >= 0 && idx < len(account.OwnedColors) && account.OwnedColors[idx] == '1' {
			account.EquipedColor = idx
		}
	}

	if err := s.DB.Save(&account).Error; err != nil {
		http.Error(w, "failed to save equip", http.StatusInternalServerError)
		return
	}

	SendGenericResponse(w, true, 200, map[string]any{
		"item":  account.EquipedItem,
		"color": account.EquipedColor,
	})
}
