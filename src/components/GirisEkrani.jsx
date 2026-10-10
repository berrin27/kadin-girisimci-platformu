import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

// ── Giriş / Kayıt Ekranı ─────────────────────────────────────────────────────
export default function GirisEkrani({ onAuthenticated }) {
  const [mode, setMode] = useState('giris'); // giris | kayit
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isKayit = mode === 'kayit';

  const switchMode = () => {
    setMode(isKayit ? 'giris' : 'kayit');
    setError('');
    setPassword('');
    setPassword2('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isKayit && password !== password2) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const { user } = isKayit
        ? await api.auth.register(email, password)
        : await api.auth.login(email, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] py-3 pl-10 pr-4 text-sm text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F3D5D8]';

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#A8D5F2] to-[#F7DDE7] p-3 shadow-sm mb-4">
            <Sparkles className="w-7 h-7 text-[#2B5472]" />
          </div>
          <div className="text-2xl font-black tracking-[0.18em] text-[#2B5472]">FORTUNO</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Women Tech AI</div>
        </div>

        <div className="rounded-3xl border border-[#EAE3D9] bg-white p-8 shadow-[0_10px_30px_rgba(30,41,59,0.06)]">
          <h1 className="text-2xl font-black text-[#1E293B] mb-1">
            {isKayit ? 'Hesap Oluştur' : 'Tekrar Hoş Geldin 💜'}
          </h1>
          <p className="text-sm text-[#5B6473] mb-6">
            {isKayit
              ? 'Profilin, başvuruların ve takip panon güvenle saklansın.'
              : 'Hibe yolculuğuna kaldığın yerden devam et.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-[#1E293B]">E-posta</span>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" required autoComplete="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" className={input}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-[#1E293B]">Şifre</span>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'} required minLength={isKayit ? 8 : undefined}
                  autoComplete={isKayit ? 'new-password' : 'current-password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isKayit ? 'En az 8 karakter' : '••••••••'} className={`${input} pr-10`}
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {isKayit && (
              <label className="block">
                <span className="text-xs font-bold text-[#1E293B]">Şifre (tekrar)</span>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                    value={password2} onChange={e => setPassword2(e.target.value)}
                    placeholder="Şifreni tekrar gir" className={input}
                  />
                </div>
              </label>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isKayit ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5B6473]">
            {isKayit ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}{' '}
            <button type="button" onClick={switchMode} className="font-bold text-[#4A1525] hover:underline">
              {isKayit ? 'Giriş yap' : 'Hemen kayıt ol'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
