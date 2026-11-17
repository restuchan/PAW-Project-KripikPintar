// AI Assistant (chatbot) untuk pembeli. Frontend hanya berbicara dengan backend (POST /api/chat),
// tidak pernah langsung ke Gemini, dan tidak memegang API key apa pun.
(function () {
  const panel = document.getElementById('chatbot-panel');
  const cfg = document.getElementById('chatbot-config');
  if (!panel || !cfg) return;

  const WA = cfg.dataset.wa;
  const pesanEl = document.getElementById('chatbot-pesan');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const tombolKirim = document.getElementById('chatbot-kirim');
  const tombolUtama = document.getElementById('chatbot-tombol');
  const tombolSaran = document.querySelectorAll('[data-saran]');
  let sudahSapa = false;
  let sedangProses = false;

  function gulir() { pesanEl.scrollTop = pesanEl.scrollHeight; }

  function gelembung(teks, jenis) {
    const el = document.createElement('div');
    const gaya = {
      bot: 'border border-garis bg-white text-tinta',
      user: 'ml-auto bg-hutan text-white',
      galat: 'border border-bata bg-red-50 text-bata font-semibold',
    };
    el.className = 'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ' + gaya[jenis];
    if (jenis === 'galat') el.setAttribute('role', 'alert');
    el.textContent = teks;
    pesanEl.appendChild(el);
    gulir();
    return el;
  }

  // Indikator loading: tiga titik yang bergerak
  function tampilkanMengetik() {
    const el = document.createElement('div');
    el.className = 'flex w-fit items-center gap-1.5 rounded-2xl border border-garis bg-white px-4 py-3';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'Asisten sedang mengetik');
    [0, 150, 300].forEach(function (jeda) {
      const titik = document.createElement('span');
      titik.className = 'h-2 w-2 animate-bounce rounded-full bg-lumut';
      titik.style.animationDelay = jeda + 'ms';
      el.appendChild(titik);
    });
    pesanEl.appendChild(el);
    gulir();
    return el;
  }

  function catatan(teks) {
    const el = document.createElement('p');
    el.className = 'text-xs text-lumut';
    el.textContent = teks;
    pesanEl.appendChild(el);
    gulir();
  }

  function tombolWa() {
    const a = document.createElement('a');
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Halo, saya ingin bertanya tentang produk KripikPintar.');
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn-primary btn-kecil self-start';
    a.textContent = 'Hubungi penjual via WhatsApp';
    pesanEl.appendChild(a);
    gulir();
  }

  function aturProses(proses) {
    sedangProses = proses;
    input.disabled = proses;
    tombolKirim.disabled = proses;
    tombolSaran.forEach(function (b) { b.disabled = proses; });
    pesanEl.setAttribute('aria-busy', proses ? 'true' : 'false');
  }

  function sapa() {
    gelembung('Halo! Aku asisten KripikPintar. Tanya soal harga, stok, rasa, atau cara memesan ya.', 'bot');
  }

  function buka() {
    panel.hidden = false;
    tombolUtama.setAttribute('aria-expanded', 'true');
    if (!sudahSapa) { sudahSapa = true; sapa(); }
    input.focus();
  }

  function tutup() {
    panel.hidden = true;
    tombolUtama.setAttribute('aria-expanded', 'false');
  }

  function tampilGalat(pesan, teksAsli) {
    const el = gelembung(pesan, 'galat');
    const ulang = document.createElement('button');
    ulang.type = 'button';
    ulang.className = 'btn-ghost btn-kecil self-start';
    ulang.textContent = 'Coba Lagi';
    ulang.addEventListener('click', function () {
      el.remove();
      ulang.remove();
      kirim(teksAsli, true);
    });
    pesanEl.appendChild(ulang);
    gulir();
  }

  async function kirim(teks, ulang) {
    const isi = teks.trim();
    if (!isi || sedangProses) return;

    if (!ulang) gelembung(isi, 'user');
    input.value = '';
    aturProses(true);
    const mengetik = tampilkanMengetik();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: isi }),
      });
      let json = null;
      try { json = await res.json(); } catch (e) { /* respons bukan JSON */ }
      if (!res.ok || !json || !json.success) {
        throw new Error((json && json.message) || 'Server tidak merespons dengan benar.');
      }

      mengetik.remove();
      gelembung(json.data.reply, 'bot');
      if (json.data.sumber === 'cadangan') catatan('Jawaban cadangan dari data produk karena AI sedang sibuk.');
      if (json.data.hubungiPenjual) tombolWa();
    } catch (err) {
      mengetik.remove();
      const pesan = err instanceof TypeError ? 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.' : err.message;
      tampilGalat(pesan, isi);
    } finally {
      aturProses(false);
      input.focus();
    }
  }

  async function mulaiBaru() {
    if (sedangProses) return;
    try { await fetch('/api/chat/reset', { method: 'POST' }); } catch (e) { /* abaikan */ }
    pesanEl.textContent = '';
    sapa();
  }

  document.querySelectorAll('[data-buka-chatbot]').forEach(function (b) {
    b.addEventListener('click', function () { panel.hidden ? buka() : input.focus(); });
  });
  document.getElementById('chatbot-tutup').addEventListener('click', tutup);
  document.getElementById('chatbot-reset').addEventListener('click', mulaiBaru);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) tutup(); });
  tombolSaran.forEach(function (b) {
    b.addEventListener('click', function () { kirim(b.dataset.saran); });
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); kirim(input.value); });
})();
