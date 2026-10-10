import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, User, Phone, Calendar, Building2, FileText, Sparkles, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function BasvuruFormu({ dark, program, onClose }) {
  // ── Profil'den otomatik doldur ─────────────────────────────────────────────
  const [form, setForm] = useState({
    ad: '', soyad: '', yas: '', telefon: '',
    email: '', sehir: '', motivasyon: '', isAciklamasi: '',
    onayKvkk: false,
  });

  // Kayıtlı profilden otomatik doldur
  useEffect(() => {
    api.profile.get()
      .then(({ profile }) => setForm(prev => ({
        ...prev,
        ad: profile.ad || prev.ad,
        soyad: profile.soyad || prev.soyad,
        yas: profile.yas || prev.yas,
        telefon: profile.telefon || prev.telefon,
      })))
      .catch(() => { /* otomatik doldurma opsiyonel */ });
  }, []);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // ── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ad || !form.soyad || !form.telefon || !form.onayKvkk) return;

    setGonderiliyor(true);
    setHata('');
    try {
      await api.applications.create({
        programId: program.id,
        programTitle: program.title,
        programInstitution: program.institution,
        programAmount: program.amount,
        ...form,
      });
      setBasarili(true);
    } catch (err) {
      setHata(err.message);
    } finally {
      setGonderiliyor(false);
    }
  };

  // ── ESC ile kapat ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Stiller ────────────────────────────────────────────────────────────────
  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const input = dark
    ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-[#F3D5D8] focus:border-[#F3D5D8]'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-[#F3D5D8] focus:border-[#F3D5D8]';

  // ── Başarılı Ekranı ────────────────────────────────────────────────────────
  if (basarili) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className={`relative ${card} border rounded-3xl shadow-2xl max-w-md w-full p-8 text-center z-10`}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className={`text-2xl font-black mb-2 ${text}`}>Başvurunuz Alındı! 🎉</h3>
          <p className={`text-sm mb-2 ${sub}`}>
            <strong className={text}>{program.title}</strong> programına başvurunuz başarıyla kaydedildi.
          </p>
          <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4 my-4 text-left`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">📋</span>
              <span className={`text-xs font-bold ${sub}`}>Başvuru Özeti</span>
            </div>
            <div className="space-y-1">
              <p className={`text-xs ${text}`}>👤 {form.ad} {form.soyad}</p>
              <p className={`text-xs ${text}`}>📞 {form.telefon}</p>
              {form.email && <p className={`text-xs ${text}`}>📧 {form.email}</p>}
              {form.sehir && <p className={`text-xs ${text}`}>📍 {form.sehir}</p>}
              <p className={`text-xs ${sub}`}>📅 {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
          <p className={`text-xs mb-5 ${sub}`}>
            Başvurunuzun durumunu <strong>📋 Takip</strong> sekmesinden izleyebilirsiniz.
          </p>
          <button
            onClick={onClose}
            className="bg-[#1E293B] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg"
          >
            Tamam, Kapat
          </button>
        </div>
      </div>
    );
  }

  // ── Form Ekranı ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative ${card} border rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Üst Kısım — Program Bilgisi ── */}
        <div className="sticky top-0 z-10 rounded-t-3xl" style={{ background: 'linear-gradient(135deg, #A8D5F2, #F7DDE7)' }}>
          <div className="p-5 text-[#1F2D3D]">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#1F2D3D]/70 hover:text-[#1F2D3D] transition">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold bg-white/30 px-2.5 py-1 rounded-full">{program.institution}</span>
            </div>
            <h3 className="text-lg font-black leading-snug pr-8">{program.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="bg-white/30 px-3 py-1 rounded-lg font-bold">{program.amount}</span>
              <span className="text-[#3E5369] text-xs">{program.type}</span>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Profil'den geldi uyarısı */}
          {form.ad && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${dark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Profil bilgileriniz otomatik dolduruldu. Düzenleyebilirsiniz.
            </div>
          )}

          {/* Ad - Soyad (yan yana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>Ad *</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${sub}`} />
                <input
                  type="text" required placeholder="Adınız"
                  value={form.ad} onChange={e => update('ad', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>Soyad *</label>
              <input
                type="text" required placeholder="Soyadınız"
                value={form.soyad} onChange={e => update('soyad', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
              />
            </div>
          </div>

          {/* Telefon - Yaş (yan yana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>Telefon *</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${sub}`} />
                <input
                  type="tel" required placeholder="05XX XXX XX XX"
                  value={form.telefon} onChange={e => update('telefon', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>Yaş</label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${sub}`} />
                <input
                  type="number" min="18" max="99" placeholder="Yaş"
                  value={form.yas} onChange={e => update('yas', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>
          </div>

          {/* E-posta - Şehir (yan yana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>E-posta</label>
              <input
                type="email" placeholder="ornek@mail.com"
                value={form.email} onChange={e => update('email', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${sub}`}>Şehir</label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${sub}`} />
                <input
                  type="text" placeholder="İstanbul"
                  value={form.sehir} onChange={e => update('sehir', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>
          </div>

          {/* İş Açıklaması */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${sub}`}>Girişiminizi Kısaca Anlatın</label>
            <div className="relative">
              <FileText className={`absolute left-3 top-3 w-3.5 h-3.5 ${sub}`} />
              <textarea
                rows={3} placeholder="Ne iş yapıyorsunuz veya ne yapmak istiyorsunuz? Kısaca açıklayın..."
                value={form.isAciklamasi} onChange={e => update('isAciklamasi', e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition resize-none ${input}`}
              />
            </div>
          </div>

          {/* Motivasyon */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${sub}`}>Bu Desteğe Neden İhtiyacınız Var?</label>
            <textarea
              rows={2} placeholder="Desteği ne için kullanmayı planlıyorsunuz?"
              value={form.motivasyon} onChange={e => update('motivasyon', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition resize-none ${input}`}
            />
          </div>

          {/* KVKK Onay */}
          <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${dark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'}`}>
            <input
              type="checkbox"
              checked={form.onayKvkk}
              onChange={e => update('onayKvkk', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1E293B] focus:ring-[#F3D5D8]"
            />
            <span className={`text-xs leading-relaxed ${sub}`}>
              <strong className={text}>KVKK Aydınlatma Metni'ni</strong> okudum ve kişisel verilerimin başvuru sürecinde işlenmesini kabul ediyorum. *
            </span>
          </label>

          {hata && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {hata}
            </div>
          )}

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={gonderiliyor || !form.ad || !form.soyad || !form.telefon || !form.onayKvkk}
            className="w-full bg-[#1E293B] text-white font-black py-3.5 px-4 rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gonderiliyor ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Başvuru Gönderiliyor...</>
            ) : (
              <><Send className="w-4 h-4" /> 🚀 Başvuruyu Gönder</>
            )}
          </button>

          {/* Güvenlik */}
          <div className={`flex items-center justify-center gap-1.5 text-[10px] ${sub}`}>
            <Shield className="w-3 h-3" /> Bilgileriniz hesabınızda güvenle saklanır, yalnızca başvuru sürecinde kullanılır.
          </div>
        </form>
      </div>
    </div>
  );
}
