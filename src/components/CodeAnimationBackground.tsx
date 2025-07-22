import React, { useMemo } from 'react';

const bubbleColors = [
  '#a855f7', '#06b6d4', '#fbbf24', '#34d399', '#f472b6',
  '#818cf8', '#f87171', '#38bdf8', '#a3e635', '#fef08a'
];

const CodeAnimationBackground = () => {
  const codeWords = useMemo(() => [
    'CodeZone', 'const', 'let', 'var', 'function', '() =>', '{}', '[]',
    'import','CodeZone',':)', 'export', 'default', 'React', 'useState',':)', 'useEffect',
    'if', 'else', 'for','CodeZone', 'while', 'map', 'filter', 'reduce', 'async',
    'await', 'Promise','CodeZone',':)', 'resolve', 'reject', 'try', 'catch', 'finally',
    'class', 'extends', 'super',':)', 'constructor','CodeZone', 'public', 'private',
    'static','CodeZone', 'return', 'true', 'false', 'null','CodeZone', 'undefined', '0', '1'
  ], []);

  const bubbles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => {
      const word = codeWords[Math.floor(Math.random() * codeWords.length)];
      const left = Math.random() * 100; // %
      const size = 14 + Math.random() * 10; // px
      const duration = 8 + Math.random() * 10; // sec
      const delay = Math.random() * 12; // sec
      const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
      const opacity = 0.65 + Math.random() * 0.33;

      return (
        <span
          key={i}
          className="code-bubble"
          style={{
            left: `${left}%`,
            fontSize: `${size}px`,
            color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            opacity,
            filter: word === 'CodeZone' ? 'drop-shadow(0 0 10px #a855f7)' : 'blur(0.4px)'
          }}
        >
          {word}
        </span>
      );
    });
  }, [codeWords]);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-black">
      {/* Animated SVG Waves */}
      <svg
        className="w-full h-full absolute"
        viewBox="0 0 1920 540"
        fill="none"
        style={{ minHeight: '60vh' }}
      >
        <defs>
          <linearGradient id="wave1" x1="0" y1="0" x2="1920" y2="540" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" y1="0" x2="1920" y2="540" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* Wave 1 */}
        <path fill="url(#wave1)" fillOpacity=".23">
          <animate attributeName="d" dur="19s" repeatCount="indefinite"
            values="
            M0 350 Q 640 540 1920 440 V540 H0Z;
            M0 300 Q 900 540 1920 350 V540 H0Z;
            M0 420 Q 640 340 1920 420 V540 H0Z;
            M0 350 Q 640 540 1920 440 V540 H0Z
            " />
        </path>
        {/* Wave 2 */}
        <path fill="url(#wave2)" fillOpacity=".18">
          <animate attributeName="d" dur="25s" repeatCount="indefinite"
            values="
            M0 330 Q 800 460 1920 390 V540 H0Z;
            M0 390 Q 1080 500 1920 365 V540 H0Z;
            M0 460 Q 800 400 1920 385 V540 H0Z;
            M0 330 Q 800 460 1920 390 V540 H0Z
            " />
        </path>
      </svg>
      {/* Floating animated code bubbles */}
      {bubbles}
      <style>{`
        .code-bubble {
          position: absolute;
          bottom: -4em;
          animation-name: code-bubble-rise;
          animation-timing-function: cubic-bezier(.27,.67,.56,1);
          animation-iteration-count: infinite;
          user-select: none;
          font-family: 'Fira Mono', monospace;
          font-weight: 500;
          mix-blend-mode: lighten;
          white-space: nowrap;
          pointer-events: none;
        }
        @keyframes code-bubble-rise {
          0% {
            transform: translateY(0) scale(1) rotate(-5deg);
            opacity: 0.1;
          }
          5% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) scale(1.18) rotate(8deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CodeAnimationBackground;
