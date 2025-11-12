
import { useState, useEffect } from "react";
import { getActivePlayers } from "../../lib/apiClient";
import "./activeUsers.css";

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

  
}

export default ActiveUsers;
