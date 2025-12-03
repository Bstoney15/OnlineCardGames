// File contains react for displaying the home screen
//
// Author: Multiple Contributors
// Date: 2025-10-28

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserTicker from "./userticker";
import NavBar from "../components/navbar/navbar.jsx";
import { joinLobby as joinLobbyAPI } from "../lib/apiClient.js";

// React function that creates the home screen
function Home() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const games = [
    { name: "Blackjack", available: true, description: "Try to get your cards as close to 21 as possible without going over and beat the dealer!" },
    { name: "Uno", available: false, description: "Coming soon" },
    { name: "Poker", available: false, description: "Coming soon" },
  ]; //when we make more games available just update descriptiona and change to true

  const joinLobby = async (visibility) => {
    setIsJoining(true);
    try {
      const response = await joinLobbyAPI(
        selectedGame.name.toLowerCase(),
        visibility
      );

      console.log(response); 

      if (response.success && response.data.gameId) {
        const gameId = response.data.gameId;
        navigate(`/blackjack/${gameId}`);
      } else {
        console.error("Failed to join lobby:", response);
        alert("Failed to join lobby. Please try again.");
      }
    } catch (error) {
      console.error("Error joining lobby:", error);
      alert("Error joining lobby. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative pt-40 space-y-6">
      <NavBar />
      <UserTicker /> 

      <div className="flex flex-row justify-center w-full max-w-3xl space-x-4">
        {games.map((game, idx) => (
          <div
            key={idx}
            onClick={() => game.available && setSelectedGame(game)}
            className={`flex-1 p-6 rounded-md cursor-pointer flex items-center justify-center ${
              game.available
                ? "btn-cyan-glow"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            {game.name} {game.available ? "" : "(Coming Soon)"}
            {/* this pulls from the list of games, sees if its available,
            if its not it adds coming soon to it with its name, if it is it
            just showcases the game*/}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col items-center w-full max-w-md space-y-4">
        <Link to="/" className="btn-cyan-glow w-full text-center">
          Go Title
        </Link>
        <Link to="/user-account" className="btn-cyan-glow w-full text-center">
          View your Account
        </Link>
        <Link to="/leaderboard" className="btn-cyan-glow w-full text-center">
          View leaderboard
        </Link>
        <Link to="/store" className="btn-cyan-glow w-full text-center">
          Go to Currency Store
        </Link>
      </div>

      {/* when you click on a game it shows a little screen kinda like netflix does and allows user
      to create a solo game, join a lobby, create a private lobby */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-lg relative space-y-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-2 right-2 text-white text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-white">
                {selectedGame.name}
            </h2>
            <p className="text-gray-300">
                {selectedGame.description}
            </p>
            {/* this pulls in the description of the game and allows it to change
            for each game shown */}

            <div className="flex flex-col w-full space-y-4">
              <button 
                className="btn-cyan-glow w-full"
                onClick={() => joinLobby('public')}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Lobby'}
              </button>
              <button 
                className="btn-cyan-glow w-full"
                onClick={() => joinLobby('private')}
                disabled={isJoining}
              >
                {isJoining ? 'Creating...' : 'Create Private Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
