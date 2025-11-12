package blackjack

import (
	carddeck "cardgames/backend/libraries/cardDeck"
	"cardgames/backend/models"
	"strconv"
	"time"

	"gorm.io/gorm"
)

// GamePhase represents the current phase of the game.
type GamePhase string

const (
	Betting    GamePhase = "betting"
	PlayerTurn GamePhase = "player_turn"
	DealerTurn GamePhase = "dealer_turn"
)

const (
	BettingTimeLimit      = 5 // seconds
	ActionTimeLimit       = 5 // seconds
	MaxPlayersPerInstance = 7 // Standard blackjack table size
)

// Action represents the type of action a player can take.
type Action string

const (
	BetAction    Action = "bet"
	HitAction    Action = "hit"
	StandAction  Action = "stand"
	DoubleAction Action = "double"
	SplitAction  Action = "split"
	LeaveAction  Action = "leave"
)

// IncomingUpdate is a message from a player to the game instance.
type PlayerStatus string

const (
	PlayerStatusPlaying   PlayerStatus = "playing"
	PlayerStatusBusted    PlayerStatus = "busted"
	PlayerStatusStand     PlayerStatus = "stand"
	PlayerStatusJoined    PlayerStatus = "joined"
	PlayerStatusLeft      PlayerStatus = "left"
	PlayerStatusWon       PlayerStatus = "won"
	PlayerStatusLost      PlayerStatus = "lost"
	PlayerStatusPush      PlayerStatus = "push"
	PlayerStatusBlackjack PlayerStatus = "blackjack"
)

// IncomingUpdate is a message from a player to the game instance.
type IncomingUpdate struct {
	PlayerID uint
	Action   Action
	Bet      int // Optional, only used for BetAction
}

// OutgoingUpdate is a message from the game instance to a player.
type OutgoingUpdate struct {
	Phase          GamePhase
	YourHand       []carddeck.Card
	DealerHand     []carddeck.Card
	Players        []PlayerInfo // Info about all players
	ActivePlayerID uint
	GameResult     string // e.g., "Player busts", "Dealer wins"
}

// PlayerInfo contains public information about a player.
type PlayerInfo struct {
	ID     uint
	Hand   []carddeck.Card
	Bet    int
	Status PlayerStatus
}

// Map defining allowed actions for each game phase.
var allowedActions = map[GamePhase][]Action{
	Betting:    {BetAction, LeaveAction},
	PlayerTurn: {HitAction, StandAction, DoubleAction, LeaveAction},
	DealerTurn: {},
}

// Player represents a player in the blackjack game.
type Player struct {
	ID       uint
	Account  *models.Account
	Hand     []carddeck.Card
	Bet      int
	Status   PlayerStatus // e.g., "playing", "busted", "stand"
	Incoming chan IncomingUpdate
	Outgoing chan OutgoingUpdate
}

// ToPlayerInfo returns a PlayerInfo struct with public information.
func (p *Player) ToPlayerInfo() PlayerInfo {
	return PlayerInfo{
		ID:     p.ID,
		Hand:   p.Hand,
		Bet:    p.Bet,
		Status: p.Status,
	}
}

type BlackJackInstance struct {
	Players          []*Player
	Deck             carddeck.Deck
	DealerHand       []carddeck.Card
	gamePhase        GamePhase
	incoming         chan IncomingUpdate
	DB               *gorm.DB
	currentTurnIndex int
}

func NewBlackJackInstance(db *gorm.DB) *BlackJackInstance {
	b := &BlackJackInstance{
		Players:          make([]*Player, 0),
		Deck:             carddeck.NewDeck(4), // Example: 4 decks
		gamePhase:        Betting,
		incoming:         make(chan IncomingUpdate),
		DB:               db,
		currentTurnIndex: 0,
	}
	b.Deck.Shuffle()

	// Start the game loop
	go b.GameLoop()

	return b
}

// AddPlayer adds a player to the blackjack instance
func (b *BlackJackInstance) AddPlayer(playerID uint) *Player {

	if len(b.Players) >= MaxPlayersPerInstance {
		// Table full
		return nil
	}

	// Load account from database
	var account models.Account
	err := b.DB.Where("id = ?", playerID).First(&account).Error
	if err != nil {
		// Handle error - account not found or database error
		return nil
	}

	p := &Player{
		ID:       playerID,
		Account:  &account,
		Status:   PlayerStatusJoined,
		Incoming: make(chan IncomingUpdate),
		Outgoing: make(chan OutgoingUpdate, 10), // Buffered channel to prevent blocking
	}
	b.Players = append(b.Players, p)

	// listens to all of the input channels and forwards to the game instance incoming channel
	go func() {
		for update := range p.Incoming {
			b.incoming <- update
		}
	}()

	return p
}

// GameLoop is the main loop for the game instance.
func (b *BlackJackInstance) GameLoop() {
	timer := time.NewTimer(time.Duration(BettingTimeLimit) * time.Second)
	for {
		select {
		case <-timer.C:
			// Advance game phase on timer and reset timer accordingly
			switch b.gamePhase {
			case Betting: // betting phase ending
				b.gamePhase = PlayerTurn

				// lock in player bets
				for _, p := range b.Players {
					if p.Bet > 0 {
						p.Account.Balance -= p.Bet
						b.DB.Save(p.Account)
					}
				}

				// Deal initial cards
				b.dealInitialCards()

				// Check for dealer blackjack
				if b.calculateHandValue(b.DealerHand) == 21 {
					// Dealer has blackjack - skip player turns and go directly to dealer
					b.gamePhase = DealerTurn
					b.broadcastUpdate()
					timer = time.NewTimer(1 * time.Millisecond) // Fire immediately
				} else {
					// Start with first player
					b.currentTurnIndex = 0
					b.broadcastUpdate()
					timer = time.NewTimer(time.Duration(ActionTimeLimit) * time.Second)
				}

			case PlayerTurn:
				// Time's up for current player - automatically stand or handle if they left
				if b.currentTurnIndex < len(b.Players) {
					p := b.Players[b.currentTurnIndex]
					if p.Status == PlayerStatusPlaying {
						p.Status = PlayerStatusStand
					}
				}
				// Move to next player or dealer turn
				if b.moveToNextPlayer() {
					b.broadcastUpdate()
					timer = time.NewTimer(time.Duration(ActionTimeLimit) * time.Second)
				} else {
					b.gamePhase = DealerTurn
					b.broadcastUpdate()
					timer = time.NewTimer(time.Duration(ActionTimeLimit) * time.Second)
				}
			case DealerTurn:
				b.playDealerHand()
				b.broadcastUpdate()
				b.settleAllBets()
				b.broadcastUpdate()

				time.Sleep(5 * time.Second) // Pause before next round

				b.resetRound()
				b.gamePhase = Betting
				b.broadcastUpdate()
				timer = time.NewTimer(time.Duration(BettingTimeLimit) * time.Second)
			default:
				b.gamePhase = Betting
				timer = time.NewTimer(time.Duration(BettingTimeLimit) * time.Second)
			}

		case update := <-b.incoming:
			needsTimerReset := b.processUpdate(update)
			if needsTimerReset && b.gamePhase == PlayerTurn {
				// Reset timer when moving to next player
				timer.Stop()
				timer = time.NewTimer(time.Duration(ActionTimeLimit) * time.Second)
			}
		}
	}
}

func (b *BlackJackInstance) isActionAllowed(action Action) bool {
	for _, allowedAction := range allowedActions[b.gamePhase] {
		if action == allowedAction {
			return true
		}
	}
	return false
}

func (b *BlackJackInstance) processUpdate(update IncomingUpdate) bool {
	if !b.isActionAllowed(update.Action) {
		// Or send an error message to the player
		return false
	}

	needsTimerReset := false

	switch update.Action {
	case BetAction:
		p := b.findPlayerByID(update.PlayerID)
		if p != nil && b.gamePhase == Betting {

			if update.Bet < 0 {
				// Handle negative bet
				return needsTimerReset
			}

			if p.Account.Balance < update.Bet {
				// Handle insufficient balance
				return needsTimerReset
			}

			p.Bet = update.Bet
			b.broadcastUpdate()
		}
	case HitAction:
		p := b.findPlayerByID(update.PlayerID)
		// Only allow action if it's the active player's turn
		if p != nil && b.gamePhase == PlayerTurn && b.Players[b.currentTurnIndex].ID == update.PlayerID {

			// Deal a card to the player
			card := b.Deck.Draw()
			p.Hand = append(p.Hand, card)
			// Check for bust
			if b.calculateHandValue(p.Hand) > 21 {
				p.Status = PlayerStatusBusted
				// Move to next player after bust
				if !b.moveToNextPlayer() {
					b.gamePhase = DealerTurn
				}
				needsTimerReset = true
			}
			b.broadcastUpdate()
		}
	case StandAction:
		p := b.findPlayerByID(update.PlayerID)
		// Only allow action if it's the active player's turn
		if p != nil && b.gamePhase == PlayerTurn && b.Players[b.currentTurnIndex].ID == update.PlayerID {
			p.Status = PlayerStatusStand
			// Move to next player after stand
			if !b.moveToNextPlayer() {
				b.gamePhase = DealerTurn
			}
			needsTimerReset = true
			b.broadcastUpdate()
		}
	case LeaveAction:
		p := b.findPlayerByID(update.PlayerID)
		if p != nil {
			p.Status = PlayerStatusLeft
			b.broadcastUpdate()
		}
	case SplitAction:
		// TODO: Implement split logic
	}

	return needsTimerReset
}

func (b *BlackJackInstance) findPlayerByID(playerID uint) *Player {
	for _, p := range b.Players {
		if p.ID == playerID {
			return p
		}
	}
	return nil
}

func (b *BlackJackInstance) broadcastUpdate() {
	playersInfo := make([]PlayerInfo, 0, len(b.Players))
	for _, p := range b.Players {
		playersInfo = append(playersInfo, p.ToPlayerInfo())
	}

	activePlayerID := uint(0)
	if b.gamePhase == PlayerTurn && b.currentTurnIndex < len(b.Players) {
		activePlayerID = b.Players[b.currentTurnIndex].ID
	}

	for _, p := range b.Players {
		update := OutgoingUpdate{
			Phase:          b.gamePhase,
			YourHand:       p.Hand,
			DealerHand:     b.DealerHand,
			Players:        playersInfo,
			ActivePlayerID: activePlayerID,
			// GameResult will be implemented later
		}

		// Non-blocking send - if channel is full, skip this player
		select {
		case p.Outgoing <- update:
			// Successfully sent
		default:
			// Channel full or blocked - player might be disconnected
			// Log but don't block the game
		}
	}
}

func (b *BlackJackInstance) FirstBroadcastUpdate() {
	b.broadcastUpdate()
}

// moveToNextPlayer advances to the next player who needs to act.
// Returns true if there's another player, false if all players are done.
func (b *BlackJackInstance) moveToNextPlayer() bool {
	b.currentTurnIndex++
	// Skip players who are already busted or standing
	for b.currentTurnIndex < len(b.Players) {
		p := b.Players[b.currentTurnIndex]
		if p.Status == PlayerStatusPlaying {
			return true
		}
		b.currentTurnIndex++
	}
	return false
}

// dealInitialCards deals 2 cards to each player and the dealer.
func (b *BlackJackInstance) dealInitialCards() {
	// Deal 2 cards to each player who placed a bet
	for _, p := range b.Players {
		if p.Bet > 0 && p.Status != PlayerStatusLeft {
			p.Hand = append(p.Hand, b.Deck.Draw())
			p.Hand = append(p.Hand, b.Deck.Draw())
			p.Status = PlayerStatusPlaying
		}
	}
	// Deal 2 cards to dealer
	b.DealerHand = append(b.DealerHand, b.Deck.Draw())
	b.DealerHand = append(b.DealerHand, b.Deck.Draw())
}

// playDealerHand plays out the dealer's hand according to standard rules.
func (b *BlackJackInstance) playDealerHand() {
	// Dealer draws until reaching 17 or higher
	for b.calculateHandValue(b.DealerHand) < 17 {
		card := b.Deck.Draw()
		b.DealerHand = append(b.DealerHand, card)
		b.broadcastUpdate()
		time.Sleep(1 * time.Second) // Pause for dramatic effect
	}
}

// settleAllBets determines winners and updates account balances.
func (b *BlackJackInstance) settleAllBets() {
	dealerValue := b.calculateHandValue(b.DealerHand)
	dealerBusted := dealerValue > 21

	for _, p := range b.Players {
		if p.Bet == 0 {
			continue
		}

		playerValue := b.calculateHandValue(p.Hand)

		// Player busted - already lost bet
		if p.Status == PlayerStatusBusted {
			p.Status = PlayerStatusLost
			continue
		}

		// Check for player blackjack
		isPlayerBlackjack := len(p.Hand) == 2 && playerValue == 21
		isDealerBlackjack := len(b.DealerHand) == 2 && dealerValue == 21

		// Both have blackjack - push
		if isPlayerBlackjack && isDealerBlackjack {
			p.Status = PlayerStatusPush
			p.Account.Balance += p.Bet
			b.DB.Save(p.Account)
			continue
		}

		// Player blackjack - pays 3:2
		if isPlayerBlackjack {
			p.Status = PlayerStatusBlackjack
			p.Account.Balance += p.Bet + (p.Bet * 3 / 2)
			b.DB.Save(p.Account)
			continue
		}

		// Dealer busted - player wins
		if dealerBusted {
			p.Status = PlayerStatusWon
			p.Account.Balance += p.Bet * 2
			b.DB.Save(p.Account)
			continue
		}

		// Compare values
		if playerValue > dealerValue {
			// Player wins
			p.Status = PlayerStatusWon
			p.Account.Balance += p.Bet * 2
		} else if playerValue == dealerValue {
			// Push - return bet
			p.Status = PlayerStatusPush
			p.Account.Balance += p.Bet
		} else {
			// Player loses
			p.Status = PlayerStatusLost
		}
		// Player loses - bet already deducted

		b.DB.Save(p.Account)
	}
}

// resetRound clears hands and bets for the next round.
func (b *BlackJackInstance) resetRound() {
	b.DealerHand = []carddeck.Card{}

	// Remove players who left and reset remaining players
	activePlayers := make([]*Player, 0)
	for _, p := range b.Players {
		if p.Status == PlayerStatusLeft {
			// Close channels and remove player
			close(p.Incoming)
			close(p.Outgoing)
			continue
		}

		// Reset player for next round
		p.Hand = []carddeck.Card{}
		p.Bet = 0
		// Keep players in joined status so they can choose to bet or spectate
		p.Status = PlayerStatusJoined
		activePlayers = append(activePlayers, p)
	}
	b.Players = activePlayers
	b.currentTurnIndex = 0

	// Check if deck needs reshuffling (less than 25% remaining)
	if len(b.Deck) < 52 {
		b.Deck = carddeck.NewDeck(4)
		b.Deck.Shuffle()
	}
}

// GamePhase represents the current phase of the game.

func (b *BlackJackInstance) calculateHandValue(hand []carddeck.Card) int {
	value := 0
	numAces := 0
	for _, card := range hand {
		switch card.Value {
		case "A":
			numAces++
			value += 11
		case "K", "Q", "J":
			value += 10
		default:
			cardValue, err := strconv.Atoi(card.Value)
			if err == nil {
				value += cardValue
			}
		}
	}

	for i := 0; i < numAces; i++ {
		if value > 21 {
			value -= 10
		}
	}

	return value
}
