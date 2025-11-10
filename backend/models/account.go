package models

import "gorm.io/gorm"

// Account represents a user account in the system.
type Account struct {
	gorm.Model

	Email        string `gorm:"uniqueIndex"` // tells gorm to that emails should be unique
	PasswordHash string `json:"-"`           // The '-' tag excludes this field from JSON output
	Balance      int
	Username     string `gorm:"default:'Player'"` // Username with default value "Player"
	WagersWon    int    // Number of wagers won
	WagersLost   int    // Number of wagers lost
	AmountWon    int    // Total amount won in cents
	WagersPlaced int    // total games played
}
