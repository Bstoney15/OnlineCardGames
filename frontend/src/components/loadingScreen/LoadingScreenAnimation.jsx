/**
 * LoadingScreenAnimation.jsx
 * 
 * created by Mya Hoersdig
 * displays a splash animation when user enters the website for the first time
 */

import { useEffect, useState } from "react";

function WelcomeAnimation({onComplete}) 
{  
    const[text, setText] = useState("");

    const fullText = "EECS 581 Casino Simulator!"

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, index))
            index++
            if(index >= fullText.length) {
                clearInterval(interval)
                setTimeout(() => {
                 onComplete();   
                }, 1000);
            } 
        }, 100)

        return () => clearInterval(interval)
    }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 text-[var(--white)]"
      style={{
        background:
          'radial-gradient(ellipse at 100% 100%, var(--vice-glow-blue) 0%, var(--vice-glow-purple) 15%, var(--vice-night) 85%)',
      }}
    >
      {/* Loading bar (top) */}
      <div className="w-[300px] h-[10px] bg-[rgba(255,255,255,0.15)] rounded relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[40%] bg-[var(--vice-cyan)] shadow-[0_0_15px_var(--vice-cyan)] animate-loading-bar" />
      </div>

      {/* Text */}
      <div className="mb-4 text-2xl font-mono font-semibold text-center">
        {text}
        <span className="animate-blink ml-1 text-[var(--vice-pink-rich)] font-bold">|</span>
      </div>

      {/* Loading bar (bottom) */}
      <div className="w-[300px] h-[10px] bg-[rgba(255,255,255,0.15)] rounded relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[40%] bg-[var(--vice-cyan)] shadow-[0_0_15px_var(--vice-cyan)] animate-loading-bar" />
      </div>
    </div>
  );
}

export default WelcomeAnimation;