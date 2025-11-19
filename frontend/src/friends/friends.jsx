import { useState, useEffect } from "react";
import {
  getFriends,
  getFriendRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../lib/apiClient";
import NavBar from "../components/navbar/navbar";
import "./friends.css";

function Friends() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadFriends();
    loadRequests();
    loadSentRequests();
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadFriends();
      loadRequests();
      loadSentRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadFriends = async () => {
    try {
      const response = await getFriends();
      if (response.success) {
        setFriends(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
      setMessage({ text: "Failed to load friends. Please refresh.", type: "error" });
    }
  };

  const loadRequests = async () => {
    try {
      const response = await getFriendRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await getSentRequests();
      if (response.success) {
        setSentRequests(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load sent requests:", error);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await sendFriendRequest(newFriendUsername);
      if (response.success) {
        setMessage({ text: "Friend request sent!", type: "success" });
        setNewFriendUsername("");
        loadSentRequests();
      } else {
        setMessage({ text: response.message || "Failed to send request", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error sending friend request", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      const response = await acceptFriendRequest(friendshipId);
      if (response.success) {
        setMessage({ text: "Friend request accepted!", type: "success" });
        loadFriends();
        loadRequests();
      }
    } catch (error) {
      setMessage({ text: "Error accepting request", type: "error" });
    }
  };

  const handleDeclineRequest = async (friendshipId) => {
    try {
      const response = await declineFriendRequest(friendshipId);
      if (response.success) {
        setMessage({ text: "Friend request declined", type: "success" });
        loadRequests();
      }
    } catch (error) {
      setMessage({ text: "Error declining request", type: "error" });
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const response = await removeFriend(friendshipId);
      if (response.success) {
        setMessage({ text: "Friend removed", type: "success" });
        loadFriends();
      }
    } catch (error) {
      setMessage({ text: "Error removing friend", type: "error" });
    }
  };

  const handleCancelRequest = async (friendshipId) => {
    try {
      const response = await declineFriendRequest(friendshipId);
      if (response.success) {
        setMessage({ text: "Friend request cancelled", type: "success" });
        loadSentRequests();
      }
    } catch (error) {
      setMessage({ text: "Error cancelling request", type: "error" });
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <div className="friends-container">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Friends
        </h1>

        {message.text && (
          <div
            className={`message ${message.type === "success" ? "success" : "error"}`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            Friends ({friends.length})
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests ({requests.length})
          </button>
          <button
            className={`tab ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent ({sentRequests.length})
          </button>
          <button
            className={`tab ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Friend
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Friends List */}
          {activeTab === "friends" && (
            <div className="friends-list">
              {friends.length === 0 ? (
                <div className="empty-state">
                  <p>No friends yet. Add some friends to get started!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.friendshipId} className="friend-card">
                    <div className="friend-info">
                      <div className="friend-header">
                        <h3>{friend.username}</h3>
                        <span
                          className={`status-badge ${
                            friend.isOnline ? "online" : "offline"
                          }`}
                        >
                          {friend.isOnline ? "🟢 Online" : "⚫ Offline"}
                        </span>
                      </div>
                      {friend.currentGame && (
                        <div className="current-game">
                          Playing: {friend.currentGame}
                        </div>
                      )}
                    </div>
                    <div className="friend-actions">
                      {friend.currentGame && friend.isOnline && (
                        <button className="btn-join-game btn-cyan-glow">
                          Join Game
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFriend(friend.friendshipId)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === "requests" && (
            <div className="requests-list">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending friend requests</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.friendshipId} className="request-card">
                    <div className="request-info">
                      <h3>{request.username}</h3>
                      <p>wants to be your friend</p>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                        className="btn-accept btn-cyan-glow"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.friendshipId)}
                        className="btn-decline"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent Requests */}
          {activeTab === "sent" && (
            <div className="requests-list">
              {sentRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending sent requests</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.friendshipId} className="request-card">
                    <div className="request-info">
                      <h3>{request.username}</h3>
                      <p>Pending...</p>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleCancelRequest(request.friendshipId)}
                        className="btn-decline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Friend */}
          {activeTab === "add" && (
            <div className="add-friend-form">
              <h2>Add a Friend</h2>
              <form onSubmit={handleSendRequest}>
                <input
                  type="text"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  placeholder="Enter username"
                  className="friend-input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="btn-send-request btn-cyan-glow"
                  disabled={loading || !newFriendUsername.trim()}
                >
                  {loading ? "Sending..." : "Send Friend Request"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
