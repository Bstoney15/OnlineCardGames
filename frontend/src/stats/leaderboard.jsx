import { useState, useEffect } from "react";
import { getLeaderBoard } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner.jsx";

function LeaderBoard() {const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getLeaderBoard();
                // Backend returns: { success: true, status: 200, time: "...", data: {...} }
                setStats(response.data);
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

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            
                <h2>Leader Board</h2>
            
            {/*
            placeholder output for now, not sure if this is what stats
            object from database will be like
            */}
            {stats && (
                <div className='mt-8 space-y-4'>
                    <div>
                        <p>Fill in with output</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeaderBoard;