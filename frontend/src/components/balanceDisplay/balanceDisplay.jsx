/**
 * BalanceDisplay component for showing the user's current balance.
 * Displays animated change indicators when the balance increases or decreases.
 *
 * @author Benjamin Stonestreet
 * @date 2025-11-09
 */

import { useState, useEffect, useRef } from 'react';

/**
 * BalanceDisplay - Renders the user's balance with animated change notifications.
 * Shows a green or red indicator that fades up when balance changes.
 * @param {Object} props - Component props
 * @param {number} props.balance - The current balance amount to display
 * @returns {JSX.Element} The balance display component
 */
const BalanceDisplay = ({ balance = 0 }) => {
  const prevBalanceRef = useRef(balance);
  const [change, setChange] = useState(null); // { amount: number, isPositive: boolean }

  useEffect(() => {
    const prevBalance = prevBalanceRef.current;
    const diff = balance - prevBalance;
    
    if (diff !== 0 && prevBalance !== 0) {
      setChange({
        amount: Math.abs(diff),
        isPositive: diff > 0
      });

      // Hide the change indicator after animation
      const timer = setTimeout(() => {
        setChange(null);
      }, 2000);

      prevBalanceRef.current = balance;

      return () => clearTimeout(timer);
    }
    
    prevBalanceRef.current = balance;
  }, [balance]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">Balance:</span>
      <span className="text-green-400 font-bold text-xl relative">
        ${balance.toLocaleString()}
        
        {/* Change indicator */}
        {change && (
          <span
            key={Date.now()} // Force re-render for animation restart
            className={`absolute left-full ml-2 whitespace-nowrap font-bold text-lg ${
              change.isPositive ? 'text-green-400' : 'text-red-500'
            }`}
            style={{
              animation: 'fadeUp 2s ease-out forwards',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {change.isPositive ? '+' : '-'}${change.amount.toLocaleString()}
          </span>
        )}
      </span>

      <style>{`
        @keyframes fadeUp {
          0% {
            opacity: 1;
            transform: translateY(-50%);
          }
          100% {
            opacity: 0;
            transform: translateY(calc(-50% - 20px));
          }
        }
      `}</style>
    </div>
  );
};

export default BalanceDisplay;
