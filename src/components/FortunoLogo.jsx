import React from 'react';

// Fortuno logosu — navbar ve footer'da kullanılır
export default function FortunoLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Fortuno Logo">
      <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
      <path d="M10 12h16M10 18h10M10 24h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="22" r="5" fill="white" fillOpacity="0.25" />
      <path d="M24.5 22l2 2 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A8D5F2" />
          <stop offset="1" stopColor="#F7DDE7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
