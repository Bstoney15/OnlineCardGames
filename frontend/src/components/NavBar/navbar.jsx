import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now this just sends us back to login
    navigate("/login");
  };

  return (
    <nav className="w-full bg-transparent flex justify-between items-center px-6 py-3 text-white">
      <div className="text-xl font-bold tracking-wide">🎰 Casino Sim</div>

      <div className="flex gap-6 text-lg">
        <Link to="/home" className="hover:text-cyan-400 transition-colors">Home</Link>
        <Link to="/store" className="hover:text-cyan-400 transition-colors">Store</Link>
        <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard</Link>
        <Link to="/friends" className="hover:text-cyan-400 transition-colors">Friends</Link>
      </div>

      <button
        onClick={handleLogout}
        className="border border-cyan-400 px-3 py-1 rounded hover:bg-cyan-400 hover:text-black transition-colors"
      >
        Logout
      </button>
    </nav>
  );
}
