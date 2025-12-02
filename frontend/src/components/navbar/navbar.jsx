import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getActivePlayers, getUserInformation, getEquipped } from "/src/lib/apiClient";
import { PFP_MAP } from "/src/assets/pfps";

function NavBar() {
    const [activePlayers, setActivePlayers] = useState(0);
    const [username, setUsername] = useState(null);
    const [balance, setBalance] = useState(null);
    const [equipped, setEquipped] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

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

            const equippedRes = await getEquipped();
            if (equippedRes?.success && equippedRes?.data) {
                const data = equippedRes.data;
                setEquipped({
                    pfp: data.item ?? null,
                    color: data.color ?? null
                });
            }
        }

        fetchData();
    }, []);

    function handleLogout() {
        document.cookie = "session=; Max-Age=0; path=/;";
        navigate("/login");
    }

    let pfpCircle = null;

    // show equipped PFP in navbar
    if (equipped?.pfp !== undefined && equipped?.pfp !== null && PFP_MAP[equipped.pfp]) {
        pfpCircle = (
            <img
                src={PFP_MAP[equipped.pfp].src}
                alt="pfp"
                className="w-8 h-8 rounded-full object-cover border-2"
                style={{ borderColor: equipped?.color !== null ? "white" : "white" }}
            />
        );
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
                <div className="flex items-center space-x-6">
                    <h1
                        className="text-xl font-bold text-[var(--vice-cyan)] [text-shadow:0_0_10px_var(--vice-cyan)] cursor-pointer"
                        onClick={() => navigate("/home")}
                    >
                        CASINO
                    </h1>

                    {/* Equipped PFP shows here */}
                    {pfpCircle}
                </div>

                <div className="hidden sm:flex items-center space-x-6 text-white/90">
                    <Link to="/home" className="hover:text-cyan-300">Home</Link>
                    <Link to="/store" className="hover:text-cyan-300">Store</Link>
                    <Link to="/user-account" className="hover:text-cyan-300">Account</Link>
                    <Link to="/leaderboard" className="hover:text-cyan-300">Leaderboard</Link>
                </div>

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
