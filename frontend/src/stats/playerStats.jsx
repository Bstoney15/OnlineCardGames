import { useState, useEffect } from "react";
import { getPlayerStats } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner.jsx";

function PlayerStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getPlayerStats();
                // Backend returns: { success: true, status: 200, time: "...", data: {...} }
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch player stats:", err);
                setError("Failed to load stats. Please try again.");
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
                <div className=''>
                    <h5>Error: {error}</h5>
                </div>
            </div>
        );
    }

    const box_css = "round-box w-full"
    const p_css = "pl-4"

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            <div className={`${box_css} max-w-xs max-h-3xs`}>
                <h2 className={`${p_css}`}><span className="text-[var(--vice-pink-rich)] font-bold">{stats.username}'s</span> Stats</h2>
            </div>
                
            
            {stats && (
                <div className='mt-8 space-y-4 w-full max-w-3xs'>
                    <div className={box_css}>
                        <p className={p_css}><strong>Wins:</strong> {stats.wins ?? 0}</p>
                    </div>
                    <div className={box_css}>
                        <p className={p_css}><strong>Losses:</strong> {stats.losses ?? 0}</p>
                    </div>
                    <div className={box_css}>
                        <p className={p_css}><strong>Wagers Placed:</strong> {stats.wagersPlaced ?? 0}</p>
                    </div>
                    <div className={box_css}>
                        <p className={p_css}><strong>Win Rate:</strong> {stats.winRate ? `${Number(stats.winRate).toFixed(2)}%` : '0.00%'}</p>
                    </div>
                    <div className={box_css}>
                        <p className={p_css}><strong>Balance:</strong> ${stats.balance ?? 0}</p>
                    </div>
                    <div className={box_css}>
                        <p className={p_css}><strong>Amount Won:</strong> ${stats.amountWon ?? 0}</p>
                    </div>
                </div>
            )}
            {!stats && (
                <div className="">
                    <p>No stats found...</p>
                </div>
            )}
        </div>
    );
}

export default PlayerStats;