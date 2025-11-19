package baccarat

import (
	carddeck "cardgames/backend/libraries/cardDeck"
	"cardgames/backend/models"
	"log"
	"strconv"
	"time"

	"gorm.io/gorm"
)

//------------------------------------------------------------------
// Constants and Types
//------------------------------------------------------------------

const (
	BettingTimeLimit      = 15 // seconds - longer for strategic betting
	RevealTimeLimit       = 3  // seconds - time between card reveals
	MaxPlayersPerInstance = 14 // Standard baccarat table size
)

// GamePhase represents the current phase of the game.
type GamePhase string

const (
	Betting      GamePhase = "betting"
	Dealing      GamePhase = "dealing"
	PlayerDraw   GamePhase = "player_draw"
	BankerDraw   GamePhase = "banker_draw"
	GameComplete GamePhase = "complete"
)

// BetType represents the type of bet a player can make.
type BetType string

const (
	BetPlayer BetType = "player"
	BetBanker BetType = "banker"
	BetTie    BetType = "tie"
)

// Action represents the type of action a player can take.
type Action string

const (
	PlaceBetAction Action = "bet"
	LeaveAction    Action = "leave"
)

// GameResult represents the outcome of a baccarat round.
type GameResult string

const (
	PlayerWins GameResult = "player_wins"
	BankerWins GameResult = "banker_wins"
	TieGame    GameResult = "tie"
)

// IncomingUpdate is a message from a player to the game instance.
type IncomingUpdate struct {
	PlayerID uint
	Action   Action
	BetType  BetType // player, banker, or tie
	Amount   int
}

// OutgoingUpdate is a message from the game instance to a player.
type OutgoingUpdate struct {
	Phase        GamePhase
	PlayerHand   []carddeck.Card
	BankerHand   []carddeck.Card
	Players      []PlayerInfo
	GameResult   GameResult
	PlayerTotal  int
	BankerTotal  int
	TimeRemaining int // seconds until next phase
}

// PlayerInfo contains public information about a player.
type PlayerInfo struct {
	ID          uint
	PlayerBet   int
	BankerBet   int
	TieBet      int
	Balance     int
	LastWinning int // Amount won/lost in last round
}

// Player represents a player in the baccarat game.
type Player struct {
	ID          uint
	Account     *models.Account
	PlayerBet   int // Bet on player hand
	BankerBet   int // Bet on banker hand
	TieBet      int // Bet on tie
	LastWinning int // Track winnings for display
	Incoming    chan IncomingUpdate
	Outgoing    chan OutgoingUpdate
	Connected   bool
}

// ToPlayerInfo returns a PlayerInfo struct with public information.
func (p *Player) ToPlayerInfo() PlayerInfo {
	return PlayerInfo{
		ID:          p.ID,
		PlayerBet:   p.PlayerBet,
		BankerBet:   p.BankerBet,
		TieBet:      p.TieBet,
		Balance:     p.Account.Balance,
		LastWinning: p.LastWinning,
	}
}

type BaccaratInstance struct {
	Players    []*Player
	Deck       carddeck.Deck
	PlayerHand []carddeck.Card
	BankerHand []carddeck.Card
	gamePhase  GamePhase
	gameResult GameResult
	incoming   chan IncomingUpdate
	DB         *gorm.DB
}

func NewBaccaratInstance(db *gorm.DB) *BaccaratInstance {
	b := &BaccaratInstance{
		Players:    make([]*Player, 0),
		Deck:       carddeck.NewDeck(8), // Baccarat uses 8 decks
		gamePhase:  Betting,
		incoming:   make(chan IncomingUpdate),
		DB:         db,
		PlayerHand: []carddeck.Card{},
		BankerHand: []carddeck.Card{},
	}
	b.Deck.Shuffle()

	// Start the game loop
	go b.GameLoop()

	return b
}

// AddPlayer adds a player to the baccarat instance
func (b *BaccaratInstance) AddPlayer(playerID uint) *Player {
	if len(b.Players) >= MaxPlayersPerInstance {
		return nil
	}

	// Load account from database
	var account models.Account
	err := b.DB.Where("id = ?", playerID).First(&account).Error
	if err != nil {
		return nil
	}

	p := &Player{
		ID:        playerID,
		Account:   &account,
		PlayerBet: 0,
		BankerBet: 0,
		TieBet:    0,
		Incoming:  make(chan IncomingUpdate),
		Outgoing:  make(chan OutgoingUpdate, 10),
		Connected: true,
	}
	b.Players = append(b.Players, p)

	// Listen to player input and forward to game instance
	go func() {
		for update := range p.Incoming {
			b.incoming <- update
		}
	}()

	return p
}

func (b *BaccaratInstance) removePlayer(playerID uint) {
	p := b.findPlayerByID(playerID)
	if p != nil {
		p.Connected = false
	}
}

// GameLoop is the main loop for the game instance.
func (b *BaccaratInstance) GameLoop() {
	timer := time.NewTimer(time.Duration(BettingTimeLimit) * time.Second)
	for {
		select {
		case <-timer.C:
			// Advance game phase on timer
			switch b.gamePhase {
			case Betting:
				// Lock in bets and start dealing
				b.lockInBets()
				b.gamePhase = Dealing
				b.dealInitialCards()
				b.broadcastUpdate()
				timer = time.NewTimer(time.Duration(RevealTimeLimit) * time.Second)

			case Dealing:
				// Check if either side needs a third card
				playerTotal := b.calculateHandValue(b.PlayerHand)
				bankerTotal := b.calculateHandValue(b.BankerHand)

				// Natural win (8 or 9)
				if playerTotal >= 8 || bankerTotal >= 8 {
					b.gamePhase = GameComplete
					b.determineWinner()
					b.settleAllBets()
					b.broadcastUpdate()
					timer = time.NewTimer(5 * time.Second)
				} else if playerTotal <= 5 {
					// Player draws third card
					b.gamePhase = PlayerDraw
					b.drawPlayerThirdCard()
					b.broadcastUpdate()
					timer = time.NewTimer(time.Duration(RevealTimeLimit) * time.Second)
				} else {
					// Player stands, check banker
					b.gamePhase = BankerDraw
					timer = time.NewTimer(100 * time.Millisecond)
				}

			case PlayerDraw:
				// Now check if banker draws
				b.gamePhase = BankerDraw
				timer = time.NewTimer(100 * time.Millisecond)

			case BankerDraw:
				b.checkBankerDraw()
				b.gamePhase = GameComplete
				b.determineWinner()
				b.settleAllBets()
				b.broadcastUpdate()
				timer = time.NewTimer(5 * time.Second)

			case GameComplete:
				// Reset for next round
				b.resetRound()
				b.gamePhase = Betting
				b.broadcastUpdate()
				timer = time.NewTimer(time.Duration(BettingTimeLimit) * time.Second)
			}

		case update := <-b.incoming:
			b.processUpdate(update)
		}
	}
}

func (b *BaccaratInstance) lockInBets() {
	for _, p := range b.Players {
		totalBet := p.PlayerBet + p.BankerBet + p.TieBet
		if totalBet > 0 {
			p.Account.Balance -= totalBet
			b.DB.Save(p.Account)
		}
	}
}

func (b *BaccaratInstance) processUpdate(update IncomingUpdate) {
	if b.gamePhase != Betting {
		return // Only allow bets during betting phase
	}

	p := b.findPlayerByID(update.PlayerID)
	if p == nil {
		return
	}

	switch update.Action {
	case PlaceBetAction:
		if update.Amount < 0 {
			return
		}

		// Calculate current total bet
		currentTotal := p.PlayerBet + p.BankerBet + p.TieBet
		
		// Check if player has enough balance for the new bet
		if p.Account.Balance < (currentTotal + update.Amount) {
			return
		}

		// Place bet on specified type
		switch update.BetType {
		case BetPlayer:
			p.PlayerBet += update.Amount
		case BetBanker:
			p.BankerBet += update.Amount
		case BetTie:
			p.TieBet += update.Amount
		}
		b.broadcastUpdate()

	case LeaveAction:
		b.removePlayer(update.PlayerID)
		b.broadcastUpdate()
	}
}

func (b *BaccaratInstance) findPlayerByID(playerID uint) *Player {
	for _, p := range b.Players {
		if p.ID == playerID {
			return p
		}
	}
	return nil
}

func (b *BaccaratInstance) broadcastUpdate() {
	playersInfo := make([]PlayerInfo, 0, len(b.Players))
	for _, p := range b.Players {
		playersInfo = append(playersInfo, p.ToPlayerInfo())
	}

	playerTotal := b.calculateHandValue(b.PlayerHand)
	bankerTotal := b.calculateHandValue(b.BankerHand)

	for _, p := range b.Players {
		update := OutgoingUpdate{
			Phase:       b.gamePhase,
			PlayerHand:  b.PlayerHand,
			BankerHand:  b.BankerHand,
			Players:     playersInfo,
			GameResult:  b.gameResult,
			PlayerTotal: playerTotal,
			BankerTotal: bankerTotal,
		}

		select {
		case p.Outgoing <- update:
		default:
			b.removePlayer(p.ID)
		}
	}
}

func (b *BaccaratInstance) FirstBroadcastUpdate() {
	b.broadcastUpdate()
}

// dealInitialCards deals 2 cards each to player and banker
func (b *BaccaratInstance) dealInitialCards() {
	b.PlayerHand = append(b.PlayerHand, b.Deck.Draw())
	b.BankerHand = append(b.BankerHand, b.Deck.Draw())
	b.PlayerHand = append(b.PlayerHand, b.Deck.Draw())
	b.BankerHand = append(b.BankerHand, b.Deck.Draw())
}

// drawPlayerThirdCard draws a third card for the player
func (b *BaccaratInstance) drawPlayerThirdCard() {
	b.PlayerHand = append(b.PlayerHand, b.Deck.Draw())
}

// checkBankerDraw determines if banker draws based on baccarat rules
func (b *BaccaratInstance) checkBankerDraw() {
	bankerTotal := b.calculateHandValue(b.BankerHand)
	
	// If player stood (has 2 cards), banker draws on 0-5
	if len(b.PlayerHand) == 2 {
		if bankerTotal <= 5 {
			b.BankerHand = append(b.BankerHand, b.Deck.Draw())
		}
		return
	}

	// Player drew third card - complex banker rules
	playerThirdCard := b.getCardValue(b.PlayerHand[2])

	switch bankerTotal {
	case 0, 1, 2:
		b.BankerHand = append(b.BankerHand, b.Deck.Draw())
	case 3:
		if playerThirdCard != 8 {
			b.BankerHand = append(b.BankerHand, b.Deck.Draw())
		}
	case 4:
		if playerThirdCard >= 2 && playerThirdCard <= 7 {
			b.BankerHand = append(b.BankerHand, b.Deck.Draw())
		}
	case 5:
		if playerThirdCard >= 4 && playerThirdCard <= 7 {
			b.BankerHand = append(b.BankerHand, b.Deck.Draw())
		}
	case 6:
		if playerThirdCard >= 6 && playerThirdCard <= 7 {
			b.BankerHand = append(b.BankerHand, b.Deck.Draw())
		}
	// 7, 8, 9 - banker stands
	}
}

// determineWinner determines the winner of the round
func (b *BaccaratInstance) determineWinner() {
	playerTotal := b.calculateHandValue(b.PlayerHand)
	bankerTotal := b.calculateHandValue(b.BankerHand)

	log.Printf("Player: %d, Banker: %d", playerTotal, bankerTotal)

	if playerTotal > bankerTotal {
		b.gameResult = PlayerWins
	} else if bankerTotal > playerTotal {
		b.gameResult = BankerWins
	} else {
		b.gameResult = TieGame
	}
}

// settleAllBets determines winners and updates account balances
func (b *BaccaratInstance) settleAllBets() {
	for _, p := range b.Players {
		winnings := 0

		switch b.gameResult {
		case PlayerWins:
			// Player bet pays 1:1
			winnings += p.PlayerBet * 2
			// Banker and tie bets lose (already deducted)

		case BankerWins:
			// Banker bet pays 1:1 minus 5% commission (0.95:1)
			winnings += p.BankerBet + int(float64(p.BankerBet)*0.95)
			// Player and tie bets lose

		case TieGame:
			// Tie bet pays 8:1
			winnings += p.TieBet * 9
			// Player and banker bets push (returned)
			winnings += p.PlayerBet + p.BankerBet
		}

		p.LastWinning = winnings - (p.PlayerBet + p.BankerBet + p.TieBet)
		p.Account.Balance += winnings
		b.DB.Save(p.Account)
	}
}

// resetRound clears hands and bets for the next round
func (b *BaccaratInstance) resetRound() {
	b.PlayerHand = []carddeck.Card{}
	b.BankerHand = []carddeck.Card{}
	b.gameResult = ""

	// Remove disconnected players and reset bets
	activePlayers := make([]*Player, 0)
	for _, p := range b.Players {
		if !p.Connected {
			close(p.Incoming)
			close(p.Outgoing)
			continue
		}

		p.PlayerBet = 0
		p.BankerBet = 0
		p.TieBet = 0
		activePlayers = append(activePlayers, p)
	}
	b.Players = activePlayers

	// Reshuffle if less than 1 deck remaining (52 cards)
	if len(b.Deck) < 52 {
		b.Deck = carddeck.NewDeck(8)
		b.Deck.Shuffle()
	}
}

// calculateHandValue calculates the baccarat value of a hand (0-9)
func (b *BaccaratInstance) calculateHandValue(hand []carddeck.Card) int {
	total := 0
	for _, card := range hand {
		total += b.getCardValue(card)
	}
	return total % 10 // Baccarat uses modulo 10
}

// getCardValue returns the baccarat value of a card
func (b *BaccaratInstance) getCardValue(card carddeck.Card) int {
	switch card.Value {
	case "A":
		return 1
	case "2", "3", "4", "5", "6", "7", "8", "9":
		val, _ := strconv.Atoi(card.Value)
		return val
	case "10", "J", "Q", "K":
		return 0
	default:
		return 0
	}
}
