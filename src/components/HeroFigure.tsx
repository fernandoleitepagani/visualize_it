const BAR_HEIGHTS = [58, 84, 110, 96, 146, 186, 172, 218];
const BAR_COLORS = [
  'var(--viz-dim)',
  'var(--viz-dim)',
  'var(--viz-dim)',
  'var(--viz-accent-line)',
  'var(--viz-dim)',
  'var(--viz-accent)',
  'var(--viz-dim)',
  'var(--viz-green)',
];

/**
 * Decorative hero figure: bars become a curve. It is purely presentational,
 * so it stays out of the accessibility tree and respects reduced motion via
 * the global stylesheet.
 */
export function HeroFigure() {
  const baseline = 272;
  const points = BAR_HEIGHTS.map((height, index) => ({
    x: 63 + index * 41,
    y: baseline - height,
  }));

  const path = points.reduce((acc, point, index) => {
    if (index === 0) return `M${point.x} ${point.y}`;
    const previous = points[index - 1];
    const mid = (previous.x + point.x) / 2;
    return `${acc} C ${mid} ${previous.y}, ${mid} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  return (
    <figure className="hero-figure" aria-hidden>
      <svg
        viewBox="0 0 400 312"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <text x="34" y="34" fill="var(--viz-dim)" fontSize="10">
          custo
        </text>
        <text x="332" y="34" fill="var(--viz-accent)" fontSize="11">
          Θ(n log n)
        </text>

        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="34"
            x2="382"
            y1={baseline - line * 60}
            y2={baseline - line * 60}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
        ))}

        <line x1="34" x2="382" y1={baseline} y2={baseline} stroke="var(--viz-line-2)" strokeWidth="1" />

        {points.map((point, index) => (
          <g key={point.x}>
            <rect
              className="hero-bar"
              x={point.x - 11}
              y={point.y}
              width="22"
              height={baseline - point.y}
              rx="6"
              fill={BAR_COLORS[index]}
              opacity={index === 5 || index === 7 ? 0.95 : 0.75}
              style={{ animationDelay: `${index * 55}ms` }}
            />
            <text
              x={point.x}
              y={baseline + 18}
              textAnchor="middle"
              fill="var(--viz-dim)"
              fontSize="9"
            >
              {index}
            </text>
          </g>
        ))}

        <path
          className="hero-curve"
          d={path}
          fill="none"
          stroke="var(--viz-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {points.map((point, index) => (
          <circle
            key={`dot-${point.x}`}
            className="hero-dot"
            cx={point.x}
            cy={point.y}
            r={index === 5 || index === 7 ? 4 : 2.6}
            fill={index === 5 ? 'var(--viz-accent)' : index === 7 ? 'var(--viz-green)' : 'var(--viz-surface)'}
            stroke={index === 7 ? 'var(--viz-green)' : 'var(--viz-accent)'}
            strokeWidth="1.6"
            style={{ animationDelay: `${320 + index * 55}ms` }}
          />
        ))}

      </svg>
    </figure>
  );
}
