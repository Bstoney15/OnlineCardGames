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

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            
                <h2>Your Stats</h2>
            
            {/*
            placeholder output for now, not sure if this is what stats
            object from database will be like
            */}
            {stats && (
                <div className='mt-8 space-y-4'>
                    <div>
                        <p><strong>Wins:</strong> {stats.wins ?? 0}</p>
                    </div>
                    <div>
                        <p><strong>Losses:</strong> {stats.losses ?? 0}</p>
                    </div>
                    <div>
                        <p><strong>Wagers Placed:</strong> {stats.wagersPlaced ?? 0}</p>
                    </div>
                    <div>
                        <p><strong>Win Rate:</strong> {stats.winRate ? `${Number(stats.winRate).toFixed(2)}%` : '0.00%'}</p>
                    </div>
                    <div>
                        <p><strong>Balance:</strong> ${stats.balance ?? 0}</p>
                    </div>
                    <div>
                        <p><strong>Amount Won:</strong> ${stats.amountWon ?? 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlayerStats;