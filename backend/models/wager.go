package models

import (
	"gorm.io/gorm"
)

// Wager represents a betting wager made by an account.
type Wager struct {
	gorm.Model

	AccountID   uint `gorm:"not null"` // Foreign key to Account
	WagerAmount int  `gorm:"not null"` // Amount in cents (to avoid floating point issues)
	WagerWon    bool `gorm:"default:false"` // Whether the wager was won
	AmountWon  int  `gorm:"default:0"`   // Amount won
}
