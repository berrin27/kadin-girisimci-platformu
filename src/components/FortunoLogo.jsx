import React, { useId } from 'react';

// Fortuno logosu: Dusty Grape → Vintage Lavender zeminde el sıkışma.
// El sıkışma çizimi Lucide "handshake" ikonundan (ISC lisansı) alındı.
// Aynı tasarım public/favicon.svg'de de var; birini değiştirirsen ötekini de güncelle.
export default function FortunoLogo({ size = 40 }) {
  const grad = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fortuno logosu">
      <rect width="40" height="40" rx="11" fill={`url(#${grad})`} />
      <g transform="translate(8 8)" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </g>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5E6087" />
          <stop offset="1" stopColor="#846B93" />
        </linearGradient>
      </defs>
    </svg>
  );
}
