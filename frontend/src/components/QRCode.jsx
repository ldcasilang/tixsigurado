export function QRCode({ value, size = 160, withGlow = true, animated = false }) {
  const N = 11;
  const seed = (value || '').split('').reduce((a, c, i) => (a + c.charCodeAt(0) * (i + 1)) | 0, 0);

  function cellType(x, y) {
    const inTL = x <= 2 && y <= 2;
    const inTR = x >= N - 3 && y <= 2;
    const inBL = x <= 2 && y >= N - 3;
    if (inTL || inTR || inBL) return 'dark';
    const borderTL = x <= 3 && y <= 3;
    const borderTR = x >= N - 4 && y <= 3;
    const borderBL = x <= 3 && y >= N - 4;
    if (borderTL || borderTR || borderBL) return 'light';
    const v = Math.abs(((seed * (x * N + y + 7)) * 2654435761) | 0) % 100;
    return v > 46 ? 'dark' : 'light';
  }

  const cells = Array.from({ length: N * N }, (_, idx) => {
    const x = idx % N;
    const y = Math.floor(idx / N);
    return cellType(x, y);
  });

  const cellSize = size / N;
  const gradientId = `qr-gradient-${seed}`;

  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      {withGlow && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#147DE1]/20 to-[#B1E5F5]/20 blur-xl opacity-75 animate-pulse" />
      )}
      
      {/* Animated border ring */}
      {animated && (
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#147DE1] via-[#B1E5F5] to-[#147DE1] opacity-50 animate-spin-slow" style={{ filter: 'blur(4px)' }} />
      )}
      
      {/* QR Code SVG */}
      <div className={`relative bg-white rounded-xl p-1 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ${animated ? 'animate-pulse-slow' : ''}`}>
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          xmlns="http://www.w3.org/2000/svg"
          className="rounded-lg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#147DE1', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0E5AA8', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="qr-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#147DE1" floodOpacity="0.3" />
            </filter>
          </defs>
          
          {/* Background with subtle gradient */}
          <rect width={size} height={size} fill="white" rx="4" />
          
          {/* QR Code cells with gradient for dark cells */}
          {cells.map((type, idx) => {
            const x = idx % N;
            const y = Math.floor(idx / N);
            if (type !== 'dark') return null;
            
            return (
              <rect
                key={idx}
                x={x * cellSize + 0.5}
                y={y * cellSize + 0.5}
                width={cellSize - 1}
                height={cellSize - 1}
                fill={`url(#${gradientId})`}
                className="transition-opacity duration-300 hover:opacity-80"
                rx={cellSize > 6 ? 1 : 0}
              />
            );
          })}
          
          {/* Center logo placeholder for branded QR codes */}
          {size >= 160 && (
            <g transform={`translate(${size * 0.35}, ${size * 0.35}) scale(0.3)`}>
              <circle cx={size * 0.15} cy={size * 0.15} r={size * 0.1} fill="white" stroke={`url(#${gradientId})`} strokeWidth="4" />
              <text 
                x={size * 0.15} 
                y={size * 0.16} 
                textAnchor="middle" 
                fontSize={size * 0.08}
                fill={`url(#${gradientId})`}
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                T
              </text>
            </g>
          )}
        </svg>
        
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#147DE1] rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#147DE1] rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#147DE1] rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#147DE1] rounded-br-lg" />
      </div>
      
      {/* Scanning animation overlay */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#147DE1] to-transparent animate-scan" />
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.02);
          }
        }
        
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}