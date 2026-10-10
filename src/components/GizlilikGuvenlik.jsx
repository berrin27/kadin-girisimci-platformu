import React, { useState, useEffect } from 'react';
import { bugunYerel } from '../tarih';
import { Shield, Lock, Download, Trash2, Eye, EyeOff, CheckCircle2, AlertTriangle, FileText, Key, Database, Cookie, Loader2 } from 'lucide-react';
import { api } from '../api';

export default function GizlilikGuvenlik({ dark, onHesapSilindi }) {
  const [veriler, setVeriler] = useState(null);
  const [goster, setGoster] = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [silSifre, setSilSifre] = useState('');
  const [siliniyor, setSiliniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [indirildi, setIndirildi] = useState(false);
  const [profilVar, setProfilVar] = useState(false);
  const [basvuruSayisi, setBasvuruSayisi] = useState(0);

  // ── Veri durumunu kontrol et ───────────────────────────────────────────────
  useEffect(() => {
    api.profile.get().then(({ profile }) => setProfilVar(!!profile.ad)).catch(() => {});
    api.kanban.get().then(({ cards }) => setBasvuruSayisi(cards.length)).catch(() => {});
  }, []);

  // ── Verileri Görüntüle ─────────────────────────────────────────────────────
  const handleGoster = async () => {
    if (goster) {
      setGoster(false);
      setVeriler(null);
      return;
    }
    try {
      setVeriler(await api.account.exportData());
      setGoster(true);
      setHata('');
    } catch (err) {
      setHata(err.message);
    }
  };

  // ── Verileri İndir (JSON) ──────────────────────────────────────────────────
  const handleIndir = async () => {
    let data;
    try {
      data = await api.account.exportData();
      setHata('');
    } catch (err) {
      setHata(err.message);
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortuno-verilerim-${bugunYerel()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIndirildi(true);
    setTimeout(() => setIndirildi(false), 3000);
  };

  // ── Hesabı ve Tüm Verileri Sil ────────────────────────────────────────────
  const handleSil = async () => {
    if (!silSifre) return;
    setSiliniyor(true);
    setHata('');
    try {
      await api.account.remove(silSifre);
      onHesapSilindi?.();
    } catch (err) {
      setHata(err.message);
      setSiliniyor(false);
    }
  };

  // ── Stiller ────────────────────────────────────────────────────────────────
  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const detayBg = dark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="max-w-4xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
          <Shield className="w-4 h-4" /> Veri Güvenliği & KVKK
        </div>
        <h2 className={`text-4xl font-black mb-3 ${text}`}>
          Verileriniz Güvende 🔒
        </h2>
        <p className={`max-w-2xl mx-auto text-base ${sub}`}>
          Verileriniz <strong className={dark ? 'text-emerald-400' : 'text-emerald-700'}>yalnızca size ait hesabınızda</strong> saklanır.
          Dilediğiniz an görüntüleyebilir, indirebilir veya kalıcı olarak silebilirsiniz.
        </p>
      </div>

      {/* ── Güvenlik Durumu Kartları ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { ikon: '🔐', label: 'Şifreler', deger: 'scrypt Hash', renk: '#10b981' },
          { ikon: '🍪', label: 'Oturum', deger: 'httpOnly Çerez', renk: '#3b82f6' },
          { ikon: '👤', label: 'Erişim', deger: 'Sadece Siz', renk: '#8b5cf6' },
          { ikon: '📋', label: 'KVKK', deger: 'İndir & Sil', renk: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className={`${card} border rounded-2xl p-4 text-center shadow`}>
            <div className="text-2xl mb-1">{s.ikon}</div>
            <div className="text-sm font-black" style={{ color: s.renk }}>{s.deger}</div>
            <div className={`text-xs font-semibold ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Şifreleme Detayları ────────────────────────────────────── */}
      <div className={`${card} border rounded-2xl shadow-lg p-6 mb-6`}>
        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${text}`}>
          <Lock className="w-5 h-5 text-emerald-500" /> Nasıl Koruyoruz?
        </h3>
        <div className="space-y-3">
          {[
            {
              ikon: <Key className="w-5 h-5 text-[#1E293B]" />,
              baslik: 'Şifreleriniz Okunamaz',
              aciklama: 'Şifreniz hiçbir zaman açık haliyle saklanmaz; rastgele tuz (salt) eklenerek scrypt algoritmasıyla geri döndürülemez şekilde hash\'lenir. Biz dahil kimse şifrenizi göremez.',
            },
            {
              ikon: <Cookie className="w-5 h-5 text-blue-500" />,
              baslik: 'Güvenli Oturum',
              aciklama: 'Oturumunuz, JavaScript\'in erişemediği httpOnly bir çerezle taşınır ve 7 gün sonra kendiliğinden sona erer. Giriş denemeleri kaba kuvvet saldırılarına karşı sınırlandırılır.',
            },
            {
              ikon: <Database className="w-5 h-5 text-emerald-500" />,
              baslik: 'Hesaba Bağlı Veri',
              aciklama: 'Profiliniz, başvurularınız, takip panonuz, favorileriniz ve sohbet geçmişiniz sunucumuzdaki veritabanında yalnızca sizin hesabınızla ilişkilendirilerek saklanır. Başka kullanıcılar erişemez.',
            },
            {
              ikon: <Shield className="w-5 h-5 text-amber-500" />,
              baslik: 'Yapay Zekâ Sohbeti',
              aciklama: 'FortunoAI\'ye yazdığınız mesajlar, yanıt üretilebilmesi için Google Gemini servisine iletilir. Sohbete kimlik numarası, banka bilgisi gibi hassas veriler yazmamanızı öneririz.',
            },
          ].map((item, i) => (
            <div key={i} className={`${detayBg} border rounded-xl p-4 flex items-start gap-3`}>
              <div className="shrink-0 mt-0.5">{item.ikon}</div>
              <div>
                <p className={`font-bold text-sm mb-1 ${text}`}>{item.baslik}</p>
                <p className={`text-xs leading-relaxed ${sub}`}>{item.aciklama}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KVKK Hakları ──────────────────────────────────────────── */}
      <div className={`${card} border rounded-2xl shadow-lg p-6 mb-6`}>
        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${text}`}>
          <FileText className="w-5 h-5 text-amber-500" /> KVKK Kapsamındaki Haklarınız
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { hak: 'Bilgi Edinme', aciklama: 'Hangi verilerinizin işlendiğini öğrenme hakkı', ikon: '📋' },
            { hak: 'Düzeltme', aciklama: 'Yanlış veya eksik verileri düzeltme hakkı', ikon: '✏️' },
            { hak: 'Silme', aciklama: 'Tüm kişisel verilerinizi silme hakkı', ikon: '🗑️' },
            { hak: 'Taşınabilirlik', aciklama: 'Verilerinizi indirme ve taşıma hakkı', ikon: '📥' },
            { hak: 'İtiraz', aciklama: 'Verilerin işlenmesine itiraz etme hakkı', ikon: '🚫' },
            { hak: 'Otomatik Karar', aciklama: 'Otomatik profilleme sonuçlarına itiraz hakkı', ikon: '🤖' },
          ].map((item, i) => (
            <div key={i} className={`${detayBg} border rounded-xl p-3 flex items-start gap-2`}>
              <span className="text-lg">{item.ikon}</span>
              <div>
                <p className={`font-bold text-xs ${text}`}>{item.hak}</p>
                <p className={`text-[11px] ${sub}`}>{item.aciklama}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Veri Yönetim Paneli ────────────────────────────────────── */}
      <div className={`${card} border rounded-2xl shadow-lg p-6 mb-6`}>
        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${text}`}>
          <Database className="w-5 h-5 text-blue-500" /> Veri Yönetim Paneli
        </h3>

        {/* Özet */}
        <div className={`${detayBg} border rounded-xl p-4 mb-5`}>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className={`text-xs font-bold ${sub}`}>Profil Durumu</p>
              <p className={`text-sm font-black flex items-center gap-1 ${profilVar ? 'text-emerald-500' : 'text-slate-400'}`}>
                {profilVar ? <><CheckCircle2 className="w-4 h-4" /> Doldurulmuş</> : '— Boş'}
              </p>
            </div>
            <div>
              <p className={`text-xs font-bold ${sub}`}>Takip Ettiğin Başvuru</p>
              <p className={`text-sm font-black ${text}`}>{basvuruSayisi} adet</p>
            </div>
            <div>
              <p className={`text-xs font-bold ${sub}`}>Oturum</p>
              <p className="text-sm font-black text-emerald-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Güvenli
              </p>
            </div>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-wrap gap-3">
          {/* Verileri Görüntüle */}
          <button
            onClick={handleGoster}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            {goster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {goster ? 'Gizle' : 'Verilerimi Göster'}
          </button>

          {/* Verileri İndir */}
          <button
            onClick={handleIndir}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            {indirildi ? 'İndirildi! ✓' : 'Verilerimi İndir (JSON)'}
          </button>

          {/* Hesabı Sil */}
          {!silOnay && (
            <button
              onClick={() => setSilOnay(true)}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4" /> Hesabımı ve Tüm Verilerimi Sil
            </button>
          )}
        </div>

        {silOnay && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 text-xs font-bold flex items-center gap-1 mb-3">
              <AlertTriangle className="w-4 h-4" /> Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password" autoComplete="current-password" value={silSifre}
                onChange={e => setSilSifre(e.target.value)} placeholder="Onay için şifreniz"
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <button
                onClick={handleSil} disabled={!silSifre || siliniyor}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-50"
              >
                {siliniyor && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Evet, Kalıcı Olarak Sil
              </button>
              <button
                onClick={() => { setSilOnay(false); setSilSifre(''); setHata(''); }}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition ${dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {hata && (
          <div className="mt-4 bg-red-100 text-red-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {hata}
          </div>
        )}

        {/* Veri Önizleme */}
        {goster && veriler && (
          <div className={`mt-4 border rounded-xl overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`px-4 py-2 text-xs font-bold ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              📋 Hesabınızda Kayıtlı Verileriniz
            </div>
            <pre className={`p-4 text-xs overflow-x-auto max-h-72 ${dark ? 'bg-slate-900 text-emerald-400' : 'bg-white text-slate-700'}`}>
              {JSON.stringify(veriler, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ── Gizlilik Politikası ────────────────────────────────────── */}
      <div id="gizlilik-politikasi" className={`${card} border rounded-2xl shadow-lg p-6 scroll-mt-24`}>
        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${text}`}>
          <FileText className="w-5 h-5 text-[#1E293B]" /> Gizlilik Politikası
        </h3>
        <div className={`prose prose-sm max-w-none ${dark ? 'prose-invert' : ''}`}>
          <div className={`space-y-3 text-xs leading-relaxed ${sub}`}>
            <p><strong className={text}>1. Toplanan Veriler:</strong> Ad, soyad, yaş, telefon numarası, e-posta, şehir, sektör bilgisi, girişim aşaması ve medeni durum bilgileri.</p>
            <p><strong className={text}>2. Veri İşleme Amacı:</strong> Kullanıcılara uygun destek programlarını eşleştirmek ve başvuru süreçlerini kolaylaştırmak.</p>
            <p><strong className={text}>3. Veri Saklama:</strong> Veriler, kullanıcı hesabına bağlı olarak platformun sunucusundaki veritabanında saklanır. Şifreler geri döndürülemez biçimde hash'lenir. Hesap silinene kadar saklanır.</p>
            <p><strong className={text}>4. Üçüncü Taraflar:</strong> Verileriniz satılmaz veya pazarlama amacıyla paylaşılmaz. FortunoAI sohbetine yazılan mesajlar, yanıt üretimi için Google Gemini servisine iletilir. Canlı haber akışı için yalnızca kamuya açık RSS beslemeleri okunur.</p>
            <p><strong className={text}>5. Çerezler:</strong> Yalnızca oturumu sürdürmek için zorunlu bir oturum çerezi kullanılır. Reklam veya takip çerezi kullanılmaz. Tema tercihi tarayıcınızda saklanır.</p>
            <p><strong className={text}>6. Veri Silme:</strong> Kullanıcı istediği zaman "Hesabımı ve Tüm Verilerimi Sil" butonu ile hesabını ve tüm verilerini kalıcı olarak silebilir.</p>
            <p><strong className={text}>7. Veri Taşınabilirliği:</strong> KVKK madde 11 kapsamında verilerinizi JSON formatında indirme hakkınız bulunmaktadır.</p>
            <p><strong className={text}>8. İletişim:</strong> Veri güvenliği ile ilgili sorularınız için platform yönetimiyle iletişime geçebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
