// Hapus produk lewat API (DELETE /api/produk/:id)
(function () {
  document.querySelectorAll('[data-hapus]').forEach(function (tombol) {
    tombol.addEventListener('click', async function () {
      const id = tombol.dataset.hapus;
      const nama = tombol.dataset.nama;
      if (!window.confirm('Hapus produk "' + nama + '"? Tindakan ini tidak bisa dibatalkan.')) return;

      tombol.disabled = true;
      try {
        const res = await fetch('/api/produk/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.pesan || 'Gagal menghapus produk');
        window.pesanBerikutnya('Produk "' + nama + '" berhasil dihapus');
        window.location.reload();
      } catch (err) {
        tombol.disabled = false;
        window.tampilToast(err.message, 'galat');
      }
    });
  });
})();
