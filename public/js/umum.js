// Fungsi bersama: notifikasi (toast)
(function () {
  window.tampilToast = function (pesan, jenis) {
    let wadah = document.getElementById('toast-wadah');
    if (!wadah) {
      wadah = document.createElement('div');
      wadah.id = 'toast-wadah';
      wadah.setAttribute('role', 'status');
      wadah.setAttribute('aria-live', 'polite');
      wadah.className = 'pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4';
      document.body.appendChild(wadah);
    }
    wadah.textContent = ''; // notifikasi baru menggantikan yang lama
    const toast = document.createElement('div');
    toast.textContent = pesan;
    toast.className =
      'pointer-events-auto max-w-md rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl ' +
      (jenis === 'galat' ? 'bg-bata' : 'bg-daun');
    wadah.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3500);
  };

  // Simpan pesan untuk ditampilkan setelah pindah halaman
  window.pesanBerikutnya = function (pesan) {
    try { sessionStorage.setItem('kp_toast', pesan); } catch (e) { /* abaikan */ }
  };

  document.addEventListener('DOMContentLoaded', function () {
    try {
      const pesan = sessionStorage.getItem('kp_toast');
      if (pesan) {
        sessionStorage.removeItem('kp_toast');
        window.tampilToast(pesan);
      }
    } catch (e) { /* abaikan */ }
  });
})();
