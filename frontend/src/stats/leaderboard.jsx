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
                    throw new Error("error getting Balance")
                }
                setBalanceStats(responseBalance.data);
                const responseWagersWon = await getLeaderBoardWagersWon();
                if (responseWagersWon.status == 404){
                    throw new Error("error getting WagersWon")
                }
                setWagersWonStats(responseWagersWon.data);
                const responseWagersLost = await getLeaderBoardWagersLost();
                if (responseWagersLost.status == 404){
                    throw new Error("error getting WagersLost")
                }
                setWagersLostStats(responseWagersLost.data);
                const responseAmountWon = await getLeaderBoardAmountWon();
                if (responseAmountWon.status == 404){
                    throw new Error("error getting AmountWon")
                }
                setAmountWonStats(responseAmountWon.data);
                const responseWagersPlaced = await getLeaderBoardWagersPlaced();
                if (responseWagersPlaced.status == 404){
                    throw new Error("error getting WagersPlaced")
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
    const empty_name = "null"

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            
            <h1>Leader Board</h1>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <h2>Highest Balances</h2>
                    
                    {balanceStats && (
                        <div className='mt-8 space-y-4 w-full max-w-l'>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act0_username ? balanceStats.act0_username : empty_name}</span>'s Balance: <br></br>  
                                    {balanceStats.act0_balance ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act1_username ? balanceStats.act1_username : empty_name}</span>'s Balance: <br></br> 
                                    {balanceStats.act1_balance ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act2_username ? balanceStats.act2_username : empty_name}</span>'s Balance: <br></br> 
                                    {balanceStats.act2_balance ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act3_username ? balanceStats.act3_username : empty_name}</span>'s Balance: <br></br> 
                                    {balanceStats.act3_balance ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{balanceStats.act4_username ? balanceStats.act4_username : empty_name}</span>'s Balance: <br></br> 
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
                        <div className='mt-8 space-y-4 w-full max-w-l'>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act0_username ? wagersWonStats.act0_username : empty_name}</span>'s Wagers Won: <br></br> 
                                    {wagersWonStats.act0_wins ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act1_username ? wagersWonStats.act1_username : empty_name}</span>'s Wagers Won: <br></br> 
                                    {wagersWonStats.act1_wins ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act2_username ? wagersWonStats.act2_username : empty_name}</span>'s Wagers Won: <br></br> 
                                    {wagersWonStats.act2_wins ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act3_username ? wagersWonStats.act3_username : empty_name}</span>'s Wagers Won: <br></br> 
                                    {wagersWonStats.act3_wins ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersWonStats.act4_username ? wagersWonStats.act4_username : empty_name}</span>'s Wagers Won: <br></br> 
                                    {wagersWonStats.act4_wins ?? 0}
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
                        <div className='mt-8 space-y-4 w-full max-w-l'>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act0_username ? wagersLostStats.act0_username : empty_name}</span>'s Wagers Lost: <br></br> 
                                    {wagersLostStats.act0_losses ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act1_username ? wagersLostStats.act1_username : empty_name}</span>'s Wagers Lost: <br></br> 
                                    {wagersLostStats.act1_losses ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act2_username ? wagersLostStats.act2_username : empty_name}</span>'s Wagers Lost: <br></br> 
                                    {wagersLostStats.act2_losses ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act3_username ? wagersLostStats.act3_username : empty_name}</span>'s Wagers Lost: <br></br> 
                                    {wagersLostStats.act3_losses ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersLostStats.act4_username ? wagersLostStats.act4_username : empty_name}</span>'s Wagers Lost: <br></br> 
                                    {wagersLostStats.act4_losses ?? 0}
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
                        <div className='mt-8 space-y-4 w-full max-w-l'>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act0_username ? amountWonStats.act0_username : empty_name}</span>'s Amount Won: <br></br> 
                                    {amountWonStats.act0_amountWon ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act1_username ? amountWonStats.act1_username : empty_name}</span>'s Amount Won: <br></br> 
                                    {amountWonStats.act1_amountWon ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act2_username ? amountWonStats.act2_username : empty_name}</span>'s Amount Won: <br></br> 
                                    {amountWonStats.act2_amountWon ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act3_username ? amountWonStats.act3_username : empty_name}</span>'s Amount Won: <br></br> 
                                    {amountWonStats.act3_amountWon ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{amountWonStats.act4_username ? amountWonStats.act4_username : empty_name}</span>'s Amount Won: <br></br> 
                                    {amountWonStats.act4_amountWon ?? 0}
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
                        <div className='mt-8 space-y-4 w-full max-w-l'>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act0_username ? wagersPlacedStats.act0_username : empty_name}</span>'s Wagers Placed: <br></br> 
                                    {wagersPlacedStats.act0_wagersPlaced ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act1_username ? wagersPlacedStats.act1_username : empty_name}</span>'s Wagers Placed: <br></br> 
                                    {wagersPlacedStats.act1_wagersPlaced ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act2_username ? wagersPlacedStats.act2_username : empty_name}</span>'s Wagers Placed: <br></br> 
                                    {wagersPlacedStats.act2_wagersPlaced ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act3_username ? wagersPlacedStats.act3_username : empty_name}</span>'s Wagers Placed: <br></br> 
                                    {wagersPlacedStats.act3_wagersPlaced ?? 0}
                                </p>
                            </div>
                            <div className={box_css}>
                                <p className={p_css}>
                                    <span className="text-[var(--vice-pink-rich)] font-bold">{wagersPlacedStats.act4_username ? wagersPlacedStats.act4_username : empty_name}</span>'s Wagers Placed: <br></br> 
                                    {wagersPlacedStats.act4_wagersPlaced ?? 0}
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
        </div>
    );
}

export default LeaderBoard;