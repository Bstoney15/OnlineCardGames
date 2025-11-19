import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaccaratWebSocket from "./baccaratWebSocket";
import BaccaratTable from "../components/baccaratTable/baccaratTable";

function Baccarat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null); // 'player', 'banker', or 'tie'
  const [betAmount, setBetAmount] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log("Baccarat Lobby ID:", id);
    const handleMessage = (message) => {
      setGameState(message);
      console.log("Game state update:", message);
    };

    const handleConnectionChange = (connected, error) => {
      setIsConnected(connected);
      setConnectionError(error);
    };

    const ws = new BaccaratWebSocket(id, handleMessage, handleConnectionChange);
    wsRef.current = ws;
    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [id]);

  const chipValues = [5, 10, 25, 50, 100, 500];

  const handleChipClick = (value) => {
    setBetAmount((prev) => prev + value);
  };

  const handleClearBet = () => {
    setBetAmount(0);
  };

  const handlePlaceBet = (betType) => {
    if (betAmount > 0 && wsRef.current && gameState?.Phase === "betting") {
      wsRef.current.send({
        Action: "bet",
        BetType: betType,
        Amount: betAmount,
      });
      setBetAmount(0);
    }
  };

  const handleExit = () => {
    if (wsRef.current) {
      wsRef.current.send({
        Action: "leave",
      });
    }
    wsRef.current?.disconnect();
    navigate("/");
  };

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-900 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connection Error
          </h2>
          <p className="text-white mb-4">{connectionError}</p>
          <button
            onClick={() => navigate("/")}
            className="btn-cyan-glow w-full"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Connecting to game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Baccarat</h1>
          <button onClick={handleExit} className="btn-cyan-glow px-6 py-2">
            Exit Game
          </button>
        </div>

        {gameState && (
          <BaccaratTable
            gameState={gameState}
            onPlaceBet={handlePlaceBet}
            betAmount={betAmount}
            onChipClick={handleChipClick}
            onClearBet={handleClearBet}
            chipValues={chipValues}
          />
        )}

        {!gameState && (
          <div className="text-white text-center mt-8">
            Waiting for game to start...
          </div>
        )}
      </div>
    </div>
  );
}

export default Baccarat;
