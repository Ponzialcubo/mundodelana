/**
 * Decorative brand backdrop used where a real photo hasn't been uploaded yet:
 * yarn balls clustered in the top-right corner so the text area (left and
 * bottom) stays clean on every screen size.
 */
export function YarnBackdrop({ className = "" }: { className?: string }) {
  const balls = [
    { cx: 92, cy: 6, r: 15, c: "#E8B4B8" },
    { cx: 76, cy: 14, r: 9, c: "#9CAF88" },
    { cx: 97, cy: 24, r: 7.5, c: "#D9A566" },
    { cx: 64, cy: 4, r: 6, c: "#C9A7D8" },
    { cx: 84, cy: 30, r: 4.5, c: "#8FA3B0" },
  ];
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden bg-[linear-gradient(165deg,#F7F1EA_0%,#F4E6E2_60%,#EEDFD0_100%)] ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin meet" className="absolute right-0 top-0 h-[55%] w-auto max-w-[70%] md:h-[80%]">
        <path d="M40 2 C 55 18, 60 8, 72 22 S 90 40, 100 36" fill="none" stroke="#E8B4B8" strokeWidth=".8" strokeDasharray=".6 2.4" strokeLinecap="round" />
        {balls.map((b) => (
          <g key={`${b.cx}-${b.cy}`}>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.c} opacity=".85" />
            {[-0.5, -0.1, 0.3, 0.65].map((k) => (
              <path
                key={k}
                d={`M ${b.cx - b.r * 0.9} ${b.cy + b.r * k} Q ${b.cx} ${b.cy + b.r * (k - 0.45)} ${b.cx + b.r * 0.9} ${b.cy + b.r * k}`}
                fill="none"
                stroke="#fff"
                strokeOpacity=".45"
                strokeWidth={b.r / 14}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
