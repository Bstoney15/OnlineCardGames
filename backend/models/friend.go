package models

import (
	"time"
	"gorm.io/gorm"
)

// FriendStatus represents the status of a friend relationship
type FriendStatus string

const (
	FriendStatusPending  FriendStatus = "pending"
	FriendStatusAccepted FriendStatus = "accepted"
	FriendStatusBlocked  FriendStatus = "blocked"
)

// Friend represents a friendship relationship between two accounts.
type Friend struct {
	gorm.Model
	
	ID        uint       `gorm:"primaryKey"`
	CreatedAt *time.Time `gorm:"default:null"`
	UpdatedAt *time.Time `gorm:"default:null"`
	DeletedAt *time.Time `gorm:"default:null;index"`
	UserID    uint           `gorm:"not null"` // The user who initiated the friendship
	FriendID  uint           `gorm:"not null"` // The user who is the friend
	Status    FriendStatus   `gorm:"default:'pending'"` // Status of friendship
	// Optional: Reference to the Account model
	User   Account `gorm:"foreignKey:UserID"`
	Friend Account `gorm:"foreignKey:FriendID"`
}
