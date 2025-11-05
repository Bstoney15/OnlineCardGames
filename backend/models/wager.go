package models

import (
	"time"
)

// Wager represents a betting wager made by an account.
type Wager struct {
	gorm.Model

	ID        uint       `gorm:"primaryKey"`
	CreatedAt *time.Time `gorm:"default:null"`
	UpdatedAt *time.Time `gorm:"default:null"`
	DeletedAt *time.Time `gorm:"default:null;index"`
	WagerAmount int  `gorm:"not null"` // Amount in cents (to avoid floating point issues)
	WagerWon    bool `gorm:"default:false"` // Whether the wager was won
	AccountID   uint `gorm:"not null"` // Foreign key to Account
	// Optional: Reference to the Account model
	Account Account `gorm:"foreignKey:AccountID"`
}
