import { getLeaderBoardBalance } from '../lib/apiClient';
import './ticker.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserTicker() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getLeaderBoardBalance();
        console.log("User Info: ", response);

        const data = response?.data; // fix here
        if (!data || typeof data !== "object") {
          console.error("Invalid accounts data:", data);
          setUsers([]);
          return;
        }

        const usersArray = Object.keys(data)
          .filter(key => key.endsWith("_username"))
          .map(key => {
            const prefix = key.split("_")[0];
            const username = data[key];
            const balance = data[`${prefix}_balance`] ?? 0;
            return { username, balance: " $" + balance.toLocaleString() };
          });

        console.log("Users pulled:", usersArray);
        setUsers(usersArray);

      } catch (err) {
        console.error("Failed to fetch player stats:", err);
        setUsers([]);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const minItems = 20;
  const repeatedUsers = [];

  if (users.length > 0) {
    let i = 0;
    while (repeatedUsers.length < minItems) {
      repeatedUsers.push(users[i % users.length]);
      i++;
    }
  } else {
    repeatedUsers.push({
      username: "This could be you",
      balance: "$10,000"
    });
  }

  const handleUserClick = (username) => {
    navigate(`/leaderBoard/${username}`);
  };

  return (
    <div className="fixed top-16 left-0 w-full z-40">
      <div className="ticker-wrapper">
        {/* Top ticker */}
        <div className="ticker-container">
          <div className="ticker-content">
            {repeatedUsers.map((user, index) => (
              <div className="ticker-item" key={`top-${index}`}>
                <span
                  className="username clickable"
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.username}
                </span>
                <span
                  className="score clickable"
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.balance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom ticker moving opposite direction */}
        <div className="ticker-container reverse">
          <div className="ticker-content">
            {repeatedUsers.map((user, index) => (
              <div className="ticker-item" key={`bottom-${index}`}>
                <span
                  className="username clickable"
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.username}
                </span>
                <span
                  className="score clickable"
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.balance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserTicker;