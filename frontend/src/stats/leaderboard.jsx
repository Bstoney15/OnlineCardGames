import { useState, useEffect } from "react";
import { getLeaderBoardBalance, getLeaderBoardWagersWon, getLeaderBoardWagersLost, getLeaderBoardAmountWon, getLeaderBoardWagersPlaced } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner.jsx";

function LeaderBoard() {
    const [balanceStats, setBalanceStats] = useState(null);
    const [wagersWonStats, setWagersWonStats] = useState(null);
    const [wagersLostStats, setWagersLostStats] = useState(null);
    const [amountWonStats, setAmountWonStats] = useState(null);
    const [wagersPlacedStats, setWagersPlacedStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Backend returns: { success: true, status: 200, time: "...", data: {...} }
                const responseBalance = await getLeaderBoardBalance();
                if (responseBalance.status == 404){
                    throw new Error("fuck my backa life")
                }
                setBalanceStats(responseBalance.data);
                const responseWagersWon = await getLeaderBoardWagersWon();
                if (responseWagersWon.status == 404){
                    throw new Error("fuck my backa life")
                }
                setWagersWonStats(responseWagersWon.data);
                const responseWagersLost = await getLeaderBoardWagersLost();
                if (responseWagersLost.status == 404){
                    throw new Error("fuck my backa life")
                }
                setWagersLostStats(responseWagersLost.data);
                const responseAmountWon = await getLeaderBoardAmountWon();
                if (responseAmountWon.status == 404){
                    throw new Error("fuck my backa life")
                }
                setAmountWonStats(responseAmountWon.data);
                const responseWagersPlaced = await getLeaderBoardWagersPlaced();
                if (responseWagersPlaced.status == 404){
                    throw new Error("fuck my backa life")
                }
                setWagersPlacedStats(responseWagersPlaced.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch Leader Board:", err);
                setError("Failed to load Leader Board. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                    <p>Error: {error}</p>
            </div>
        );
    }

    const box_css = "round-box w-full"
    const p_css = "pl-4"

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            
            <h1>Leader Board</h1>

            <div>
                <h2>Highest Balances</h2>
                
                {balanceStats && (
                    <div className='mt-8 space-y-4 w-full max-w-3xs'>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act0_username}</span>'s Balance: 
                                {balanceStats.act0_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act1_username}</span>'s Balance: 
                                {balanceStats.act1_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act2_username}</span>'s Balance: 
                                {balanceStats.act2_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act3_username}</span>'s Balance: 
                                {balanceStats.act3_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act4_username}</span>'s Balance: 
                                {balanceStats.act4_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
                {!balanceStats && (
                    <div className="">
                        <p>No balance stats found...</p>
                    </div>
                )}
            </div>

            <div>
                <h2>Most Wagers Won</h2>
                
                {wagersWonStats && (
                    <div className='mt-8 space-y-4 w-full max-w-3xs'>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act0_username}</span>'s Balance: 
                                {wagersWonStats.act0_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act1_username}</span>'s Balance: 
                                {wagersWonStats.act1_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act2_username}</span>'s Balance: 
                                {wagersWonStats.act2_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act3_username}</span>'s Balance: 
                                {wagersWonStats.act3_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act4_username}</span>'s Balance: 
                                {wagersWonStats.act4_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
                {!wagersWonStats && (
                    <div className="">
                        <p>No wagers stats found...</p>
                    </div>
                )}
            </div>

            <div>
                <h2>Most wagers lost</h2>
                
                {wagersLostStats && (
                    <div className='mt-8 space-y-4 w-full max-w-3xs'>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act0_username}</span>'s Balance: 
                                {wagersLostStats.act0_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act1_username}</span>'s Balance: 
                                {wagersLostStats.act1_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act2_username}</span>'s Balance: 
                                {wagersLostStats.act2_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act3_username}</span>'s Balance: 
                                {wagersLostStats.act3_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act4_username}</span>'s Balance: 
                                {wagersLostStats.act4_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
                {!wagersLostStats && (
                    <div className="">
                        <p>No wager stats found...</p>
                    </div>
                )}
            </div>

            <div>
                <h2>Highest Amount Won</h2>
                
                {amountWonStats && (
                    <div className='mt-8 space-y-4 w-full max-w-3xs'>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act0_username}</span>'s Balance: 
                                {amountWonStats.act0_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act1_username}</span>'s Balance: 
                                {amountWonStats.act1_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act2_username}</span>'s Balance: 
                                {amountWonStats.act2_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act3_username}</span>'s Balance: 
                                {amountWonStats.act3_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act4_username}</span>'s Balance: 
                                {amountWonStats.act4_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
                {!amountWonStats && (
                    <div className="">
                        <p>No amount won stats found...</p>
                    </div>
                )}
            </div>

            <div>
                <h2>Highest Wagers Placed</h2>
                
                {wagersPlacedStats && (
                    <div className='mt-8 space-y-4 w-full max-w-3xs'>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act0_username}</span>'s Balance: 
                                {wagersPlacedStats.act0_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act1_username}</span>'s Balance: 
                                {wagersPlacedStats.act1_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act2_username}</span>'s Balance: 
                                {wagersPlacedStats.act2_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act3_username}</span>'s Balance: 
                                {wagersPlacedStats.act3_balance ?? 0}
                            </p>
                        </div>
                        <div className={box_css}>
                            <p className={p_css}>
                                <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act4_username}</span>'s Balance: 
                                {wagersPlacedStats.act4_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
                {!wagersPlacedStats && (
                    <div className="">
                        <p>No wager stats found...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaderBoard;