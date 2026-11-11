// Tombol Masuk/Daftar hanya aktif jika semua kolom sudah terisi dengan benar
(function () {
  document.querySelectorAll('form[data-validasi]').forEach(function (form) {
    const tombol = form.querySelector('[data-tombol]');
    function periksa() { tombol.disabled = !form.checkValidity(); }

    form.addEventListener('input', periksa);
    form.addEventListener('change', periksa);
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) e.preventDefault();
    });
    periksa();
  });
})();
