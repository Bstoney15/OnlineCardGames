package carddeck

import (
	"math/rand"
	"time"
)

// Card represents a single playing card.
type Card struct {
	Suit  string
	Value string
}

// Deck represents a deck of cards.
type Deck []Card

// NewDeck creates a standard 52-card deck.
func New() Deck {
	return NewDeck(1)
}

// NewDeck creates a deck with the specified number of standard 52-card decks.
func NewDeck(numDecks int) Deck {
	suits := []string{"H", "D", "C", "S"}
	values := []string{"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"}

	deck := make(Deck, 0, len(suits)*len(values)*numDecks)
	for i := 0; i < numDecks; i++ {
		for _, suit := range suits {
			for _, value := range values {
				deck = append(deck, Card{Suit: suit, Value: value})
			}
		}
	}
	return deck
}

// Shuffle randomizes the order of the cards in the deck.
func (d Deck) Shuffle() {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	r.Shuffle(len(d), func(i, j int) {
		d[i], d[j] = d[j], d[i]
	})
}

// Draw removes and returns the top card from the deck.
func (d *Deck) Draw() Card {
	if len(*d) == 0 {
		return Card{} // Return empty card if deck is empty
	}
	card := (*d)[0]
	*d = (*d)[1:]
	return card
}
