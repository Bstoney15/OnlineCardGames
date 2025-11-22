import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlackjackWebSocket from "./blackjackWebSocket";
import BlackjackTable from "../components/blackjackTable/blackjackTable";
import ActionBar from "../components/actionBar/actionBar";


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


  return (
    <div className='h-screen flex flex-col p-4 overflow-hidden'>
      {/* Exit Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleExit}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg border-2 border-red-800"
        >
          Exit Game
        </button>
      </div>

      {/* Main game area with fixed positioning */}
      <div className="flex-1 flex items-center justify-center mb-48"> {/* Added margin bottom for Action Bar */}
        {/* Blackjack Table */}
        <div className="scale-75 origin-top"> {/* Scale down the table */}
          <BlackjackTable
            dealerHand={gameState?.DealerHand || []}
            players={gameState?.Players || []}
            showDealer={true}
          />
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        dealerHand={gameState?.DealerHand || []}
        playerHand={gameState?.YourHand || []}
        phase={gameState?.Phase}
        betAmount={betAmount}
        onHit={handleHit}
        onStand={handleStand}
        onBet={handleChipClick}
        onClearBet={handleClearBet}
        onPlaceBet={handlePlaceBet}
        chipValues={chipValues}
      />

    </div>
  );
}

export default Blackjack;