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

// Must match frontend PFP_MAP
var itemCosts = []int{
	100, // Airplane
	120, // Snowflake
	90,  // Ball
	150, // Car
	200, // Cat
	110, // Chess
	140, // Dog
	130, // Water Droplet
	80,  // Duck
	95,  // Fish
	170, // Guitar
	125, // Kick
	160, // Red Flower
}

// Match your frontend COLORS list
var colorCosts = []int{
	100, // Gold
	120, // Crimson
	90,  // Emerald
}

func ensureOwnedSize(s string, index int) string {
	for len(s) <= index {
		s += "_"
	}
	return s
}

func ownedAt(s string, index int) bool {
	if index < 0 || index >= len(s) {
		return false
	}
	return s[index] == '1'
}

func setOwned(s string, index int) string {
	s = ensureOwnedSize(s, index)
	b := []byte(s)
	b[index] = '1'
	return string(b)
}

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

	var account models.Account
	if err := s.DB.First(&account, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	switch body.Kind {

	case "item":
		if (len(account.OwnedItems) < len(itemCosts)){
			for i:=len(account.OwnedItems); i < len(itemCosts); i++{
				account.OwnedItems += "_"
			}
		}
		if body.Index < 0 || body.Index >= len(itemCosts) {
			http.Error(w, "invalid item index", http.StatusBadRequest)
			return
		}
		if ownedAt(account.OwnedItems, body.Index) {
			http.Error(w, "already owned", http.StatusBadRequest)
			return
		}
		cost := itemCosts[body.Index]
		if account.Balance < cost {
			http.Error(w, "insufficient funds", http.StatusBadRequest)
			return
		}
		account.Balance -= cost
		account.OwnedItems = setOwned(account.OwnedItems, body.Index)

	case "color":
		if (len(account.OwnedItems) < len(colorCosts)){
			for i:=len(account.OwnedItems); i < len(colorCosts); i++{
				account.OwnedItems += "_"
			}
		}
		if body.Index < 0 || body.Index >= len(colorCosts) {
			http.Error(w, "invalid color index", http.StatusBadRequest)
			return
		}
		if ownedAt(account.OwnedColors, body.Index) {
			http.Error(w, "already owned", http.StatusBadRequest)
			return
		}
		cost := colorCosts[body.Index]
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

	s.DB.Save(&account)

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
		"items":   account.OwnedItems,
		"colors":  account.OwnedColors,
	})
}

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
		index = rand.Intn(len(itemCosts))
		account.OwnedItems = setOwned(account.OwnedItems, index)
	} else {
		index = rand.Intn(len(colorCosts))
		account.OwnedColors = setOwned(account.OwnedColors, index)
	}

	account.Balance -= lootboxCost
	s.DB.Save(&account)

	SendGenericResponse(w, true, http.StatusOK, map[string]any{
		"balance": account.Balance,
		"kind":    kind,
		"index":   index,
		"items":   account.OwnedItems,
		"colors":  account.OwnedColors,
	})
}
