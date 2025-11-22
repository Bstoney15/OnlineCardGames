import './blackjackTable.css';
import tableImage from '../../assets/bjTable.png';
import Hand from '../hand/hand';

function BlackjackTable({ dealerHand = [], players = [], showDealer = true, children }) {
  const playerPositions = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="blackjack-table-container">
      <div className="blackjack-table">
        <img src={tableImage} alt="Blackjack Table" className="table-image" />

        {/* Dealer Cards */}
        {showDealer && (
          <div className="dealer-area">
            <Hand cards={dealerHand} />
          </div>
        )}

        {/* Player Positions */}
        <div className="hands-container">
          {playerPositions.map((position, index) => {
            const player = players[index];
            return (
              <div key={position} className="player-hand-position">
                {player && player.Hand && (
                  <Hand cards={player.Hand} />
                )}
              </div>
            );
          })}
        </div>

        {/* Player Bets */}
        <div className="bets-container">
          {playerPositions.map((position, index) => {
            const player = players[index];
            return (
              <div key={position} className="player-bet-position">
                {player && player.Bet > 0 && (
                  <div className="bet-chip">
                    ${player.Bet}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Player Status/Results */}
        <div className="status-container">
          {playerPositions.map((position, index) => {
            const player = players[index];
            const status = player?.Status;
            const showStatus = status && ['won', 'lost', 'push', 'blackjack', 'busted'].includes(status);

            return (
              <div key={position} className="player-status-position">
                {showStatus && (
                  <div className={`status-badgehand status-${status}`}>
                    {status === 'won' && 'WIN'}
                    {status === 'lost' && 'LOSS'}
                    {status === 'push' && 'PUSH'}
                    {status === 'blackjack' && 'BLACKJACK!'}
                    {status === 'busted' && 'BUST'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional content passed as children */}
        {children}
      </div>
    </div>
  );
}

export default BlackjackTable;
