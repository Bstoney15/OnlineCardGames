package gameinstancemanager

import (
	"cardgames/backend/libraries/baccarat"
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
	mu                 sync.RWMutex
	PublicGames        map[string]*blackjack.BlackJackInstance
	PrivateGames       map[string]*blackjack.BlackJackInstance
	PublicBaccaratGames  map[string]*baccarat.BaccaratInstance
	PrivateBaccaratGames map[string]*baccarat.BaccaratInstance
	DB                 *gorm.DB
	stop               chan struct{}
}

func NewGameInstanceManager(db *gorm.DB) *GameInstanceManager {
	gim := &GameInstanceManager{
		PublicGames:          make(map[string]*blackjack.BlackJackInstance),
		PrivateGames:         make(map[string]*blackjack.BlackJackInstance),
		PublicBaccaratGames:  make(map[string]*baccarat.BaccaratInstance),
		PrivateBaccaratGames: make(map[string]*baccarat.BaccaratInstance),
		DB:                   db,
		stop:                 make(chan struct{}),
	}
	gim.Start()
	return gim
}

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
	for id, game := range gim.PublicBaccaratGames {
		if len(game.Players) == 0 {
			delete(gim.PublicBaccaratGames, id)
		}
	}
	for id, game := range gim.PrivateBaccaratGames {
		if len(game.Players) == 0 {
			delete(gim.PrivateBaccaratGames, id)
		}
	}
}

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
func (gim *GameInstanceManager) getPublicGame(id string) (*blackjack.BlackJackInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PublicGames[id]
	return game, ok
}

// GetPrivateGame retrieves a private game by ID
func (gim *GameInstanceManager) getPrivateGame(id string) (*blackjack.BlackJackInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PrivateGames[id]
	return game, ok
}

func (gim *GameInstanceManager) GetGame(id string) (*blackjack.BlackJackInstance) {

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


// FindAvailablePublicGame finds a public game with available slots or creates a new one
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

// Baccarat game methods
func (gim *GameInstanceManager) CreatePublicBaccaratGame() (string, error) {
	gim.mu.Lock()
	defer gim.mu.Unlock()
	var id string
	for {
		id = generateID(5)
		if _, ok := gim.PublicBaccaratGames[id]; !ok {
			break
		}
	}
	newGame := baccarat.NewBaccaratInstance(gim.DB)
	gim.PublicBaccaratGames[id] = newGame
	return id, nil
}

func (gim *GameInstanceManager) CreatePrivateBaccaratGame() (string, error) {
	gim.mu.Lock()
	defer gim.mu.Unlock()
	var id string
	for {
		id = generateID(5)
		if _, ok := gim.PrivateBaccaratGames[id]; !ok {
			break
		}
	}
	newGame := baccarat.NewBaccaratInstance(gim.DB)
	gim.PrivateBaccaratGames[id] = newGame
	return id, nil
}

func (gim *GameInstanceManager) getPublicBaccaratGame(id string) (*baccarat.BaccaratInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PublicBaccaratGames[id]
	return game, ok
}

func (gim *GameInstanceManager) getPrivateBaccaratGame(id string) (*baccarat.BaccaratInstance, bool) {
	gim.mu.RLock()
	defer gim.mu.RUnlock()
	game, ok := gim.PrivateBaccaratGames[id]
	return game, ok
}

func (gim *GameInstanceManager) GetBaccaratGame(id string) *baccarat.BaccaratInstance {
	game, ok := gim.getPrivateBaccaratGame(id)
	if ok {
		return game
	}

	game, ok = gim.getPublicBaccaratGame(id)
	if ok {
		return game
	}

	return nil
}

func (gim *GameInstanceManager) FindAvailablePublicBaccaratGame() (string, error) {
	gim.mu.RLock()
	// Try to find an available game
	for id, game := range gim.PublicBaccaratGames {
		if len(game.Players) < baccarat.MaxPlayersPerInstance {
			gim.mu.RUnlock()
			return id, nil
		}
	}
	gim.mu.RUnlock()

	// No available game found, create a new one
	id, err := gim.CreatePublicBaccaratGame()
	if err != nil {
		return "", err
	}
	return id, nil
}
