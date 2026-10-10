import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, onUnauthorized } from './api';
import GirisEkrani from './components/GirisEkrani';

// ── Oturum Kapısı ────────────────────────────────────────────────────────────
// Açılışta oturumu kontrol eder; giriş yapılmamışsa giriş ekranını gösterir.
export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined); // undefined = kontrol ediliyor, null = giriş yok

  useEffect(() => {
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
    // Herhangi bir istekte oturum düşerse giriş ekranına dön
    return onUnauthorized(() => setUser(null));
  }, []);

  const logout = async () => {
    try { await api.auth.logout(); } catch { /* çıkış her durumda yerelde tamamlanır */ }
    setUser(null);
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2B5472]" />
      </div>
    );
  }

  if (!user) return <GirisEkrani onAuthenticated={setUser} />;

  // key: farklı kullanıcı girişinde uygulama durumunu tamamen sıfırla
  return <React.Fragment key={user.id}>{children({ user, logout })}</React.Fragment>;
}
