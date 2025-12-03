// Author: Abdelrahman Zeidan
package server

import (
	"cardgames/backend/models"
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

type buyItemRequest struct {
	Kind  string `json:"kind"`
	Index int    `json:"index"`
}

const lootboxCost = 50

// Cost lists for items and colors
var itemCosts = []int{100, 150}
var colorCosts = []int{80, 120}

// Ensures the owned string is long enough to store a new index
func ensureOwnedSize(s string, index int) string {
	for len(s) <= index {
		s += "_"
	}
	return s
}

// Checks whether the user owns a given item or color
func ownedAt(s string, index int) bool {
	if index < 0 || index >= len(s) {
		return false
	}
	return s[index] == '1'
}

// Marks an item or color as owned
func setOwned(s string, index int) string {
	s = ensureOwnedSize(s, index)
	b := []byte(s)
	b[index] = '1'
	return string(b)
}

// Handles purchasing items and colors
func (s *Server) buyItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var body buyItemRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if body.Index < 0 {
		http.Error(w, "invalid index", http.StatusBadRequest)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	var cost int

	switch body.Kind {

	case "item":
		if body.Index >= len(itemCosts) {
			http.Error(w, "invalid item index", http.StatusBadRequest)
			return
		}
		if ownedAt(account.OwnedItems, body.Index) {
			http.Error(w, "already owned", http.StatusBadRequest)
			return
		}
		cost = itemCosts[body.Index]
		if account.Balance < cost {
			http.Error(w, "insufficient funds", http.StatusBadRequest)
			return
		}
		account.Balance -= cost
		account.OwnedItems = setOwned(account.OwnedItems, body.Index)

	case "color":
		if body.Index >= len(colorCosts) {
			http.Error(w, "invalid color index", http.StatusBadRequest)
			return
		}
		if ownedAt(account.OwnedColors, body.Index) {
			http.Error(w, "already owned", http.StatusBadRequest)
			return
		}
		cost = colorCosts[body.Index]
		if account.Balance < cost {
			http.Error(w, "insufficient funds", http.StatusBadRequest)
			return
		}
		account.Balance -= cost
		account.OwnedColors = setOwned(account.OwnedColors, body.Index)

	default:
		http.Error(w, "invalid kind", http.StatusBadRequest)
		return
	}

	if err := s.DB.Save(&account).Error; err != nil {
		http.Error(w, "could not save account", http.StatusInternalServerError)
		return
	}

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
		"items":   account.OwnedItems,
		"colors":  account.OwnedColors,
	})
}

// Handles lootbox purchases and random rewards
func (s *Server) lootboxHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := s.getUserIDFromRequest(r)
	if !ok {
		sendUnauthorized(w)
		return
	}

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	if account.Balance < lootboxCost {
		http.Error(w, "insufficient funds", http.StatusBadRequest)
		return
	}

	rand.Seed(time.Now().UnixNano())

	kind := "item"
	if rand.Intn(2) == 1 {
		kind = "color"
	}

	var index int

	if kind == "item" {
		if len(account.OwnedItems) == 0 {
			http.Error(w, "no items defined", http.StatusBadRequest)
			return
		}
		index = rand.Intn(len(account.OwnedItems))
		account.OwnedItems = setOwned(account.OwnedItems, index)
	} else {
		if len(account.OwnedColors) == 0 {
			http.Error(w, "no colors defined", http.StatusBadRequest)
			return
		}
		index = rand.Intn(len(account.OwnedColors))
		account.OwnedColors = setOwned(account.OwnedColors, index)
	}

	account.Balance -= lootboxCost

	if err := s.DB.Save(&account).Error; err != nil {
		http.Error(w, "could not save account", http.StatusInternalServerError)
		return
	}

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
		"kind":    kind,
		"index":   index,
		"items":   account.OwnedItems,
		"colors":  account.OwnedColors,
	})
}
