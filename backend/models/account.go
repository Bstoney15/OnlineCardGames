package models

import (
	"gorm.io/gorm"
)
// Account represents a user account in the system.
type Account struct {
	gorm.Model

	Email        string `gorm:"uniqueIndex"` // tells gorm to that emails should be unique
	PasswordHash string `json:"-"`           // The '-' tag excludes this field from JSON output
	Balance      int
	Username     string `gorm:"default:'Player'"` // Username with default value "Player"
	OwnedItems 		string 	`gorm:"default:'__'"`	//owned items, currently has two slots to indicate if two items are owned
	OwnedColors 	string 	`gorm:"default:'__'"`	//owned colors, currently has two slots to indicate colors that are owned
	EquipedItem 	int
	EquipedColor	int
}
