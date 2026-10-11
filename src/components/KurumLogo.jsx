import React from 'react';
import { kurumLogosu } from '../kurumLogolari';

// Program kartlarının üstündeki logolu kapak şeridi
export function KurumKapak({ ad, dark }) {
  const logo = kurumLogosu(ad);
  return (
    <div className={`-mx-5 -mt-5 mb-4 flex h-24 items-center justify-center rounded-t-xl border-b px-6 ${dark ? 'border-slate-700 bg-gradient-to-br from-slate-700 to-slate-800' : 'border-white/10 bg-gradient-to-br from-bronz-800 to-bronz-600'}`}>
      <div className="flex h-14 max-w-[75%] items-center justify-center rounded-xl bg-white px-4 py-2 shadow-sm">
        {logo
          ? <img src={logo} alt={ad} loading="lazy" className="h-10 w-auto max-w-full object-contain" />
          : <span className="line-clamp-2 text-center text-xs font-bold text-slate-700">{ad}</span>}
      </div>
    </div>
  );
}
