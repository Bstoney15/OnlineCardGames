import './card.css'; // <-- Import your styles

const Card = ({ suit = 0, rank = 0 }) => {
  return <div className={`card--${suit}-${rank}`}></div>;
};

export default Card;