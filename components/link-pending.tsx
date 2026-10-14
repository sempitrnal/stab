"use client";

import { useLinkStatus } from "next/link";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`animate-spin ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" opacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" />
    </svg>
  );
}

const BLOOD = "#d0141f";

// Spatter drops thrown from the point: [dx, dy, radius].
const SPLATS: [number, number, number][] = [
  [-11, -5, 1.3],
  [-7, -9, 0.9],
  [-4, 3, 0.8],
  [11, -4, 1.2],
  [7, -9, 0.9],
  [4, 3, 1],
];

// Loader for storefront navigation: a white switchblade that snaps open,
// stabs down, spatters blood from the point and folds shut again.
export function KnifeLoader({ className = "h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 46"
      className={`w-auto overflow-visible ${className}`}
      aria-hidden
    >
      <defs>
        {/* Film grain: roughened edges plus a flickering speckle mask that
            eats into the knife and the blood on it. */}
        <filter id="knife-grain" x="-15%" y="-5%" width="130%" height="115%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="noise">
            <animate
              attributeName="seed"
              values="3;11;5;17;8;23"
              dur="0.6s"
              calcMode="discrete"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.6 0 0 0 -1.05"
            result="speckle"
          />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </defs>
      <ellipse
        className="blood-puddle"
        cx="16"
        cy="39"
        rx="9"
        ry="2.4"
        fill={BLOOD}
        fillOpacity="0.35"
        stroke={BLOOD}
        strokeWidth="0.9"
      />
      {SPLATS.map(([dx, dy, r], i) => (
        <circle
          key={i}
          className="blood-splat"
          cx="16"
          cy="38.5"
          r={r}
          fill={BLOOD}
          style={{ "--dx": `${dx}px`, "--dy": `${dy}px` } as React.CSSProperties}
        />
      ))}
      <g className="knife-stab drop-shadow-[0_1px_2px_rgb(0_0_0/0.4)]">
        <g filter="url(#knife-grain)">
          {/* blade: sits behind the handle, pivots out of it on a spring */}
          <g className="switch-blade">
            <path d="M12.9 15H19.1L18.6 25q-1 6.4-2.6 12Q14.4 31.4 13.4 25z" fill="white" />
            <path d="M16 15h3.1L18.6 25q-1 6.4-2.6 12z" fill="rgb(0 0 0 / 0.14)" />
            <path d="M16 17v16" stroke="rgb(0 0 0 / 0.2)" strokeWidth="0.5" strokeLinecap="round" />
            {/* blood on the point after the hit */}
            <path
              className="knife-blood"
              d="M13.6 27.6q.5 4.6 2.4 9.4 1.9-4.8 2.4-9.4q-2.4 1.3-4.8 0z"
              fill={BLOOD}
            />
          </g>
          {/* handle: slab with grip grooves, push-button and a bolster */}
          <rect x="11.6" y="0" width="8.8" height="16.2" rx="2.6" fill="white" />
          <path
            d="M12.6 2.4h6.8M12.6 4.6h6.8M12.6 6.8h6.8M12.6 9h6.8"
            stroke="rgb(0 0 0 / 0.22)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <circle cx="16" cy="12.2" r="1.15" fill="rgb(0 0 0 / 0.35)" />
          <rect x="10.8" y="14.6" width="10.4" height="2.4" rx="1.2" fill="white" />
          <rect x="10.8" y="15.8" width="10.4" height="1.2" rx="0.6" fill="rgb(0 0 0 / 0.2)" />
          <circle cx="16" cy="15.4" r="0.9" fill="rgb(0 0 0 / 0.45)" />
        </g>
      </g>
      <ellipse className="blood-drip" cx="16" cy="38" rx="0.9" ry="1.5" fill={BLOOD} />
    </svg>
  );
}

// Shows a knife loader centred over the nearest positioned ancestor while the
// surrounding <Link> is navigating. Render it inside the Link; pair it with
// PendingFade to dim the content underneath.
export function LinkOverlay({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`pointer-events-none absolute inset-0 z-10 grid place-items-center text-white ${className}`}
    >
      <KnifeLoader />
    </span>
  );
}

// Fades its children (e.g. a product photo) while the surrounding <Link> is
// navigating. Fills the nearest positioned ancestor; render it inside the Link.
export function PendingFade({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-200 ${
        pending ? "opacity-50" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Small inline spinner that appears next to a link's text while it navigates.
export function LinkSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      role="status"
      aria-label="Loading"
      className="ml-1.5 inline-block align-middle"
    >
      <Spinner className="h-3.5 w-3.5" />
    </span>
  );
}
