// Chatbot mengambang untuk pembeli (POST /api/chatbot)
(function () {
  const panel = document.getElementById('chatbot-panel');
  const cfg = document.getElementById('chatbot-config');
  if (!panel || !cfg) return;

  const WA = cfg.dataset.wa;
  const pesanEl = document.getElementById('chatbot-pesan');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const tombolUtama = document.getElementById('chatbot-tombol');
  let sudahSapa = false;

  function gelembung(teks, dariBot) {
    const el = document.createElement('div');
    el.className = 'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ' +
      (dariBot ? 'bg-white text-tinta border border-garis' : 'ml-auto bg-hutan text-white');
    el.textContent = teks;
    pesanEl.appendChild(el);
    pesanEl.scrollTop = pesanEl.scrollHeight;
    return el;
  }

  function tombolWa() {
    const a = document.createElement('a');
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Halo, saya ingin bertanya tentang produk KripikPintar.');
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn-primary btn-kecil mt-1 self-start';
    a.textContent = 'Hubungi penjual via WhatsApp';
    pesanEl.appendChild(a);
    pesanEl.scrollTop = pesanEl.scrollHeight;
  }

  function buka() {
    panel.hidden = false;
    tombolUtama.setAttribute('aria-expanded', 'true');
    if (!sudahSapa) {
      sudahSapa = true;
      gelembung('Halo! Aku asisten KripikPintar. Tanya soal harga, stok, rasa, atau cara memesan ya.', true);
    }
    input.focus();
  }

  function tutup() {
    panel.hidden = true;
    tombolUtama.setAttribute('aria-expanded', 'false');
  }

  async function kirim(teks) {
    const isi = teks.trim();
    if (!isi) return;
    gelembung(isi, false);
    input.value = '';
    const mengetik = gelembung('...', true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: isi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.pesan || 'Gagal');
      mengetik.textContent = data.jawaban;
      if (data.aksiWa) tombolWa();
    } catch (err) {
      mengetik.textContent = 'Maaf, chatbot sedang bermasalah. Coba lagi atau hubungi penjual lewat WhatsApp.';
      tombolWa();
    }
    pesanEl.scrollTop = pesanEl.scrollHeight;
  }

  document.querySelectorAll('[data-buka-chatbot]').forEach(function (b) {
    b.addEventListener('click', function () { panel.hidden ? buka() : input.focus(); });
  });
  document.getElementById('chatbot-tutup').addEventListener('click', tutup);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) tutup(); });
  document.querySelectorAll('[data-saran]').forEach(function (b) {
    b.addEventListener('click', function () { kirim(b.dataset.saran); });
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); kirim(input.value); });
})();
