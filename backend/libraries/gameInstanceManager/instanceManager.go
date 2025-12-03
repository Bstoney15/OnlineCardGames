// Package gameinstancemanager provides management functionality for game instances.
// It handles the creation, retrieval, and lifecycle management of both public and
// private blackjack game instances, ensuring thread-safe operations and automatic
// cleanup of empty games.
//
// Author: Benjamin Stonestreet
// Date: 2025-11-06
package gameinstancemanager

import (
	"cardgames/backend/libraries/blackjack"
	"math/rand"
	"sync"
	"time"

	"gorm.io/gorm"
)

// letterBytes contains the character set used for generating random game IDs.
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// rng is a thread-local random number generator seeded with the current time.
var rng = rand.New(rand.NewSource(time.Now().UnixNano()))

// generateID creates a random alphanumeric string of the specified length.
// It is used to generate unique identifiers for game instances.
func generateID(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = letterBytes[rng.Intn(len(letterBytes))]
	}
	return string(b)
}

// GameInstanceManager manages the lifecycle of blackjack game instances.
// It maintains separate maps for public and private games and provides
// thread-safe access through a read-write mutex.
type GameInstanceManager struct {
	mu           sync.RWMutex
	PublicGames  map[string]*blackjack.BlackJackInstance
	PrivateGames map[string]*blackjack.BlackJackInstance
	DB           *gorm.DB
	stop         chan struct{}
}

// NewGameInstanceManager creates and initializes a new GameInstanceManager.
// It sets up the game maps, database connection, and starts the background
// cleanup routine for removing empty games.
func NewGameInstanceManager(db *gorm.DB) *GameInstanceManager {
	gim := &GameInstanceManager{
		PublicGames:  make(map[string]*blackjack.BlackJackInstance),
		PrivateGames: make(map[string]*blackjack.BlackJackInstance),
		DB:           db,
		stop:         make(chan struct{}),
	}
	gim.Start()
	return gim
}

// clearEmptyGames removes all game instances that have no players.
// This is called periodically by the background cleanup routine to free
// up resources from abandoned games.
func (gim *GameInstanceManager) clearEmptyGames() {
	gim.mu.Lock()
	defer gim.mu.Unlock()
	for id, game := range gim.PublicGames {
		if len(game.Players) == 0 {
			delete(gim.PublicGames, id)
		}
	}
	for id, game := range gim.PrivateGames {
		if len(game.Players) == 0 {
			delete(gim.PrivateGames, id)
		}
	}
}

// Start begins the background cleanup routine that periodically removes
// empty game instances. The cleanup runs every 5 minutes.
func (gim *GameInstanceManager) Start() {
	ticker := time.NewTicker(5 * time.Minute) // Clear empty games every 5 minutes
	go func() {
		for {
			select {
			case <-ticker.C:
				gim.clearEmptyGames()
			case <-gim.stop:
				ticker.Stop()
				return
			}
		}
	}()
}

// Stop halts the background cleanup routine by closing the stop channel.
// This should be called when shutting down the game instance manager.
func (gim *GameInstanceManager) Stop() {
	close(gim.stop)
}

// CreatePublicGame creates a new public blackjack game instance.
// It generates a unique 5-character ID and adds the game to the public games map.
// Returns the game ID and any error encountered.
func (gim *GameInstanceManager) CreatePublicGame() (string, error) {
	gim.mu.Lock()
	defer gim.mu.Unlock()
	var id string
	for {
		id = generateID(5)
		if _, ok := gim.PublicGames[id]; !ok {
			break
		}
	}
	newGame := blackjack.NewBlackJackInstance(gim.DB)
	gim.PublicGames[id] = newGame
	return id, nil
}

// CreatePrivateGame creates a new private blackjack game instance.
// It generates a unique 5-character ID and adds the game to the private games map.
// Returns the game ID and any error encountered.
func (gim *GameInstanceManager) CreatePrivateGame() (string, error) {
	gim.mu.Lock()
	defer gim.mu.Unlock()
	var id string
	for {
		id = generateID(5)
		if _, ok := gim.PrivateGames[id]; !ok {
			break
		}
	}
	newGame := blackjack.NewBlackJackInstance(gim.DB)
	gim.PrivateGames[id] = newGame
	return id, nil
}

// getPublicGame retrieves a public game instance by its ID.
// Returns the game instance and a boolean indicating whether the game was found.
func (gim *GameInstanceManager) getPublicGame(id string) (*blackjack.BlackJackInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PublicGames[id]
	return game, ok
}

// getPrivateGame retrieves a private game instance by its ID.
// Returns the game instance and a boolean indicating whether the game was found.
func (gim *GameInstanceManager) getPrivateGame(id string) (*blackjack.BlackJackInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PrivateGames[id]
	return game, ok
}

// GetGame retrieves a game instance by its ID, searching both private and public games.
// It first checks private games, then public games.
// Returns the game instance if found, or nil if no game exists with the given ID.
func (gim *GameInstanceManager) GetGame(id string) *blackjack.BlackJackInstance {

	game, ok := gim.getPrivateGame(id)
	if ok {
		return game
	}

	game, ok = gim.getPublicGame(id)
	if ok {
		return game
	}

	return nil
}

// FindAvailablePublicGame searches for a public game that has available player slots.
// If an available game is found, its ID is returned. If no games have available slots,
// a new public game is created and its ID is returned.
func (gim *GameInstanceManager) FindAvailablePublicGame() (string, error) {
	gim.mu.RLock()
	// Try to find an available game
	for id, game := range gim.PublicGames {
		if len(game.Players) < blackjack.MaxPlayersPerInstance {
			gim.mu.RUnlock()
			return id, nil
		}
	}
	gim.mu.RUnlock()

	// No available game found, create a new one
	id, err := gim.CreatePublicGame()
	if err != nil {
		return "", err
	}
	return id, nil
}
