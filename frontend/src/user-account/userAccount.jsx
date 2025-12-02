/* 
userAccount.jsx
Description: page to display user account(friends, stats, etc)
Created by: Ryan Grimsley
Date Created: 11/18/25
*/
import { useState, useEffect } from "react";
import { getPlayerStats, getUserFriends, getEquipped, getOwned } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import './account.css'

//function that returns component to be displayed
function UserAccount() {
    // set up state variables
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friends, setFriends] = useState(null);
    const [owned, setOwned] = useState(null);
    const [equipped, setEquipped] = useState(null);
    // when something changes on the page, this func is called
    useEffect(() => {
        // function to fetch the actual account data
        const fetchData = async () => {
            try {
                setLoading(true);
                // set variables with results of get...
                const [statsResponse, friendsResponse, equippedResponse, ownedResponse] = await Promise.all([
                    getPlayerStats(),
                    getUserFriends(),
                    getEquipped(),
                    getOwned(),
                ]);
                //set state variables with the data returned from backend
                setStats(statsResponse.data);
                setFriends(friendsResponse.data);
                setOwned(ownedResponse.data);
                setEquipped(equippedResponse.data);
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
    //if page is loading, display loading spinner
    if (loading) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <LoadingSpinner />
            </div>
        );
    }
    // if there is an error, display it
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h5>Error: {error}</h5>
            </div>
        )
    }
    // tailwind syntax class names to be used in some html items
    const stats_box_css = "round-box w-full"
    const friends_box_css = "friend-box w-full"
    const p_css = "pl-4"
    // set variables only if they exist
    const ownedItems = owned?.items || "";
    const ownedColors = owned?.colors || "";
    const equippedItem = equipped?.item ?? null;
    const equippedColor = equipped?.color ?? null;
    // set item and color names to be displayed
    const itemNames = ["Icon 1", "Icon 2"];
    const colorNames = ["Color 1", "Color 2"];
    // check which items and colors are owned
    const ownedItemList = ownedItems.split("").map((c, i) => ({
        id: i,
        owned: c === "1",
        name: itemNames[i] || `Item ${i+1}`
    }));

    const ownedColorList = ownedColors.split("").map((c, i) => ({
        id: i,
        owned: c === "1",
        name: colorNames[i] || `Color ${i+1}`
    }));

    return (
        <div className='pt-10'>
            {/* display username and pfp */}
            <div className="flex items-end ml-8 mt-8 mr-8 mb-4">
                <img 
                src="/src/assets/default-pfp-vice-city.png" 
                alt="User Profile Picture" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"    
                />
                <h2 className='pl-4'><span className="text-[var(--vice-pink-rich)] text-[2rem] font-bold">{stats.username}</span></h2>
            </div>
            {/* div to hold friends, stats, and items */}
            <div className="flex items-start space-x-8 ml-8 mr-8">
                {/* div to hold friends list */}
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
                        )}
                    </div>
                </div>
                {/* div to hold stats */}
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
                </div>
                {/* div to hold items */}
                <div className="flex-1">
                    <p><strong><u>Owned Items:</u></strong></p>
                    {ownedItemList.map((it) => (
                        <p key={it.id}>{it.name}: {it.owned ? "Owned" : "Not owned"}</p>
                    ))}

                    <br />

                    <p><strong><u>Owned Colors:</u></strong></p>
                    {ownedColorList.map((c) => (
                        <p key={c.id}>{c.name}: {c.owned ? "Owned" : "Not owned"}</p>
                    ))}

                    <br />

                    <p><strong><u>Equipped:</u></strong></p>
                    <p>Item: {equippedItem != null ? itemNames[equippedItem] : "None"}</p>
                    <p>Color: {equippedColor != null ? colorNames[equippedColor] : "None"}</p>
                </div>
            </div>
        </div>
    );
}

export default UserAccount;
