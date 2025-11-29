import tableImage from '../../assets/bjTable.png';
import Hand from '../hand/hand';
import PlayerInfo from '../playerInfo/playerInfo';

function BlackjackTable({ dealerHand = [], players = [], showDealer = true, currentTurnId = -1, children }) {
  // Position styles for each player slot - arc shape with ends highest
  const playerPositionStyles = [
    'absolute bottom-[40%] right-[-20%]',   // Player 1 - far right, highest
    'absolute bottom-[10%] right-[-5%]',    // Player 2
    'absolute bottom-[-15%] right-[20%]',   // Player 3
    'absolute bottom-[-25%] left-1/2 -translate-x-1/2', // Player 4 - center, lowest
    'absolute bottom-[-15%] left-[20%]',    // Player 5
    'absolute bottom-[10%] left-[-5%]',     // Player 6
    'absolute bottom-[40%] left-[-20%]',    // Player 7 - far left, highest
  ];

  // Corresponding bet positions - offset above each player
  const betPositionStyles = [
    'absolute bottom-[52%] right-[18.5%]',
    'absolute bottom-[38.5%] right-[26.5%]',
    'absolute bottom-[29.6%] right-[36.5%]',
    'absolute bottom-[26.5%] left-1/2 -translate-x-1/2',
    'absolute bottom-[29.6%] left-[36.5%]',
    'absolute bottom-[38.5%] left-[26.5%]',
    'absolute bottom-[52%] left-[18.7%]',
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative">
        <img src={tableImage} alt="Blackjack Table" className="w-full h-auto" />

        {/* Dealer Cards - positioned at top center of table */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 min-h-32 min-w-48 flex items-center justify-center glow-box glow-white">
          {showDealer && <Hand cards={dealerHand} />}
        </div>

        {/* Player Positions - arranged in arc at bottom of table */}
        {playerPositionStyles.map((posStyle, index) => {
          const player = players[index];
          return (
            <div key={index} className={posStyle}>
              {player && (
                <PlayerInfo
                  username={player.Username || `Player ${index + 1}`}
                  balance={player.Balance || 0}
                  profilePicture={player.ProfilePicture || null}
                  hand={player.Hand || []}
                  status={player.Status}
                  isCurrentTurn={player.ID === currentTurnId}
                />
              )}
            </div>
          );
        })}

        {/* Player Bets - positioned above each player in arc */}
        {betPositionStyles.map((posStyle, index) => {
          const player = players[index];
          return (
            <div key={index} className={posStyle}>
              {player && player.Bet > 0 && (
                <div className="poker-chip chip-default text-sm">
                  ${player.Bet}
                </div>
              )}
            </div>
          );
        })}

        {children}
      </div>
    </div>
  );
}

export default BlackjackTable;
