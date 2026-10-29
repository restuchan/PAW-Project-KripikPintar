// Mengubah angka menjadi format rupiah, contoh: 28000 -> "Rp 28.000"
module.exports = function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
};
