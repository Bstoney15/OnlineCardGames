/**
 * userticker.jsx
 * 
 * created by Mya Hoersdig
 * displays a scrolling ticker of user stats across the top of the website
 * pulls from different leaderboard categories from the backend (balance, wagers won and lost, total amount won)
 * and shows the top user from each category
 * 
 * fetches all leaderboard stats, if no stats are available a placeholder is created
 * clicking any username should navigate to the leaderboard page
 */

import { getLeaderBoardBalance, getLeaderBoardWagersWon, getLeaderBoardWagersLost, getLeaderBoardAmountWon, getLeaderBoardWagersPlaced } from "../lib/apiClient";
import './ticker.css'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function UserTicker() {
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
              console.error("Failed to fetch player stats:", err);
              setError("Failed to load stats. Please try again.");
          } finally {
              setLoading(false);
          }
      };

      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  let safeUsers = [];
  if (!balanceStats && !wagersWonStats && !wagersLostStats && !amountWonStats && !wagersPlacedStats){
    safeUsers = [{ username: "This could be you", balance: "$10000" }];
  }
  if (balanceStats){
    safeUsers.push({ 
      username: balanceStats.act0_username, 
      balance: "balance: $" + balanceStats.act0_balance
    });
  }
  if (wagersWonStats){
    safeUsers.push({ 
      username: wagersWonStats.act0_username, 
      balance: wagersWonStats.act0_wins + " wagers won"
    });
  }
  if (wagersLostStats){
    safeUsers.push({ 
      username: wagersLostStats.act0_username, 
      balance: wagersLostStats.act0_losses + " wagers lost"
    });
  }
  if (amountWonStats){
    safeUsers.push({ 
      username: amountWonStats.act0_username, 
      balance: "total won: $" + amountWonStats.act0_amountWon
    });
  }
  if (wagersPlacedStats){
    safeUsers.push({ 
      username: wagersPlacedStats.act0_username, 
      balance: wagersPlacedStats.act0_wagersPlaced + " wagers placed"
    });
  }

  // repeat enough times to fill screen width
  const repeatedUsers = [];
  const minItems = 20;
  while (repeatedUsers.length < minItems) {
    repeatedUsers.push(...safeUsers);
  }

  const handleUserClick = (username, balance) => {
  navigate("/leaderBoard");
  };

  return (
    <div className="fixed top-16 left-0 w-full z-40">
      <div className="ticker-wrapper">
        {/* Top ticker */}
        <div className="ticker-container">
        <div className="ticker-content">
          {repeatedUsers.map((user, index) => (
            <div className="ticker-item" key={`top-${index}`}>
              <span className="username clickable"
              onClick={()=>handleUserClick(user.username)} > {user.username} </span>
              <span className="score clicable" onClick={()=>handleUserClick(user.username)} > {user.balance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom ticker going opposite direction */}
      <div className="ticker-container reverse">
        <div className="ticker-content">
          {repeatedUsers.map((user, index) => (
            <div className="ticker-item" key={`top-${index}` + repeatedUsers.length}>
              <span className="username clickable"
              onClick={()=>handleUserClick(user.username)} > {user.username} </span>
              <span className="score clickable" onClick={()=>handleUserClick(user.username)} > {user.balance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

export default UserTicker;