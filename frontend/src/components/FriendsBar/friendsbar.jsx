import { useEffect, useState } from "react";
import { getActivePlayers } from "/src/lib/apiClient";

export default function FriendsBar() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getActivePlayers();
        if (data && Array.isArray(data.data)) {
          setFriends(data.data);
        }
      } catch {
        console.error("Could not load friends");
      }
    };

    fetchFriends();

    // Optional: auto-refresh every 30s
    const interval = setInterval(fetchFriends, 30000);
    return () => clearInterval(interval);
  }, []);

}
