/**
 * PlayerInfo component that displays a player's information at the blackjack table.
 * Shows the player's hand, profile picture, username, balance, and current game status.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-025
 */

import Hand from '../hand/hand';

/**
 * Configuration object mapping player statuses to display labels and glow styles.
 */
const statusConfig = {
  playing: { label: '', glowClass: '' },
  busted: { label: 'BUST', glowClass: 'border-red-500 text-red-500 shadow-[0_0_10px_#ef4444] [text-shadow:0_0_5px_#ef4444]' },
  stand: { label: 'STAND', glowClass: 'border-yellow-400 text-yellow-400 shadow-[0_0_10px_#facc15] [text-shadow:0_0_5px_#facc15]' },
  standby: { label: '', glowClass: '' },
  won: { label: 'WIN', glowClass: 'border-[var(--vice-cyan)] text-[var(--vice-cyan)] shadow-[0_0_10px_var(--vice-cyan)] [text-shadow:0_0_5px_var(--vice-cyan)]' },
  lost: { label: 'LOSE', glowClass: 'border-red-500 text-red-500 shadow-[0_0_10px_#ef4444] [text-shadow:0_0_5px_#ef4444]' },
  push: { label: 'PUSH', glowClass: 'border-yellow-400 text-yellow-400 shadow-[0_0_10px_#facc15] [text-shadow:0_0_5px_#facc15]' },
  blackjack: { label: 'BLACKJACK!', glowClass: 'border-[var(--vice-pink)] text-[var(--vice-pink)] shadow-[0_0_10px_var(--vice-pink)] [text-shadow:0_0_5px_var(--vice-pink)]' },
};

/**
 * PlayerInfo - Displays a player's game state at the blackjack table.
 * @param {Object} props - Component props
 * @param {string} props.username - Player's display name
 * @param {number} props.balance - Player's current balance
 * @param {string} props.profilePicture - URL to player's profile picture
 * @param {Array} props.hand - Array of card objects in the player's hand
 * @param {boolean} props.isCurrentTurn - Whether it's this player's turn
 * @param {string} props.status - Player's current game status
 * @returns {JSX.Element} The player info component
 */
const PlayerInfo = ({
  username = 'Player',
  balance = 0,
  profilePicture = null,
  hand = [],
  isCurrentTurn = false,
  status = 'playing'
  }) => {

  console.log(status);

  const config = statusConfig[status] || statusConfig.playing;
  const turnGlow = isCurrentTurn ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.7)]' : '';

  return (
    <div className={`flex flex-col items-center justify-end gap-1 min-h-[120px] ${status === 'standby' ? 'opacity-50' : ''}`}>

      {/* Hand - fixed height to reserve space */}
      <div className="w-full h-24 flex justify-center items-end relative">
        {hand.length > 0 && (
          <Hand cards={hand} />
        )}
        {/* Status label overlaid on hand */}
        {config.label && (
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <span className={`font-bold text-lg px-3 py-1 rounded-xl border-2 bg-black/60 backdrop-blur-sm transition-all duration-200 ${config.glowClass}`}>
              {config.label}
            </span>
          </div>
        )}
      </div>

      {/* Profile picture below hand */}
      <div className={`w-15 h-15 rounded-full overflow-hidden transition-shadow duration-300 ${turnGlow}`}>
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Username */}
      <div className="">{username}</div>

      {/* Balance below username */}
      <div className="text-green-400 font-medium text-base">${balance.toLocaleString()}</div>

    </div>
  );
};

export default PlayerInfo;
