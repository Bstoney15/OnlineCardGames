/**
 * Hand component that displays a collection of playing cards.
 * Renders cards in a fanned arrangement for visual appeal.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-20
 */

import Card from '../card/card';
import './hand.css';

/**
 * Hand - Renders a hand of playing cards.
 * @param {Object} props - Component props
 * @param {Array} props.cards - Array of card objects with Suit and Value properties
 * @returns {JSX.Element} The hand component displaying all cards
 */
const Hand = ({ cards = [] }) => {
  return (
    <div className="hand">
      {cards.map((card, index) => (
        <Card 
          key={index}
          suit={card?.Suit}
          rank={card?.Value}
        />
      ))}
    </div>
  );
};

export default Hand;
