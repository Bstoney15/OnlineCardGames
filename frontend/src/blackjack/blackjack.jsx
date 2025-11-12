import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlackjackWebSocket from "./blackjackWebSocket";
import BlackjackTable from "../components/blackjackTable/blackjackTable";


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
      // TODO: Process game state updates
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

  const chipValues = [5, 10, 25, 50, 100, 500];

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
      setBetAmount(0);
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
    <div className='min-h-screen flex flex-col p-4'>
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
      <div className="flex-1 flex items-center justify-center">
        {/* Blackjack Table */}
        <BlackjackTable dealerHand={gameState?.DealerHand || []} players={gameState?.Players || []} />
      </div>

      {/* Bottom UI - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-black to-transparent">
        {/* Betting Interface - Only show during betting phase */}
        {gameState?.Phase === "betting" && (
          <div className="betting-interface flex items-center gap-4 bg-gray-900 p-6 rounded-lg border-2 border-cyan-500 shadow-lg">
            {/* Clear Button - Left */}
            <button
              onClick={handleClearBet}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              disabled={betAmount === 0}
            >
              Clear
            </button>

            {/* Chip Buttons - Center */}
            <div className="flex gap-3">
              {chipValues.map((value) => (
                <button
                  key={value}
                  onClick={() => handleChipClick(value)}
                  className="relative w-16 h-16 rounded-full border-4 border-white flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                  style={{
                    background: value >= 100 
                      ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                      : value >= 50
                      ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      : value >= 25
                      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                      : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                  }}
                >
                  ${value}
                </button>
              ))}
            </div>

            {/* Place Bet Button - Right */}
            <button
              onClick={handlePlaceBet}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={betAmount === 0}
            >
              Place Bet
            </button>
          </div>
        )}

        {/* Player Action Interface - Only show during player_turn phase */}
        {gameState?.Phase === "player_turn" && (
          <div className="action-interface flex gap-4 bg-gray-900 p-6 rounded-lg border-2 border-yellow-500 shadow-lg">
            <button
              onClick={handleHit}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              HIT
            </button>
            <button
              onClick={handleStand}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              STAND
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Blackjack;