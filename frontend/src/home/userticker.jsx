//import { getActivePlayers } from '../lib/apiClient';
//import { useState, useEffect } from 'react';
import './ticker.css'
//import { useState, useEffect } from "react";


function UserTicker() {
  const users = [
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
    { username: 'Alice', score: 1200 },
  ];
  //not pulling stuff correctly bc when this is uncommented i just get a blank screen when trying to test lmao
  /*const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getLeaderboardStats();
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data); // set usernames + balances
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard users", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);*/

  // repeat enough times to fill screen width
  const repeatedUsers = [];
  const minItems = 20;
  while (repeatedUsers.length < minItems) {
    repeatedUsers.push(...users);
  }

  return (
    <div className="ticker-wrapper">
      {/* Top ticker */}
      <div className="ticker-container">
        <div className="ticker-content">
          {repeatedUsers.map((user, index) => (
            <div className="ticker-item" key={index}>
              <span className="username">{user.username}</span>
              <span className="score"> {user.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom ticker going opposite direction */}
      <div className="ticker-container reverse">
        <div className="ticker-content">
          {repeatedUsers.map((user, index) => (
            <div className="ticker-item" key={index + repeatedUsers.length}>
              <span className="username">{user.username}</span>
              <span className="score"> {user.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserTicker;