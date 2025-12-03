/**
 * ActionBar component for the blackjack game interface.
 * Displays the dealer's hand, player's hand, and interactive controls
 * for betting, hitting, standing, and doubling based on the current game phase.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-20
 */

import React from 'react';
import Hand from '../hand/hand';

/**
 * ActionBar - Renders the bottom action bar with game controls and hand displays.
 * @param {Object} props - Component props
 * @param {Array} props.dealerHand - Array of card objects representing the dealer's hand
 * @param {Array} props.playerHand - Array of card objects representing the player's hand
 * @param {string} props.phase - Current game phase (betting, player_turn, dealer_turn, etc.)
 * @param {number} props.betAmount - Current bet amount selected by the player
 * @param {Function} props.onHit - Callback when player chooses to hit
 * @param {Function} props.onStand - Callback when player chooses to stand
 * @param {Function} props.onBet - Callback when player clicks a chip to add to bet
 * @param {Function} props.onDouble - Callback when player chooses to double down
 * @param {Function} props.onClearBet - Callback to clear the current bet
 * @param {Function} props.onPlaceBet - Callback to confirm and place the bet
 * @param {Array} props.chipValues - Array of available chip denominations
 * @returns {JSX.Element} The action bar component
 */
const ActionBar = ({
    dealerHand = [],
    playerHand = [],
    phase,
    betAmount,
    onHit,
    onStand,
    onBet,
    onDouble,
    onClearBet,
    onPlaceBet,
    chipValues = []
}) => {

    return (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-4 z-50">

            {/* Dealers Hand */}
            <div className="glow-box flex flex-col items-center justify-center min-w-[200px] h-40">
                <h3 className="text-[var(--vice-pink)] font-bold mb-2 uppercase tracking-wider text-sm">Dealer</h3>
                <div className="scale-75 origin-center">
                    <Hand cards={dealerHand} />
                </div>
            </div>

            {/* Action Space - used for betting, hitting, standing, etc */}
            <div className="glow-box glow-white flex-1 h-40 flex items-center justify-center max-w-2xl">

                {/* Betting Phase Controls */}
                {phase === "betting" && (
                    <div className="flex flex-col items-center gap-4">

                        {/* Row 1: Bet Amount */}
                        <div className="flex items-center justify-center">
                            <span className="text-[var(--vice-cyan)] font-mono text-xl drop-shadow-[0_0_5px_var(--vice-cyan)]">
                                ${betAmount}
                            </span>
                        </div>

                        {/* Row 2: Controls (Clear, Chips, Bet) */}
                        <div className="flex items-center justify-center gap-4">

                            <button
                                onClick={onClearBet}
                                className="glow-button glow-red w-24"
                                disabled={betAmount === 0}
                            >
                                CLEAR
                            </button>

                            <div className="flex gap-2">
                                {chipValues.map((value) => {
                                    let chipClass = "chip-default";
                                    if (value >= 1000) chipClass = "chip-1000";
                                    else if (value >= 500) chipClass = "chip-500";
                                    else if (value >= 100) chipClass = "chip-100";
                                    else if (value >= 50) chipClass = "chip-50";
                                    else if (value >= 25) chipClass = "chip-25";

                                    return (
                                        <button
                                            key={value}
                                            onClick={() => onBet(value)}
                                            className={`poker-chip ${chipClass} text-xs sm:text-sm`}
                                        >
                                            ${value}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={onPlaceBet}
                                className="btn-cyan-glow px-6 py-2 text-sm w-24"
                                disabled={betAmount === 0}
                            >
                                BET
                            </button>
                        </div>
                    </div>
                )}

                {/* Player Turn Controls */}
                {phase === "player_turn" && (
                    playerHand.length > 0 ? (
                        <div className="flex gap-6 items-center">
                            <button
                                onClick={onHit}
                                className="btn-white-glow min-w-[120px] text-lg tracking-widest"
                            >
                                HIT
                            </button>
                            <button
                                onClick={onStand}
                                className="btn-white-glow min-w-[120px] text-lg tracking-widest"
                            >
                                STAND
                            </button>
                            <button
                                onClick={onDouble}
                                className="btn-white-glow min-w-[120px] text-lg tracking-widest"
                            >
                                DOUBLE
                            </button>

                        </div>
                    ) : (
                        <div className="text-[var(--vice-cyan)] text-xl font-bold tracking-wider animate-pulse drop-shadow-[0_0_10px_var(--vice-cyan)]">
                            WAITING FOR OTHER PLAYERS...
                        </div>
                    )
                )}

                {/* Other Phases (Waiting, Dealer Turn, etc) */}
                {phase !== "betting" && phase !== "player_turn" && (
                    <div className="text-[var(--vice-cyan)] text-xl font-bold tracking-wider animate-pulse drop-shadow-[0_0_10px_var(--vice-cyan)]">
                        {phase === "dealer_turn" ? "DEALER'S TURN..." : "WAITING..."}
                    </div>
                )}
            </div>

            {/* Player Hand */}
            <div className="glow-box flex flex-col items-center justify-center min-w-[200px] h-40">
                <h3 className="text-[var(--vice-cyan)] font-bold mb-2 uppercase tracking-wider text-sm">You</h3>
                <div className="scale-75 origin-center">
                    <Hand cards={playerHand} />
                </div>
            </div>

        </div>
    );
};

export default ActionBar;
