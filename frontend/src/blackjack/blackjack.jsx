/**
 * Blackjack game component that manages the main game interface.
 * Handles WebSocket connections, game state management, and user interactions
 * for playing blackjack including betting, hitting, standing, and doubling down.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-18
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlackjackWebSocket from "./blackjackWebSocket";
import BlackjackTable from "../components/blackjackTable/blackjackTable";
import ActionBar from "../components/actionBar/actionBar";
import BalanceDisplay from "../components/balanceDisplay/balanceDisplay";


/**
 * Blackjack - Main game component for the blackjack game interface.
 * Establishes WebSocket connection, manages game state, and renders the game UI.
 * @returns {JSX.Element} The blackjack game interface
 */
function Blackjack() {
  const { id } = useParams(); // Get the lobby id from the URL path
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log("Lobby ID:", id);
    const handleMessage = (message) => {
      setGameState(message);
    };

    // Handle connection status changes
    const handleConnectionChange = (connected, error) => {
      setIsConnected(connected);
      setConnectionError(error);
    };

    // Create and connect WebSocket
    const ws = new BlackjackWebSocket(id, handleMessage, handleConnectionChange);
    wsRef.current = ws;
    ws.connect();

    // Cleanup on unmount
    return () => {
      ws.disconnect();
    };
  }, [id]);

  const chipValues = [25, 50, 100, 500, 1000];

  const handleChipClick = (value) => {
    setBetAmount(prev => prev + value);
  };

  const handleClearBet = () => {
    setBetAmount(0);
  };

  const handlePlaceBet = () => {
    if (betAmount > 0 && wsRef.current) {
      wsRef.current.send({
        Action: "bet",
        Bet: betAmount
      });
    }
  };

  const handleHit = () => {
    if (wsRef.current) {
      wsRef.current.send({
        Action: "hit"
      });
    }
  };

  const handleStand = () => {
    if (wsRef.current) {
      wsRef.current.send({
        Action: "stand"
      });
    }
  };

  const handleDouble = () => {
    if (wsRef.current) {
      wsRef.current.send({
        Action: "double"
      });
    }
  };

  const handleExit = () => {
    // Send leave action to server
    if (wsRef.current) {
      wsRef.current.send({
        Action: "leave"
      });
    }
    // Disconnect WebSocket
    wsRef.current?.disconnect();
    // Navigate back to home
    navigate("/");
  };

  // Find current user's player info by ID
  const currentPlayer = gameState?.Players?.find(p => p.ID === gameState?.YourID);
  const userBalance = currentPlayer?.Balance ?? 0;

  return (
    <div className=''>

      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 mb-4">
        <BalanceDisplay balance={userBalance} />
        <button
          onClick={handleExit}
          className="glow-button glow-red px-4 py-2"
        >
          Leave Table
        </button>
      </div>

      {/* Blackjack Table */}
      <BlackjackTable
        dealerHand={gameState?.DealerHand || []}
        players={gameState?.Players || []}
        currentTurnId={gameState?.ActivePlayerID ?? -1}
      />

      {/* Action Bar */}
      <ActionBar
        dealerHand={gameState?.DealerHand || []}
        playerHand={gameState?.YourHand || []}
        phase={gameState?.Phase}
        betAmount={betAmount}
        onHit={handleHit}
        onStand={handleStand}
        onBet={handleChipClick}
        onDouble={handleDouble}
        onClearBet={handleClearBet}
        onPlaceBet={handlePlaceBet}
        chipValues={chipValues}
      />

    </div>
  );
}

export default Blackjack;