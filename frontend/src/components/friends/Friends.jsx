import { useState, useEffect } from "react";
import {
  getUserFriends,
  getPendingFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getActivePlayers,
  getOnlineStatus,
} from "../../lib/apiClient";
import NavBar from "../navbar/navbar";
import FriendProfileModal from "../friendProfile/FriendProfileModal";

function Friends() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // 'friends' or 'requests'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [friendsRes, pendingRes, activePlayersRes] = await Promise.all([
        getUserFriends(),
        getPendingFriendRequests(),
        getActivePlayers(),
      ]);

      if (friendsRes?.success && friendsRes?.data) {
        console.log("Friends data:", friendsRes.data);
        const friendsList = Array.isArray(friendsRes.data) ? friendsRes.data : [];
        setFriends(friendsList);
        
        // Fetch online status for all friends
        if (friendsList.length > 0) {
          const friendIds = friendsList.map(f => f.id);
          const statusRes = await getOnlineStatus(friendIds);
          if (statusRes?.success && statusRes?.data) {
            setOnlineStatus(statusRes.data);
          }
        }
      }

      if (pendingRes?.success && pendingRes?.data) {
        setPendingRequests(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      }

      if (activePlayersRes?.success && activePlayersRes?.data) {
        setActivePlayers(activePlayersRes.data);
      }
    } catch (err) {
      setError("Failed to load friends data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newFriendUsername.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      const res = await sendFriendRequest(newFriendUsername.trim());
      if (res?.success) {
        setSuccessMessage(`Friend request sent to ${newFriendUsername}`);
        setNewFriendUsername("");
      } else {
        setError(res?.data || "Failed to send friend request");
      }
    } catch (err) {
      setError("Failed to send friend request");
      console.error(err);
    }
  }

  async function handleAcceptRequest(requestId) {
    setError("");
    setSuccessMessage("");

    try {
      const res = await acceptFriendRequest(requestId);
      if (res?.success) {
        setSuccessMessage("Friend request accepted!");
        fetchData(); // Refresh the lists
      } else {
        setError("Failed to accept friend request");
      }
    } catch (err) {
      setError("Failed to accept friend request");
      console.error(err);
    }
  }

  async function handleRejectRequest(requestId) {
    setError("");
    setSuccessMessage("");

    try {
      const res = await rejectFriendRequest(requestId);
      if (res?.success) {
        setSuccessMessage("Friend request rejected");
        fetchData(); // Refresh the lists
      } else {
        setError("Failed to reject friend request");
      }
    } catch (err) {
      setError("Failed to reject friend request");
      console.error(err);
    }
  }

  // Check if a friend is online based on session data
  function getFriendStatus(friendId) {
    return onlineStatus[friendId] ? "online" : "offline";
  }

  function formatJoinDate(dateString) {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return "Unknown";
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-6 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--vice-cyan)] [text-shadow:0_0_20px_var(--vice-cyan)]">
            Friends
          </h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-500/50 text-red-200 text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded bg-green-900/30 border border-green-500/50 text-green-200 text-center">
            {successMessage}
          </div>
        )}

        {/* Add Friend Form */}
        <div className="mb-8 p-6 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
          <h2 className="text-xl font-semibold text-white mb-4">Send Friend Request</h2>
          <form onSubmit={handleSendRequest} className="flex gap-3">
            <input
              type="text"
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Enter username..."
              className="flex-1 px-4 py-2 rounded bg-black/60 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[var(--vice-cyan)] focus:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded bg-black/60 border border-white/20 text-white font-semibold hover:border-[var(--vice-cyan)] hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all"
            >
              Send
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "friends"
                ? "bg-gradient-to-r from-[var(--vice-cyan)] to-[var(--vice-blue-light)] text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                : "bg-black/40 text-white/70 border border-white/10 hover:border-[var(--vice-cyan)]/50"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all relative ${
              activeTab === "requests"
                ? "bg-gradient-to-r from-[var(--vice-pink)] to-[var(--vice-purple-deep)] text-white shadow-[0_0_20px_rgba(242,125,253,0.4)]"
                : "bg-black/40 text-white/70 border border-white/10 hover:border-[var(--vice-pink)]/50"
            }`}
          >
            Requests ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--vice-pink)] text-white text-xs flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-white/60">Loading...</div>
        ) : (
          <>
            {/* Friends List */}
            {activeTab === "friends" && (
              <div className="space-y-3">
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No friends yet. Send a friend request to get started!
                  </div>
                ) : (
                  friends.map((friend) => {
                    const status = getFriendStatus(friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => setSelectedFriend(friend)}
                        className="p-4 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:border-[var(--vice-cyan)]/50 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--vice-pink)] to-[var(--vice-cyan)] p-[2px]">
                            <div className="w-full h-full rounded-full bg-[var(--vice-night)] flex items-center justify-center">
                              <span className="text-lg font-bold text-[var(--vice-cyan)]">
                                {friend.username?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Username */}
                          <div>
                            <p className="text-white font-semibold">{friend.username}</p>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  status === "online"
                                    ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                                    : "bg-gray-500"
                                }`}
                              ></div>
                              <span
                                className={`text-xs ${
                                  status === "online" ? "text-green-400" : "text-gray-400"
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Pending Requests */}
            {activeTab === "requests" && (
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No pending friend requests
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="p-4 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:border-[var(--vice-pink)]/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--vice-pink)] to-[var(--vice-cyan)] p-[2px]">
                          <div className="w-full h-full rounded-full bg-[var(--vice-night)] flex items-center justify-center">
                            <span className="text-lg font-bold text-[var(--vice-cyan)]">
                              {request.username?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Username */}
                        <div>
                          <p className="text-white font-semibold">{request.username}</p>
                          <p className="text-xs text-white/50">wants to be your friend</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.requestId)}
                          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.requestId)}
                          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Friend Profile Modal */}
        <FriendProfileModal 
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          isOnline={selectedFriend ? getFriendStatus(selectedFriend.id) === "online" : false}
        />
      </div>
    </div>
  );
}

export default Friends;
