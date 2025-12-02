function FriendProfileModal({ friend, onClose, isOnline }) {
  if (!friend) return null;

  function formatJoinDate(dateString) {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
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

  const status = isOnline ? "online" : "offline";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-[var(--vice-night)] via-[var(--vice-blue-dark)] to-[var(--vice-night)] border-2 border-[var(--vice-cyan)] rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-[0_0_40px_rgba(0,255,255,0.5)] relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--vice-cyan)] hover:text-white text-3xl font-bold hover:rotate-90 transition-all duration-300"
        >
          ×
        </button>
        
        {/* Header Section with Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[var(--vice-pink)] via-[var(--vice-purple-deep)] to-[var(--vice-cyan)] p-[3px] mb-4 shadow-[0_0_30px_rgba(0,255,255,0.6)]">
            <div className="w-full h-full rounded-full bg-[var(--vice-night)] flex items-center justify-center">
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--vice-cyan)] to-[var(--vice-pink)]">
                {friend.username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-2 [text-shadow:0_0_20px_var(--vice-cyan)]">
            {friend.username}
          </h2>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/20">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "online"
                  ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse"
                  : "bg-gray-500"
              }`}
            ></div>
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                status === "online" ? "text-green-400" : "text-gray-400"
              }`}
            >
              {status === "online" ? "Online Now" : "Offline"}
            </span>
          </div>
        </div>
        
        {/* Information Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Activity Status */}
          <div className="col-span-2 p-5 rounded-xl bg-black/50 border-2 border-[var(--vice-cyan)]/30 hover:border-[var(--vice-cyan)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--vice-cyan)] text-xs uppercase tracking-widest font-bold mb-2">Activity Status</p>
                <p className={`text-2xl font-bold ${
                  status === "online" ? "text-green-400" : "text-gray-400"
                }`}>
                  {status === "online" ? "Currently Active" : "Not Online"}
                </p>
              </div>
              <div className={`text-4xl ${status === "online" ? "text-green-400" : "text-gray-500"}`}>
                {status === "online" ? "●" : "○"}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="col-span-2 p-5 rounded-xl bg-black/50 border-2 border-[var(--vice-pink)]/30 hover:border-[var(--vice-pink)] hover:shadow-[0_0_20px_rgba(242,125,253,0.4)] transition-all duration-300">
            <p className="text-[var(--vice-pink)] text-xs uppercase tracking-widest font-bold mb-2">Member Since</p>
            <p className="text-white text-2xl font-bold [text-shadow:0_0_10px_var(--vice-pink)]">
              {formatJoinDate(friend.createdAt || friend.CreatedAt)}
            </p>
          </div>
          
          {/* Games Played */}
          <div className="p-5 rounded-xl bg-black/50 border-2 border-[var(--vice-purple-deep)]/30 hover:border-[var(--vice-purple-deep)] hover:shadow-[0_0_20px_rgba(114,9,183,0.4)] transition-all duration-300">
            <p className="text-[var(--vice-purple-deep)] text-xs uppercase tracking-widest font-bold mb-2">Games Played</p>
            <p className="text-white text-2xl font-bold [text-shadow:0_0_10px_var(--vice-purple-deep)]">
              {friend.wagersPlaced || 0}
            </p>
          </div>
          
          {/* Win Rate */}
          <div className="p-5 rounded-xl bg-black/50 border-2 border-[var(--vice-yellow-gold)]/30 hover:border-[var(--vice-yellow-gold)] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-300">
            <p className="text-[var(--vice-yellow-gold)] text-xs uppercase tracking-widest font-bold mb-2">Win Rate</p>
            <p className="text-white text-2xl font-bold [text-shadow:0_0_10px_var(--vice-yellow-gold)]">
              {friend.winRate ? `${friend.winRate.toFixed(1)}%` : "0.0%"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendProfileModal;
