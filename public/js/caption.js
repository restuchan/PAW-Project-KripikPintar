// Hasil AI: buat caption, salin, buat ulang, simpan, dan lihat riwayat
(function () {
  const wadah = document.querySelector('[data-produk-id]');
  if (!wadah) return;

  const id = wadah.dataset.produkId;
  const teks = document.getElementById('caption-teks');
  const status = document.getElementById('caption-status');
  const galat = document.getElementById('caption-galat');
  const tombolSalin = document.getElementById('tombol-salin');
  const tombolUlang = document.getElementById('tombol-ulang');
  const tombolSimpan = document.getElementById('tombol-simpan');
  const tombolCoba = document.getElementById('tombol-coba');
  let variasiTerakhir;

  function aktif(nilai) {
    teks.disabled = !nilai;
    [tombolSalin, tombolUlang, tombolSimpan].forEach(function (t) { t.disabled = !nilai; });
  }

  async function buat() {
    galat.classList.add('hidden');
    aktif(false);
    status.textContent = 'Menyusun caption...';
    try {
      const res = await fetch('/api/produk/' + id + '/caption/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variasi: variasiTerakhir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.pesan || 'Gagal membuat caption');
      teks.value = data.caption;
      variasiTerakhir = data.variasi;
      status.textContent = 'Caption siap. Kamu bisa mengeditnya sebelum disalin.';
      aktif(true);
    } catch (err) {
      status.textContent = '';
      galat.classList.remove('hidden');
    }
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks.value);
    } catch (e) {
      teks.select();
      document.execCommand('copy');
    }
    status.textContent = 'Caption berhasil disalin';
    window.tampilToast('Caption berhasil disalin');
  }

  async function simpan() {
    const isi = teks.value.trim();
    if (!isi) {
      status.textContent = 'Caption tidak boleh kosong';
      return;
    }
    tombolSimpan.disabled = true;
    try {
      const res = await fetch('/api/produk/' + id + '/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teks: isi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.pesan || 'Gagal menyimpan caption');
      window.pesanBerikutnya('Caption berhasil disimpan');
      window.location.href = '/';
    } catch (err) {
      tombolSimpan.disabled = false;
      window.tampilToast(err.message, 'galat');
    }
  }

  tombolSalin.addEventListener('click', salin);
  tombolUlang.addEventListener('click', buat);
  tombolCoba.addEventListener('click', buat);
  tombolSimpan.addEventListener('click', simpan);

  document.querySelectorAll('[data-lihat]').forEach(function (t) {
    t.addEventListener('click', function () {
      teks.value = decodeURIComponent(t.dataset.lihat);
      teks.disabled = false;
      [tombolSalin, tombolUlang, tombolSimpan].forEach(function (b) { b.disabled = false; });
      status.textContent = 'Caption dari riwayat ditampilkan.';
      teks.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  buat();
})();
