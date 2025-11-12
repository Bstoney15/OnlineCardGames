import { Link } from "react-router-dom";
import ActiveUsers from "/src/components/activeUsers/activeUsers";
import NavBar from "/src/components/NavBar/NavBar";
import FriendsBar from "/src/components/FriendsBar/FriendsBar";

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 to-black text-white">
      {/* Top Navigation */}
      <NavBar />

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Friends Sidebar */}
        <FriendsBar />

        {/* Center content */}
        <main className="flex flex-col flex-1 items-center justify-center gap-4">
          <ActiveUsers />
          <Link to="/" className="btn-cyan-glow">
            Go Title
          </Link>

          <Link to="/stats" className="btn-cyan-glow">
            View your stats
          </Link>

          <Link to="/leaderboard" className="btn-cyan-glow">
            View leaderboard
          </Link>

          <Link to="/store" className="btn-cyan-glow">
            Go to Currency Store
          </Link>
        </main>
      </div>
    </div>
  );
}

export default Home;
