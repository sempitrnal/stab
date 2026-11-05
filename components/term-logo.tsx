// The STAB wordmark as block-character art (ANSI Shadow), drawn as SVG cells
// so it stays crisp and lined up at any size, whatever fonts are loaded.
// Solid blocks are full cells; the box-drawing "shadow" is a dim cell.
const ART = [
  "███████╗████████╗ █████╗ ██████╗ ",
  "██╔════╝╚══██╔══╝██╔══██╗██╔══██╗",
  "███████╗   ██║   ███████║██████╔╝",
  "╚════██║   ██║   ██╔══██║██╔══██╗",
  "███████║   ██║   ██║  ██║██████╔╝",
  "╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ",
];

// One character cell is 1 wide by 2 tall, like a terminal glyph.
const COLS = Math.max(...ART.map((r) => [...r].length));
const ROWS = ART.length;

const cells = ART.flatMap((row, y) =>
  [...row].flatMap((ch, x) =>
    ch === " " ? [] : [{ x, y: y * 2, solid: ch === "█" }],
  ),
);

export default function TermLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${COLS} ${ROWS * 2}`}
      className={className}
      role="img"
      aria-label="STAB"
      shapeRendering="crispEdges"
    >
      <g fill="currentColor">
        {cells.map((c) => (
          <rect
            key={`${c.x}-${c.y}`}
            x={c.x}
            y={c.y + (c.solid ? 0 : 0.7)}
            width={c.solid ? 1.02 : 1}
            height={c.solid ? 2.02 : 0.6}
            opacity={c.solid ? 1 : 0.45}
          />
        ))}
      </g>
    </svg>
  );
}
