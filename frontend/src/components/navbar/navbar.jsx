import { useEffect, useState } from "react"
import { getActivePlayers, getUserInformation, getCurrency } from "../../lib/apiClient";


function NavBar() {
    const [activePlayers, setActivePlayers] = useState(0);
    const [username, setUsername] = useState(null);
    const [balance, setBalance] = useState(null);

    useEffect( () => {
        // fetch any user data needed

        async function fetchData() {
            try {
                const activePlayers = await getActivePlayers()
                setActivePlayers(activePlayers.data)
            } catch (error) {
                console.error("Failed to fetch active players:", error);
            }

            try {
                const userInfo = await getUserInformation()
                if (userInfo?.success && userInfo?.data) {
                    setUsername(userInfo.data.Username || userInfo.data.username)
                    
                    // If user info succeeds, get balance
                    try {
                        const currencyInfo = await getCurrency()
                        if (currencyInfo?.success && currencyInfo?.data) {
                            setBalance(currencyInfo.data.balance)
                        }
                    } catch (balanceError) {
                        console.error("Failed to fetch balance:", balanceError);
                    }
                }
            } catch (error) {
                // User not logged in - set to null
                setUsername(null)
                setBalance(null)
            }
        }

        fetchData()

    }, []);


    // make this look pretty
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
                {/* Left Side - Logo and User Info */}
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-bold text-[var(--vice-cyan)] [text-shadow:0_0_10px_var(--vice-cyan)]">
                        CASINO
                    </h1>
                    
                    {/* Username and Balance - Only show if logged in */}
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
                                <span className="text-sm text-white/90 leading-tight">
                                    {username}
                                </span>
                                <span className="text-xs text-[var(--vice-yellow-gold)] font-semibold [text-shadow:0_0_5px_var(--vice-yellow-gold)]">
                                    ${balance ?? 0}
                                </span>
                            </div>
                            <div className="sm:hidden">
                                <span className="text-sm text-white/90">
                                    {username}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Active Players */}
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--vice-cyan)] shadow-[0_0_8px_var(--vice-cyan)] animate-pulse"></div>
                    <span className="text-sm text-white/80 hidden sm:inline">Active Players:</span>
                    <span className="text-sm font-semibold text-[var(--vice-cyan)] [text-shadow:0_0_5px_var(--vice-cyan)]">
                        {activePlayers}
                    </span>
                </div>
            </div>

            {/* Mobile Balance - Only show if logged in */}
            {username && balance !== null && (
                <div className="sm:hidden px-6 pb-2">
                    <div className="flex items-center justify-center">
                        <span className="text-xs text-[var(--vice-yellow-gold)] font-semibold [text-shadow:0_0_5px_var(--vice-yellow-gold)]">
                            Balance: ${balance}
                        </span>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar;