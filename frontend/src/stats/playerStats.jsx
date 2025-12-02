/*
playerStats.jsx
Description: Page used to display a players stats(now obsolete as stats have been moved to the account page)
            This page calls getPlayerStats to connect to the backend and it will recieve a json object with stats.
Created by: Ryan Grimsley
Date Created: 11/03/25
*/
import { useState, useEffect } from "react";
import { getPlayerStats } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner.jsx";

// function of component to export
function PlayerStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // when page is changed, perform these actions
    useEffect(() => {
        // function fetch stats from backend and check for errors    
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
        // actually call the function to fetch the stats, they are placed in stats object
        fetchStats();
    }, []);
    // if the page is loading, display spinner
    if (loading) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <LoadingSpinner />
            </div>
        );
    }
    // if there is an error, display error message
    if (error) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <div className=''>
                    <h5>Error: {error}</h5>
                </div>
            </div>
        );
    }
    // tailwind syntax for class names to use for different divs
    const box_css = "round-box w-full"
    const p_css = "pl-4"
    // main stats page to return
    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            <div className={`${box_css} max-w-xs max-h-3xs`}>
                <h2 className={`${p_css}`}><span className="text-[var(--vice-pink-rich)] font-bold">{stats.username}</span>'s Stats</h2>
            </div>
                
            {/* display the stats in individual boxes */}
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