import React, { useRef, useEffect, useState } from 'react';

/**
 * Two lines that sweep in from opposite edges and meet at the centre.
 * Represents two lives converging — the core idea behind Sacred.
 *
 * variant="meet"  — lines come from left/right and touch at the bottom centre
 * variant="apart" — lines start at the centre and open outward
 */
export default function ConvergingLines({ variant = 'meet', opacity = 0.35, color = 'white', className = '' }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const meet = variant === 'meet';

  const lineStyle = (delay = 0) => ({
    strokeDasharray: 1,
    strokeDashoffset: visible ? 0 : 1,
    transition: `stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
  });

  return (
    <div
      ref={containerRef}
      className={`hidden md:block w-full pointer-events-none select-none ${className}`}
      style={{ height: '120px' }}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left line */}
        <path
          d={
            meet
              ? 'M 0 20 C 300 20, 480 110, 600 110'
              : 'M 600 10 C 480 10, 300 100, 0 100'
          }
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="1.5"
          pathLength="1"
          style={lineStyle(0)}
        />
        {/* Right line — slight delay so they feel like two separate things coming together */}
        <path
          d={
            meet
              ? 'M 1200 20 C 900 20, 720 110, 600 110'
              : 'M 600 10 C 720 10, 900 100, 1200 100'
          }
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="1.5"
          pathLength="1"
          style={lineStyle(0.25)}
        />
      </svg>
    </div>
  );
}
