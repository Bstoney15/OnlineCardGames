package gameinstancemanager

import (
	"cardgames/backend/libraries/blackjack"
	"math/rand"
	"sync"
	"time"

	"gorm.io/gorm"
)

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var rng = rand.New(rand.NewSource(time.Now().UnixNano()))

func generateID(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = letterBytes[rng.Intn(len(letterBytes))]
	}
	return string(b)
}

type GameInstanceManager struct {
	mu           sync.RWMutex
	PublicGames  map[string]*blackjack.BlackJackInstance
	PrivateGames map[string]*blackjack.BlackJackInstance
	DB           *gorm.DB
	stop         chan struct{}
}

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

func (gim *GameInstanceManager) ClearEmptyGames() {
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

func (gim *GameInstanceManager) Start() {
	ticker := time.NewTicker(5 * time.Minute) // Clear empty games every 5 minutes
	go func() {
		for {
			select {
			case <-ticker.C:
				gim.ClearEmptyGames()
			case <-gim.stop:
				ticker.Stop()
				return
			}
		}
	}()
}

func (gim *GameInstanceManager) Stop() {
	close(gim.stop)
}

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

// GetPublicGame retrieves a public game by ID
func (gim *GameInstanceManager) GetPublicGame(id string) *blackjack.BlackJackInstance {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	return gim.PublicGames[id]
}

// GetPrivateGame retrieves a private game by ID
func (gim *GameInstanceManager) GetPrivateGame(id string) *blackjack.BlackJackInstance {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	return gim.PrivateGames[id]
}

// FindAvailablePublicGame finds a public game with available slots or creates a new one
func (gim *GameInstanceManager) FindAvailablePublicGame() (*blackjack.BlackJackInstance, string) {
	gim.mu.RLock()
	// Try to find an available game
	for id, game := range gim.PublicGames {
		if len(game.Players) < blackjack.MaxPlayersPerInstance {
			gim.mu.RUnlock()
			return game, id
		}
	}
	gim.mu.RUnlock()

	// No available game found, create a new one
	id, _ := gim.CreatePublicGame()
	return gim.PublicGames[id], id
}
