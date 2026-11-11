// Keranjang belanja pembeli. Disimpan di browser (localStorage), bukan di database.
// Checkout = membuat pesan WhatsApp berisi ringkasan pesanan.
(function () {
  const dataEl = document.getElementById('data-produk');
  const cfg = document.getElementById('keranjang-config');
  if (!dataEl || !cfg) return;

  const PRODUK = JSON.parse(dataEl.textContent);
  const KUNCI = 'kp_keranjang_' + cfg.dataset.username;
  const WA = cfg.dataset.wa;

  const panel = document.getElementById('keranjang-panel');
  const overlay = document.getElementById('keranjang-overlay');
  const daftarEl = document.getElementById('keranjang-daftar');
  const kosongEl = document.getElementById('keranjang-kosong');
  const totalEl = document.getElementById('keranjang-total');
  const badge = document.getElementById('jumlah-keranjang');
  const tombolLanjut = document.getElementById('tombol-lanjut');
  const tombolKosongkan = document.getElementById('tombol-kosongkan');
  const langkahKeranjang = document.getElementById('langkah-keranjang');
  const langkahCheckout = document.getElementById('langkah-checkout');
  const ringkasan = document.getElementById('checkout-ringkasan');
  const coNama = document.getElementById('co-nama');
  const coAlamat = document.getElementById('co-alamat');
  const coCatatan = document.getElementById('co-catatan');
  const tombolWa = document.getElementById('tombol-wa');
  const tombolBuka = document.getElementById('tombol-keranjang');

  const rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };
  const cari = function (id) { return PRODUK.find(function (p) { return p.id === id; }); };

  let item = [];
  try {
    const mentah = JSON.parse(localStorage.getItem(KUNCI) || '[]');
    item = Array.isArray(mentah) ? mentah : [];
  } catch (e) { item = []; }

  // Samakan dengan data produk terbaru: buang produk yang hilang, batasi jumlah sesuai stok
  item = item
    .map(function (i) {
      const p = cari(i.id);
      return p && p.stok > 0 ? { id: i.id, qty: Math.max(1, Math.min(i.qty, p.stok)) } : null;
    })
    .filter(Boolean);

  function simpan() {
    try { localStorage.setItem(KUNCI, JSON.stringify(item)); } catch (e) { /* abaikan */ }
  }

  function total() {
    return item.reduce(function (s, i) { return s + cari(i.id).harga * i.qty; }, 0);
  }

  function gambar() {
    daftarEl.textContent = '';
    item.forEach(function (i) {
      const p = cari(i.id);
      const li = document.createElement('li');
      li.className = 'rounded-xl border border-garis p-4';

      const nama = document.createElement('p');
      nama.className = 'font-bold text-daun';
      nama.textContent = p.nama;

      const harga = document.createElement('p');
      harga.className = 'text-sm text-lumut';
      harga.textContent = rupiah(p.harga) + ' x ' + i.qty + ' = ' + rupiah(p.harga * i.qty);

      const baris = document.createElement('div');
      baris.className = 'mt-3 flex items-center justify-between';

      const kontrol = document.createElement('div');
      kontrol.className = 'flex items-center gap-2';
      const kurang = tombolKecil('-', 'Kurangi jumlah ' + p.nama, function () { ubahJumlah(i.id, -1); });
      const qty = document.createElement('span');
      qty.className = 'min-w-[2rem] text-center font-bold';
      qty.textContent = i.qty;
      const tambah = tombolKecil('+', 'Tambah jumlah ' + p.nama, function () { ubahJumlah(i.id, 1); });
      kontrol.append(kurang, qty, tambah);

      const hapus = document.createElement('button');
      hapus.type = 'button';
      hapus.className = 'min-h-[2.5rem] px-2 text-sm font-semibold text-bata underline underline-offset-4';
      hapus.textContent = 'Hapus';
      hapus.addEventListener('click', function () { hapusItem(i.id); });

      baris.append(kontrol, hapus);
      li.append(nama, harga, baris);
      daftarEl.appendChild(li);
    });

    const kosong = item.length === 0;
    daftarEl.hidden = kosong;
    kosongEl.hidden = !kosong;
    tombolLanjut.disabled = kosong;
    tombolKosongkan.hidden = kosong;
    totalEl.textContent = rupiah(total());
    badge.textContent = item.reduce(function (s, i) { return s + i.qty; }, 0);
  }

  function tombolKecil(label, aria, aksi) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.className = 'inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-hutan text-lg font-bold text-hutan hover:bg-pucuk';
    b.textContent = label;
    b.addEventListener('click', aksi);
    return b;
  }

  function tambahItem(id) {
    const p = cari(id);
    if (!p || p.stok < 1) return;
    const ada = item.find(function (i) { return i.id === id; });
    if (ada) {
      if (ada.qty >= p.stok) { window.tampilToast('Jumlah mencapai stok yang tersedia', 'galat'); return; }
      ada.qty += 1;
    } else {
      item.push({ id: id, qty: 1 });
    }
    simpan(); gambar();
    window.tampilToast(p.nama + ' ditambahkan ke keranjang');
  }

  function ubahJumlah(id, selisih) {
    const i = item.find(function (x) { return x.id === id; });
    const p = cari(id);
    if (!i) return;
    const baru = i.qty + selisih;
    if (baru < 1) return hapusItem(id);
    if (baru > p.stok) { window.tampilToast('Jumlah mencapai stok yang tersedia', 'galat'); return; }
    i.qty = baru;
    simpan(); gambar();
  }

  function hapusItem(id) {
    item = item.filter(function (i) { return i.id !== id; });
    simpan(); gambar();
  }

  function kosongkan() { item = []; simpan(); gambar(); }

  // ----- Buka / tutup panel -----
  function buka() {
    panel.hidden = false;
    overlay.hidden = false;
    tampilkanLangkah('keranjang');
    document.getElementById('keranjang-tutup').focus();
  }
  function tutup() {
    panel.hidden = true;
    overlay.hidden = true;
    tombolBuka.focus();
  }
  function tampilkanLangkah(nama) {
    langkahKeranjang.hidden = nama !== 'keranjang';
    langkahCheckout.hidden = nama !== 'checkout';
    langkahKeranjang.classList.toggle('flex', nama === 'keranjang');
    langkahCheckout.classList.toggle('flex', nama === 'checkout');
  }

  // ----- Checkout -----
  function periksaCheckout() {
    tombolWa.disabled = !(coNama.value.trim() && coAlamat.value.trim());
  }

  function ringkasanTeks() {
    return item.map(function (i, n) {
      const p = cari(i.id);
      return (n + 1) + '. ' + p.nama + ' x' + i.qty + ' = ' + rupiah(p.harga * i.qty);
    });
  }

  function bukaCheckout() {
    ringkasan.textContent = '';
    ringkasanTeks().forEach(function (baris) {
      const p = document.createElement('p');
      p.textContent = baris;
      ringkasan.appendChild(p);
    });
    const sub = document.createElement('p');
    sub.className = 'mt-2 font-bold text-daun';
    sub.textContent = 'Subtotal: ' + rupiah(total()) + ' (belum termasuk ongkir)';
    ringkasan.appendChild(sub);

    if (!coNama.value) coNama.value = cfg.dataset.username;
    tampilkanLangkah('checkout');
    periksaCheckout();
    coAlamat.focus();
  }

  function kirimWa(e) {
    e.preventDefault();
    if (tombolWa.disabled) return;
    const pesan = [
      'Halo, saya ingin memesan kripik dari KripikPintar:',
      '',
      ringkasanTeks().join('\n'),
      '',
      'Subtotal: ' + rupiah(total()) + ' (belum termasuk ongkir)',
      '',
      'Nama: ' + coNama.value.trim(),
      'Alamat: ' + coAlamat.value.trim(),
    ];
    if (coCatatan.value.trim()) pesan.push('Catatan: ' + coCatatan.value.trim());
    pesan.push('', 'Mohon konfirmasi ketersediaan stok, ongkir, dan cara pembayarannya. Terima kasih!');

    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(pesan.join('\n')), '_blank', 'noopener');
    window.tampilToast('WhatsApp dibuka. Kirim pesannya ke penjual.');
  }

  // ----- Pasang event -----
  document.querySelectorAll('[data-tambah]').forEach(function (b) {
    b.addEventListener('click', function () { tambahItem(Number(b.dataset.tambah)); });
  });
  tombolBuka.addEventListener('click', buka);
  document.getElementById('keranjang-tutup').addEventListener('click', tutup);
  overlay.addEventListener('click', tutup);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) tutup(); });
  tombolLanjut.addEventListener('click', bukaCheckout);
  tombolKosongkan.addEventListener('click', kosongkan);
  document.getElementById('tombol-kembali').addEventListener('click', function () { tampilkanLangkah('keranjang'); });
  coNama.addEventListener('input', periksaCheckout);
  coAlamat.addEventListener('input', periksaCheckout);
  langkahCheckout.addEventListener('submit', kirimWa);

  gambar();
})();
