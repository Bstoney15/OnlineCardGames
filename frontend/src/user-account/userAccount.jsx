import { useState, useEffect } from "react";
import { getPlayerStats, getUserFriends, getEquipped, getOwned, equipItem } from "../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { PFP_MAP } from "../assets/pfps";
import { COLOR_MAP, COLOR_NAMES } from "../assets/colors";
import './account.css'

function UserAccount() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friends, setFriends] = useState(null);
    const [owned, setOwned] = useState(null);
    const [equipped, setEquipped] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsResponse, friendsResponse, equippedResponse, ownedResponse] = await Promise.all([
                    getPlayerStats(),
                    getUserFriends(),
                    getEquipped(),
                    getOwned(),
                ]);
                setStats(statsResponse.data);
                setFriends(friendsResponse.data);

                setOwned(ownedResponse.data);

                // normalize equipped data
                setEquipped({
                    pfp: equippedResponse.data?.item ?? equippedResponse.data?.pfp ?? null,
                    color: equippedResponse.data?.color ?? equippedResponse.data?.equiped_color ?? null
                });

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

    if (loading) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center'>
                <LoadingSpinner />
            </div>
        );
    }

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

    const ownedItems = owned?.items || "";
    const ownedColors = owned?.colors || "";
    const equippedItem = equipped?.pfp ?? null;
    const equippedColor = equipped?.color ?? null;

    const itemNames = Object.keys(PFP_MAP).map(id => `Icon ${id}`);
    const colorNames = Object.keys(COLOR_MAP).map(id => `Color ${id}`);

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

    // only treat an item/color as equipped if it's actually owned
    const safeEquippedItem =
        equippedItem != null &&
        ownedItemList[equippedItem] &&
        ownedItemList[equippedItem].owned
            ? equippedItem
            : null;

    const safeEquippedColor =
        equippedColor != null &&
        ownedColorList[equippedColor] &&
        ownedColorList[equippedColor].owned
            ? equippedColor
            : null;

    return (
    <>
    <div className="flex items-start space-x-8 mt-16 ml-8 mr-8">
        <img 
            src={safeEquippedItem !== null
                ? PFP_MAP[safeEquippedItem].src
                : "/src/assets/default-pfp-vice-city.png"}
            alt="User Profile Picture" 
            className="w-20 h-20 rounded-full object-cover border-6 border-gray-300" 
            style={{
                borderColor:
                    safeEquippedColor !== null
                        ? COLOR_MAP[safeEquippedColor]
                        : "gray",
                borderStyle: "solid",
            }}
        />
        <h2 className='pl-4'><span className="text-[var(--vice-pink-rich)] text-[2rem] font-bold">{stats.username}</span></h2>
    </div>
        <div className="flex items-start space-x-8 ml-8 mr-8">
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
            <div className="flex-1">
                <strong><u>Owned Profile Pictures:</u></strong>

                <div className="grid grid-cols-4 gap-4 mt-4">
                    {ownedItemList.map(item => item.owned && ( 
                        <div
                            key={item.id} 
                            className="flex flex-col items-center cursor-pointer"
                            onClick={async () => {

                                const updated = {
                                    ...equipped,
                                    pfp: item.id,
                                };

                                // SAVE TO BACKEND
                                await equipItem(item.id, null);

                                setEquipped(updated);
                            }}
                            >
                                <img
                                    src={PFP_MAP[item.id].src}
                                    alt={item.name}
                                    className={`w-20 h-20 rounded-full object-cover border-4 ${
                                        safeEquippedItem === item.id ? "border-[var(--vice-pink-rich)]" : "border-gray-400"
                                    }`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <strong><u>Owned Colors:</u></strong>

                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {ownedColorList.map(color => color.owned && color.id !== 0 && (
                                <div
                                    key={color.id}
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={async () => {

                                        const updated = {
                                            ...equipped,
                                            color: color.id,
                                        };

                                        // SAVE TO BACKEND
                                        await equipItem(null, color.id);

                                        setEquipped(updated);
                                    }}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full border-4 ${
                                            safeEquippedColor === color.id
                                                ? "border-[var(--vice-pink-rich)]" : "border-gray-400"
                                        }`}
                                        style={{
                                            backgroundColor: COLOR_MAP[color.id]
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <p><strong><u>Equipped:</u></strong></p>
                            <p>
                                Item: {safeEquippedItem != null ? PFP_MAP[safeEquippedItem].name : "None"}
                            </p>
                            <p>
                                Color: {safeEquippedColor != null ? COLOR_NAMES[safeEquippedColor] : "None"}
                            </p>
                        </div>
                    </div>
                <div className="flex flex-col items-center justify-center mt-4">
                    <p className="mb-2 text-center">Want more items? Head to the shop!</p>
                    <a
                        href="/store"
                        className="px-4 py-2 bg-[var(--vice-pink-rich)] text-white rounded hover:bg-pink-600 transition"
                    >
                        Go to Shop
                    </a>
                </div>
            </div>
        </div>
    </>
    );
}

export default UserAccount;
