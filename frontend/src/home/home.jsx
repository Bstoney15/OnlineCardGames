import { useState } from "react";
import { Link } from "react-router-dom";
import UserTicker from "./userticker";

function Home({ users }) {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { name: "Blackjack", available: true, description: "Try to get your cards as close to 21 as possible without going over and beat the dealer!" },
    { name: "Uno", available: false, description: "Coming soon" },
    { name: "Poker", available: false, description: "Coming soon" },
  ]; //when we make more games available just update descriptiona and change to true

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative pt-50 space-y-6">
      {/* Ticker fixed at the top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <UserTicker users={users} />
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col items-center w-full max-w-md space-y-4">
        <Link to="/" className="btn-cyan-glow w-full text-center">
          Go Title
        </Link>
        <Link to="/stats" className="btn-cyan-glow w-full text-center">
          View your stats
        </Link>
        <Link to="/leaderboard" className="btn-cyan-glow w-full text-center">
          View leaderboard
        </Link>
        <Link to="/store" className="btn-cyan-glow w-full text-center">
          Go to Currency Store
        </Link>
      </div>

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
              <button className="btn-cyan-glow w-full">Join Lobby</button>
              <button className="btn-cyan-glow w-full">Start Solo Game</button>
              <button className="btn-cyan-glow w-full">Create Private Game</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
