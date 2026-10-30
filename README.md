Portofolio Aisyah. Halaman utama `index.html` menampilkan lanyard 3D di bagian hero.

Lanyard dan foto sudah tertanam di `lanyard.js`, sehingga halaman bisa dibuka langsung dari
`index.html` atau melalui server lokal (misalnya ekstensi Live Server di VS Code).

## Foto lanyard

Foto dari Google Drive tersedia sebagai `foto.jpg` dan ikut tertanam ke dalam `lanyard.js` saat
build. Gambar sudah dipotong ke area kepala dan bahu agar wajah terlihat jelas di kartu, serta
dioptimalkan supaya lebih cepat dimuat. Untuk menggantinya, ganti `foto.jpg` dan jalankan build lagi.

Tips:
- Gunakan foto persegi yang menampilkan kepala dan bahu, maksimal sekitar 1000 piksel per sisi.
- Foto dipotong menjadi lingkaran pada kartu. Jika memakai foto non-persegi, sesuaikan
  `photoFocus` di konfigurasi untuk mengatur titik potongnya.

## Ubah ukuran dan isi kartu

Ukuran lanyard diatur di `style.css`, dengan tinggi desktop `min(75vh, 620px)` dan tinggi mobile
`min(70vh, 560px)`:

```css
#lanyard { height: 620px; }
@media (max-width: 760px) { #lanyard { order: -1; height: 480px; } }
```

Latar canvas transparan, jadi cocok dengan tema terang maupun gelap. Beri div lebar yang longgar
supaya kartu tidak terpotong saat ditarik jauh.

Untuk mengubah isi kartu, tambahkan konfigurasi berikut sebelum tag script `lanyard.js` di
`index.html`:

```html
<script>
  window.LANYARD_CONFIG = {
    name: 'Aisyah Humairoh Salsabila',
    roles: ['Quality Assurance', 'System Analyst', 'Business Analyst'],
    subtitle: 'Sistem Informasi · Universitas Gunadarma',
    skills: ['Excel', 'Python', 'Power BI'],
    initials: 'AHS',
    photo: 'foto.jpg',               // opsional, ubah jika namanya atau letaknya berbeda
    photoFocus: [0.5, 0.35],          // titik fokus pemotongan foto non-persegi
    linkedin: 'linkedin.com/in/aisyahhumairohsalsabila',
    github: 'github.com/AisyahHumairohSalsabila',
    strapText: 'AISYAH · QA · SA · BA ·',
    offsetX: 0,                      // geser kartu ke kiri (-) atau kanan (+)
    colors: { accent: '#0b6e8f', accent2: '#4fb8d8', strap: '#0b6e8f', ink: '#0e1b26', paper: '#f4f7f9' }
  };
</script>
```

Font di kartu mengikuti font `body` websitemu.

## Catatan

- Animasi berhenti otomatis saat hero tidak terlihat, jadi tidak membebani halaman lain.
- Di layar sentuh, geser vertikal tetap menggulir halaman. Kartu bisa ditarik ke samping.
- Tekstur kartu digambar pada atlas 3072 × 3072 dan dirender hingga DPR 2,25 agar teks dan detail
  lebih tajam pada layar beresolusi tinggi. Perangkat dengan GPU terbatas tetap memakai DPR lebih
  rendah secara otomatis.
- Berat file: lanyard.js sekitar 4,1 MB (termasuk three.js, mesin fisika, model kartu, dan foto).
  File `assets/kartu.glb` tetap diperlukan sebagai sumber saat build ulang.

## Ubah kode lalu build ulang

```
npm install
npm run build
```

Model `assets/kartu.glb` dan foto `foto.jpg` dibundel ke `lanyard.js` sebagai data URL agar model
3D dan foto tetap bisa dimuat saat halaman dibuka langsung lewat `file://`.

Kode lanyard ada di `src/lanyard.jsx`.
