import './card.css'; // <-- Import your styles

const Card = ({ suit = 0, rank = 0 }) => {
  // Don't render if suit or rank are null/undefined
  if (suit === null || suit === undefined || rank === null || rank === undefined) {
    return null;
  }
  
  return <div className={`card--${suit}-${rank}`}></div>;
};

export default Card;