import Card from '../card/card';
import './hand.css';

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
