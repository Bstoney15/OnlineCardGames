/**
 * ActiveUsers component that displays the current number of active users.
 * Fetches and polls the server for active player count at regular intervals.
 *
 * @author Benjamin Stonestreet
 * @date 2025-10-28
 */

import { useState, useEffect } from "react";
import { getActivePlayers } from "../../lib/apiClient";
import "./activeUsers.css";

/**
 * ActiveUsers - Displays a live count of currently active users.
 * Polls the server every 5 seconds to update the active user count.
 * @returns {JSX.Element} The active users display component
 */
function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const data = await getActivePlayers();
        setActiveUsers(data.data);
      } catch (error) {
        console.error("Failed to fetch active users:", error);
      }
    };

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="active-users-container">
      <p>Active Users: {activeUsers}</p>
    </div>
  );
}

export default ActiveUsers;
