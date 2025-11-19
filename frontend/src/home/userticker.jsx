import { getLeaderBoard } from '../lib/apiClient';
import './ticker.css'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function UserTicker() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              setLoading(true);
              const response = await getLeaderBoard();
              // Backend returns: { success: true, status: 200, time: "...", data: {...} }
              setUsers(response.data);
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
  const safeUsers = users.length > 0 ? users : [{ username: "This could be you! Play today", balance: "$"+1000000 }];
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