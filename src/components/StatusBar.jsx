import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const { txStatus, setTxStatus } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (txStatus) {
      // Animate progress bar for pending transactions
      if (txStatus.type === 'pending') {
        setProgress(0);
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);
        return () => clearInterval(interval);
      } else {
        setProgress(100);
        // Auto-hide after 5 seconds for non-pending statuses
        const timer = setTimeout(() => {
          setTxStatus(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [txStatus, setTxStatus]);

  if (!txStatus) return null;

  const getStyles = () => {
    switch (txStatus.type) {
      case 'pending':
        return {
          bg: 'bg-gradient-to-r from-[#147DE1]/10 to-[#B1E5F5]/10',
          border: 'border-[#147DE1]/30',
          text: 'text-[#147DE1]',
          icon: 'text-[#147DE1]',
          glow: 'shadow-[0_0_15px_rgba(20,125,225,0.3)]',
          progress: 'bg-gradient-to-r from-[#147DE1] to-[#B1E5F5]',
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: 'text-emerald-400',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          progress: 'bg-gradient-to-r from-emerald-500 to-green-500',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/10 to-red-600/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          progress: 'bg-gradient-to-r from-red-500 to-red-600',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-[#147DE1]/10 to-[#B1E5F5]/10',
          border: 'border-[#147DE1]/30',
          text: 'text-[#147DE1]',
          icon: 'text-[#147DE1]',
          glow: 'shadow-[0_0_15px_rgba(20,125,225,0.3)]',
          progress: 'bg-gradient-to-r from-[#147DE1] to-[#B1E5F5]',
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (txStatus.type) {
      case 'pending':
        return 'schedule';
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className={`fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 max-w-md mx-auto animate-slide-down`}>
      <div className={`
        relative backdrop-blur-xl rounded-2xl border ${styles.border} ${styles.bg} ${styles.glow}
        transition-all duration-500 overflow-hidden
      `}>
        {/* Animated gradient background for pending state */}
        {txStatus.type === 'pending' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div 
            className={`h-full ${styles.progress} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative px-5 py-4 flex items-center gap-3">
          {/* Icon with animation */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            ${styles.bg} border ${styles.border}
            ${txStatus.type === 'pending' ? 'animate-pulse' : 'animate-scale-in'}
          `}>
            {txStatus.type === 'pending' ? (
              <svg className={`animate-spin w-5 h-5 ${styles.icon}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className={`material-symbols-outlined text-xl ${styles.icon}`} style={{fontVariationSettings:"'FILL' 1"}}>
                {getIcon()}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${styles.text} leading-relaxed`}>
              {txStatus.msg}
            </p>
            {txStatus.type === 'pending' && (
              <p className="text-[10px] text-white/40 mt-0.5 font-mono">
                Processing on Stellar Testnet...
              </p>
            )}
            {txStatus.type === 'success' && (
              <p className="text-[10px] text-emerald-400/60 mt-0.5 font-mono">
                ✓ Transaction confirmed on blockchain
              </p>
            )}
            {txStatus.type === 'error' && (
              <p className="text-[10px] text-red-400/60 mt-0.5 font-mono">
                ✗ Transaction rejected by network
              </p>
            )}
          </div>

          {/* Close button */}
          {txStatus.type !== 'pending' && (
            <button
              onClick={() => setTxStatus(null)}
              className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                ${styles.bg} border ${styles.border} ${styles.text}
                hover:scale-110 transition-all duration-300
                opacity-60 hover:opacity-100
              `}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}