import { useState } from "react";
import Hand from "../hand/hand";
import "./baccaratTable.css";

function BaccaratTable({
  gameState,
  onPlaceBet,
  betAmount,
  onChipClick,
  onClearBet,
  chipValues,
}) {
  const [tempBets, setTempBets] = useState({
    player: 0,
    banker: 0,
    tie: 0,
  });

  const isBettingPhase = gameState.Phase === "betting";
  const isGameComplete = gameState.Phase === "complete";

  const getResultMessage = () => {
    if (!isGameComplete) return "";
    
    switch (gameState.GameResult) {
      case "player_wins":
        return "🎉 Player Wins!";
      case "banker_wins":
        return "🎉 Banker Wins!";
      case "tie":
        return "🤝 It's a Tie!";
      default:
        return "";
    }
  };

  const handleBetClick = (betType) => {
    if (!isBettingPhase || betAmount === 0) return;
    
    onPlaceBet(betType);
    setTempBets((prev) => ({
      ...prev,
      [betType]: prev[betType] + betAmount,
    }));
  };

  const getPhaseMessage = () => {
    switch (gameState.Phase) {
      case "betting":
        return "Place Your Bets";
      case "dealing":
        return "Dealing Cards...";
      case "player_draw":
        return "Player Drawing Card...";
      case "banker_draw":
        return "Banker Drawing Card...";
      case "complete":
        return getResultMessage();
      default:
        return "";
    }
  };

  // Reset temp bets when new round starts
  if (isBettingPhase && (tempBets.player > 0 || tempBets.banker > 0 || tempBets.tie > 0)) {
    const currentPlayer = gameState.Players?.find(
      (p) => p.PlayerBet > 0 || p.BankerBet > 0 || p.TieBet > 0
    );
    if (!currentPlayer || (currentPlayer.PlayerBet === 0 && currentPlayer.BankerBet === 0 && currentPlayer.TieBet === 0)) {
      setTempBets({ player: 0, banker: 0, tie: 0 });
    }
  }

  const currentPlayerBets = gameState.Players?.[0] || {
    PlayerBet: 0,
    BankerBet: 0,
    TieBet: 0,
    Balance: 0,
  };

  return (
    <div className="baccarat-table-container">
      {/* Phase Banner */}
      <div className="phase-banner">
        <h2 className="text-2xl font-bold">{getPhaseMessage()}</h2>
      </div>

      {/* Main Game Area */}
      <div className="game-area">
        {/* Banker Section */}
        <div className="hand-section banker-section">
          <h3 className="text-xl font-bold mb-2">Banker</h3>
          <div className="hand-value">
            Value: {gameState.BankerTotal}
          </div>
          {gameState.BankerHand && gameState.BankerHand.length > 0 && (
            <Hand cards={gameState.BankerHand} />
          )}
        </div>

        {/* Center Betting Area */}
        <div className="betting-area">
          {/* Banker Bet */}
          <div
            className={`bet-spot banker-bet ${isBettingPhase ? "active" : ""}`}
            onClick={() => handleBetClick("banker")}
          >
            <div className="bet-label">BANKER</div>
            <div className="bet-payout">Pays 0.95:1</div>
            {currentPlayerBets.BankerBet > 0 && (
              <div className="bet-amount">${currentPlayerBets.BankerBet}</div>
            )}
          </div>

          {/* Tie Bet */}
          <div
            className={`bet-spot tie-bet ${isBettingPhase ? "active" : ""}`}
            onClick={() => handleBetClick("tie")}
          >
            <div className="bet-label">TIE</div>
            <div className="bet-payout">Pays 8:1</div>
            {currentPlayerBets.TieBet > 0 && (
              <div className="bet-amount">${currentPlayerBets.TieBet}</div>
            )}
          </div>

          {/* Player Bet */}
          <div
            className={`bet-spot player-bet ${isBettingPhase ? "active" : ""}`}
            onClick={() => handleBetClick("player")}
          >
            <div className="bet-label">PLAYER</div>
            <div className="bet-payout">Pays 1:1</div>
            {currentPlayerBets.PlayerBet > 0 && (
              <div className="bet-amount">${currentPlayerBets.PlayerBet}</div>
            )}
          </div>
        </div>

        {/* Player Section */}
        <div className="hand-section player-section">
          <h3 className="text-xl font-bold mb-2">Player</h3>
          <div className="hand-value">
            Value: {gameState.PlayerTotal}
          </div>
          {gameState.PlayerHand && gameState.PlayerHand.length > 0 && (
            <Hand cards={gameState.PlayerHand} />
          )}
        </div>
      </div>

      {/* Betting Controls */}
      {isBettingPhase && (
        <div className="betting-controls">
          <div className="chip-selector">
            {chipValues.map((value) => (
              <button
                key={value}
                onClick={() => onChipClick(value)}
                className="chip"
                style={{
                  background: `radial-gradient(circle, ${getChipColor(
                    value
                  )}, ${getChipColorDark(value)})`,
                }}
              >
                ${value}
              </button>
            ))}
          </div>
          <div className="bet-controls">
            <div className="current-bet">
              Current Bet: ${betAmount}
            </div>
            <button onClick={onClearBet} className="btn-cyan-glow">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Player Info */}
      <div className="player-info">
        <div className="balance">
          Balance: ${currentPlayerBets.Balance}
        </div>
        {currentPlayerBets.LastWinning !== 0 && (
          <div
            className={`last-winning ${
              currentPlayerBets.LastWinning > 0 ? "win" : "loss"
            }`}
          >
            {currentPlayerBets.LastWinning > 0 ? "+" : ""}$
            {currentPlayerBets.LastWinning}
          </div>
        )}
      </div>

      {/* Other Players */}
      {gameState.Players && gameState.Players.length > 1 && (
        <div className="other-players">
          <h4 className="text-lg font-bold mb-2">Other Players</h4>
          <div className="players-list">
            {gameState.Players.slice(1).map((player, idx) => (
              <div key={idx} className="player-card">
                <div>Player {player.ID}</div>
                <div className="player-bets">
                  {player.PlayerBet > 0 && (
                    <span className="bet-chip player">P: ${player.PlayerBet}</span>
                  )}
                  {player.BankerBet > 0 && (
                    <span className="bet-chip banker">B: ${player.BankerBet}</span>
                  )}
                  {player.TieBet > 0 && (
                    <span className="bet-chip tie">T: ${player.TieBet}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getChipColor(value) {
  const colors = {
    5: "#ff4444",
    10: "#4444ff",
    25: "#44ff44",
    50: "#ff8844",
    100: "#000000",
    500: "#ff44ff",
  };
  return colors[value] || "#888888";
}

function getChipColorDark(value) {
  const colors = {
    5: "#cc0000",
    10: "#0000cc",
    25: "#00cc00",
    50: "#cc4400",
    100: "#444444",
    500: "#cc00cc",
  };
  return colors[value] || "#444444";
}

export default BaccaratTable;
