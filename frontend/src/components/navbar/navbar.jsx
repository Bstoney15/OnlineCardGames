import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getActivePlayers, getUserInformation, getCurrency } from "/src/lib/apiClient";

function NavBar() {
    const [activePlayers, setActivePlayers] = useState(0);
    const [username, setUsername] = useState(null);
    const [balance, setBalance] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // hide navbar on login / register / blackjack pages
    const hideRoutes = ["/login", "/register", "/blackjack"];
    if (hideRoutes.some((r) => location.pathname.startsWith(r))) {
        return null;
    }

    useEffect(() => {
        async function fetchData() {
            const activePlayersRes = await getActivePlayers();
            setActivePlayers(activePlayersRes.data);

            const userInfo = await getUserInformation();
            if (userInfo?.success && userInfo?.data) {
                setUsername(userInfo.data.Username ?? userInfo.data.username);
                setBalance(
                    userInfo.data.Balance ??
                    userInfo.data.balance ??
                    userInfo.data.currency ??
                    0
                );
            }
        }

        fetchData();
    }, []);

    function handleLogout() {
        document.cookie = "session=; Max-Age=0; path=/;";
        navigate("/login");
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">

                {/* LEFT - Logo & Username */}
                <div className="flex items-center space-x-6">
                    <h1
                        className="text-xl font-bold text-[var(--vice-cyan)] [text-shadow:0_0_10px_var(--vice-cyan)] cursor-pointer"
                        onClick={() => navigate("/home")}
                    >
                        CASINO
                    </h1>

                    {username && (
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--vice-pink)] to-[var(--vice-cyan)] p-[1px]">
                                <div className="w-full h-full rounded-full bg-[var(--vice-night)] flex items-center justify-center">
                                    <span className="text-xs font-bold text-[var(--vice-cyan)]">
                                        {username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm text-white/90">{username}</span>
                                <span className="text-xs text-[var(--vice-yellow-gold)] font-semibold [text-shadow:0_0_5px_var(--vice-yellow-gold)]">
                                    ${balance ?? 0}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER - Navigation Buttons */}
                <div className="hidden sm:flex items-center space-x-6 text-white/90">
                    <Link to="/home" className="hover:text-cyan-300">Home</Link>
                    <Link to="/store" className="hover:text-cyan-300">Store</Link>
                    <Link to="/user-account" className="hover:text-cyan-300">Account</Link>
                    <Link to="/leaderboard" className="hover:text-cyan-300">Leaderboard</Link>
                </div>

                {/* RIGHT - Active Players + Logout */}
                <div className="flex items-center space-x-4">

                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--vice-cyan)] shadow-[0_0_8px_var(--vice-cyan)] animate-pulse"></div>
                        <span className="text-sm text-white/80 hidden sm:inline">Players:</span>
                        <span className="text-sm font-semibold text-[var(--vice-cyan)]">
                            {activePlayers}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
