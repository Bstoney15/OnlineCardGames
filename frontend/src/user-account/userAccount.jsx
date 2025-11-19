import { useState, useEffect } from "react";
import { getPlayerStats, getUserFriends } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import './account.css'


function UserAccount() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friends, setFriends] = useState(null);

    useEffect(() => {
        // create fetchstats funciton inside passed useeffect function
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsResponse, friendsResponse] = await Promise.all([
                    getPlayerStats(),
                    getUserFriends(),
                ]); // api call to backend to get stats
                setStats(statsResponse.data);
                setFriends(friendsResponse.data);
                setError(null);
            } catch (err) {
                console.log("Error fetching User Info", err);
                setError("Failed to load User Info. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    // if loading, display the loading spinner
    if (loading) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <LoadingSpinner />
            </div>
        );
    }
    // if there is an error, display the error
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h5>Error: {error}</h5>
            </div>
        )
    }

    const stats_box_css = "round-box w-full"
    const friends_box_css = "friend-box w-full"
    const p_css = "pl-4"

    return (
        <>
    {/* div for pfp and username */}
    <div className="flex items-end ml-8 mt-8 mr-8 mb-4">
        <img 
        src="/src/assets/default-pfp-vice-city.png" 
        alt="User Profile Picture" 
        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"    
        />
        {/* username*/}
        <h2 className='pl-4'><span className="text-[var(--vice-pink-rich)] text-[2rem] font-bold">{stats.username}</span></h2>

    </div>
        {/* overall div holding stats, friends, items (subject to change) */}
        <div className="flex items-start space-x-8 ml-8 mr-8">
            {/* friends div */}
            <div className="flex-1 flex flex-col items-start justify-start">
                <div className='space-y-4 w-full'>
                    {friends && friends.length > 0 ? (
                        <>
                            <div>
                                <strong><u>Friends:</u></strong>
                            </div>
                            {friends.map((friend) => (
                                <div key={friend.id} className={friends_box_css}>
                                    <p className={p_css}>{friend.username}</p>
                                </div>
                                ))}
                        </>
                        
                        ) : (
                            <div className='space-y-4 w-full'>
                                <div>
                                    <strong><u>Friends:</u></strong>
                                </div>
                                <div className={friends_box_css}>
                                    <p className={p_css}>No friends yet</p>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            {/* stats div */}
            <div className='flex-1 flex-col items-center justify-center '>
                    
                {stats && (
                    <div className='space-y-4 w-full'>
                        <div>
                            <strong><u>Stats:</u></strong>
                        </div>
                        <div className={stats_box_css}>
                            <p className={p_css}><strong>Wins:</strong> {stats.wins ?? 0}</p>
                        </div>
                        <div className={stats_box_css}>
                            <p className={p_css}><strong>Losses:</strong> {stats.losses ?? 0}</p>
                        </div>
                        <div className={stats_box_css}>
                            <p className={p_css}><strong>Wagers Placed:</strong> {stats.wagersPlaced ?? 0}</p>
                        </div>
                        <div className={stats_box_css}>
                            <p className={p_css}><strong>Win Rate:</strong> {stats.winRate ? `${Number(stats.winRate).toFixed(2)}%` : '0.00%'}</p>
                        </div>
                        <div className={stats_box_css}>
                            <p className={p_css}><strong>Balance:</strong> ${stats.balance ?? 0}</p>
                        </div>
                        <div className={stats_box_css}>
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
            {/* placeholder for friends */}
            <div className="flex-1">
                <p>placeholder for items ??</p>
                </div>
        </div>
        </>
    );
}

export default UserAccount;