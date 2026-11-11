// Form Produk: validasi lalu kirim ke API (POST /api/produk atau PUT /api/produk/:id)
(function () {
  const form = document.getElementById('form-produk');
  if (!form) return;

  const ubah = form.dataset.mode === 'ubah';
  const id = form.dataset.id;
  const kotakGalat = document.getElementById('form-error');
  const tombolAksi = form.querySelectorAll('[data-aksi]');
  const inputFoto = document.getElementById('foto');
  const wadahFoto = document.getElementById('foto-wadah');
  const gambarFoto = document.getElementById('foto-preview');

  const aturan = {
    nama: function (v) { return v.trim() ? '' : 'Nama produk belum diisi'; },
    harga: function (v) {
      if (v.trim() === '') return 'Harga belum diisi';
      return Number.isInteger(Number(v)) && Number(v) >= 0 ? '' : 'Harga harus berupa angka bulat 0 atau lebih';
    },
    stok: function (v) {
      if (v.trim() === '') return 'Stok belum diisi';
      return Number.isInteger(Number(v)) && Number(v) >= 0 ? '' : 'Stok harus berupa angka bulat 0 atau lebih';
    },
    keunggulan: function (v) { return v.trim() ? '' : 'Keunggulan produk belum diisi'; },
    targetPembeli: function (v) { return v.trim() ? '' : 'Target pembeli belum diisi'; },
  };

  function tampilError(nama, pesan) {
    const el = form.querySelector('[data-error="' + nama + '"]');
    const input = form.elements[nama];
    if (el) {
      el.textContent = pesan;
      el.classList.toggle('hidden', !pesan);
    }
    if (input) {
      input.classList.toggle('border-bata', Boolean(pesan));
      input.setAttribute('aria-invalid', pesan ? 'true' : 'false');
    }
  }

  function validasi() {
    let pertama = null;
    Object.keys(aturan).forEach(function (nama) {
      const pesan = aturan[nama](form.elements[nama].value);
      tampilError(nama, pesan);
      if (pesan && !pertama) pertama = form.elements[nama];
    });
    if (pertama) pertama.focus();
    return !pertama;
  }

  // Hapus pesan error saat pengguna mulai memperbaiki
  Object.keys(aturan).forEach(function (nama) {
    form.elements[nama].addEventListener('input', function () { tampilError(nama, ''); });
  });

  // Pratinjau foto yang dipilih
  inputFoto.addEventListener('change', function () {
    const file = inputFoto.files[0];
    tampilError('foto', '');
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      inputFoto.value = '';
      tampilError('foto', 'Ukuran foto maksimal 2 MB');
      return;
    }
    gambarFoto.src = URL.createObjectURL(file);
    wadahFoto.classList.remove('hidden');
  });

  async function kirim(aksi) {
    kotakGalat.classList.add('hidden');
    if (!validasi()) return;

    const fd = new FormData();
    ['nama', 'harga', 'stok', 'keunggulan', 'targetPembeli'].forEach(function (k) {
      fd.append(k, form.elements[k].value.trim());
    });
    if (inputFoto.files[0]) fd.append('foto', inputFoto.files[0]);

    tombolAksi.forEach(function (t) { t.disabled = true; });
    try {
      const res = await fetch(ubah ? '/api/produk/' + id : '/api/produk', {
        method: ubah ? 'PUT' : 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.pesan || 'Gagal menyimpan produk');

      if (aksi === 'caption') {
        window.location.href = '/produk/' + data.data.id + '/caption';
      } else {
        window.pesanBerikutnya('Produk berhasil disimpan');
        window.location.href = '/';
      }
    } catch (err) {
      kotakGalat.textContent = err.message;
      kotakGalat.classList.remove('hidden');
      kotakGalat.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tombolAksi.forEach(function (t) { t.disabled = false; });
    }
  }

  tombolAksi.forEach(function (t) {
    t.addEventListener('click', function () { kirim(t.dataset.aksi); });
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); kirim('simpan'); });
})();
