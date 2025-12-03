// Package models defines the data structures and database models for the card games application.
// This file contains the Account model representing user accounts and their associated data.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package models

import (
	"gorm.io/gorm"
)

// Account represents a user account in the system.
// It stores authentication credentials, in-game currency balance, cosmetic items,
// and user preferences. The model embeds gorm.Model for automatic ID and timestamps.
type Account struct {
	gorm.Model

	Email        string `gorm:"uniqueIndex"` // Email address, must be unique across all accounts
	PasswordHash string `json:"-"`           // Hashed password, excluded from JSON output for security
	Balance      int    // In-game currency balance
	Username     string `gorm:"default:'Player'"` // Display name with default value "Player"
	OwnedItems   string `gorm:"default:'__'"`     // Owned cosmetic items, encoded as string slots
	OwnedColors  string `gorm:"default:'__'"`     // Owned color themes, encoded as string slots
	EquipedItem  int    // Currently equipped cosmetic item index
	EquipedColor int    // Currently equipped color theme index
}
