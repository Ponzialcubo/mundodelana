/**
 * Decorative brand backdrop (yarn balls and a loose stitch line) used where a
 * real photo hasn't been uploaded yet, so no section ever shows a placeholder.
 */
export function YarnBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden bg-[linear-gradient(160deg,#F7F1EA_0%,#F3E1DF_55%,#EAD9C8_100%)] ${className}`}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <g fill="none" strokeLinecap="round">
          <path d="M-20 400 C 80 330, 140 470, 240 390 S 400 300, 430 360" stroke="#E8B4B8" strokeWidth="3" strokeDasharray="2 9" opacity=".7" />
          {[
            { cx: 330, cy: 400, r: 70, c: "#E8B4B8" },
            { cx: 250, cy: 450, r: 46, c: "#9CAF88" },
            { cx: 375, cy: 300, r: 34, c: "#D9A566" },
            { cx: 60, cy: 90, r: 40, c: "#C9A7D8" },
            { cx: 120, cy: 40, r: 22, c: "#8FA3B0" },
          ].map((b) => (
            <g key={`${b.cx}-${b.cy}`} opacity=".9">
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.c} opacity=".85" />
              {[-0.55, -0.15, 0.25, 0.6].map((k) => (
                <path
                  key={k}
                  d={`M ${b.cx - b.r * 0.9} ${b.cy + b.r * k} Q ${b.cx} ${b.cy + b.r * (k - 0.45)} ${b.cx + b.r * 0.9} ${b.cy + b.r * k}`}
                  stroke="#fff"
                  strokeOpacity=".45"
                  strokeWidth={Math.max(1.5, b.r / 18)}
                />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
