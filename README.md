# 🌴 LuxeNest: The Modern Villa Booking Experience

![Application Status](https://img.shields.io/badge/Build-Stable-success?style=for-the-badge&logo=html5)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-orange?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-SPA%20(Single%20Page%20Application)-blue?style=for-the-badge)

> **"Experience Bali's finest stays without the loading screens."**

**LuxeNest** adalah sebuah platform pemesanan villa berbasis web yang dirancang untuk mensimulasikan pengalaman aplikasi *native* yang cepat, responsif, dan interaktif. Proyek ini dibangun sepenuhnya menggunakan teknologi web fundamental (**Vanilla JavaScript, HTML5, CSS3**) tanpa bantuan framework/library pihak ketiga (seperti React atau Bootstrap), untuk mendemonstrasikan penguasaan mendalam terhadap konsep inti pengembangan web modern.

---

## 📖 Table of Contents (Daftar Isi)

1.  [Daftar Anggota Tim](#-Daftar-Anggota-Tim)
2.  [Latar Belakang & Filosofi Proyek](#-latar-belakang--filosofi-proyek)
3.  [Bedah Fitur Unggulan](#-bedah-fitur-unggulan)
4.  [Arsitektur Teknis & Engineering](#-arsitektur-teknis--engineering)
5.  [Design System & UI/UX](#-design-system--uiux)
6.  [Panduan Penggunaan Menu](#-panduan-penggunaan-dan-dokumentasi-menu)
7.  [Panduan Instalasi](#-Instalasi-Web)
8.  [Struktur Direktori](#-struktur-direktori)

---

## 👥 Daftar Anggota Tim

Berikut adalah kontributor di balik pengembangan LuxeNest:

1. **I Gusti Ngurah Agung Pradnaya Asmara Kusuma (240040043)**
   * **Github:** [alumnicovids](https://github.com/alumnicovids)
   * **Peran:** **Lead Developer** - Bertanggung jawab atas arsitektur logika website (*Back-end logic simulation*, Routing SPA, State Management, dan Integrasi JSON).

2. **Putu Raditya Dharma Putra (240040015)**
   * **Github:** [radtyadharma](https://github.com/radtyadharma)
   * **Peran:** **UI/UX Designer & Stylist** - Bertanggung jawab atas estetika visual, *Styling* CSS, implementasi konsep *Glassmorphism*, dan responsivitas antarmuka.

---

## 💡 Latar Belakang & Filosofi Proyek

Dalam pengembangan web modern, kecepatan adalah segalanya. Website tradisional seringkali terasa lambat karena harus memuat ulang (reload) seluruh halaman setiap kali pengguna berpindah menu.

**LuxeNest** hadir sebagai solusi **Single Page Application (SPA)**.
* **Zero-Reload Navigation:** Menggunakan teknik manipulasi *History API* dan *Hash Routing*, perpindahan dari halaman "Home" ke "Detail Villa" terjadi secara instan (< 100ms).
* **Pure Vanilla Approach:** Alih-alih bergantung pada "keajaiban" framework, kode ini ditulis secara manual untuk menangani manajemen DOM, *state management* sederhana, dan pengambilan data asinkronus. Ini membuktikan pemahaman kuat tentang bagaimana JavaScript bekerja di balik layar.

---

## 🚀 Bedah Fitur Unggulan

Aplikasi ini bukan sekadar katalog statis. Berikut adalah kapabilitas interaktif yang tertanam di dalamnya:

### 1. Dynamic Data Rendering (JSON-Driven)
Semua konten villa—mulai dari harga, galeri foto, hingga daftar fasilitas—tidak ditulis di HTML (hardcoded). Sebaliknya, aplikasi mengambil data dari `villas.json` secara dinamis.
* **Manfaat:** Memungkinkan update konten villa semudah mengedit file JSON tanpa menyentuh kode program.

### 2. Smart Filtering & Discovery
Pengguna dapat menjelajahi koleksi villa berdasarkan kategori spesifik:
* **Couple Villas:** Kurasi villa romantis dengan privasi tinggi.
* **Family Villas:** Opsi akomodasi luas untuk grup besar.
* **Promo Hunter:** Algoritma otomatis yang mendeteksi villa dengan status `promo: active` dan menampilkan harga diskon secara *real-time*.

### 3. Villa Comparison Tool ⚖️
Fitur canggih yang memungkinkan pengguna membandingkan properti secara *side-by-side*.
* Membandingkan harga per malam.
* Membandingkan kelengkapan fasilitas (kolam renang, bathtub, jumlah tempat tidur).
* Membantu pengguna mengambil keputusan berdasarkan data, bukan hanya gambar.

### 4. Interactive UI Components
Komponen antarmuka dibuat secara *custom* (buatan sendiri) untuk pengalaman premium:
* **Custom Toast Notifications:** Notifikasi halus yang muncul saat tindakan berhasil (misal: "Review Submitted").
* **Overlay & Modals:** Jendela *popup* untuk formulir edit atau input review dengan efek *backdrop blur*.
* **Collapsible Sidebar:** Navigasi samping yang responsif, memaksimalkan ruang layar pada perangkat kecil.

---

## 🛠 Arsitektur Teknis & Engineering

Di balik tampilan antarmuka, terdapat struktur kode yang solid:

### 🧩 Modular JavaScript (ES6 Modules)
Kode tidak ditumpuk dalam satu file raksasa. Logic dipecah berdasarkan tanggung jawabnya (*Separation of Concerns*):
* `routers.js`: "Polisi lalu lintas" yang mengatur konten mana yang harus tampil berdasarkan URL Hash.
* `utils.js`: Kumpulan fungsi pembantu (helper) yang dapat digunakan kembali, seperti format mata uang IDR (`Intl.NumberFormat`) dan generator elemen DOM.
* `villa-list.js`: Logika spesifik untuk merender kartu villa.

### 📡 Asynchronous Fetch API
Menggunakan pola modern `async/await` untuk mengambil data. Ini mensimulasikan komunikasi dengan REST API backend yang sesungguhnya, menangani status *loading* dan potensi *error* jaringan.

### 🎨 CSS Variables & Scoping
Styling dikelola secara terpusat melalui `utils.css` menggunakan CSS Variables (`--primary-color`, `--glass-gradient`). Ini memudahkan penggantian tema warna secara global hanya dengan mengubah satu baris kode.

---

## 🎨 Design System & UI/UX

LuxeNest mengusung gaya visual **Glassmorphism** dan **Tropical Luxury**.

* **Palet Warna:**
    * *Earth Tones:* `#8b5e3c` (Kayu/Tanah) memberikan nuansa hangat dan alami.
    * *Creamy Foam:* `#fcf8f5` sebagai latar belakang yang bersih agar foto villa menonjol.
* **Tipografi:**
    * *Cormorant Garamond:* Font serif untuk judul, memberikan kesan mewah dan elegan.
    * *Montserrat:* Font sans-serif untuk teks tubuh, memastikan keterbacaan yang tinggi.
* **Efek Visual:** Penggunaan `backdrop-filter: blur()` pada kartu dan modal memberikan kedalaman (depth) visual, seolah antarmuka mengapung di atas latar belakang pemandangan Bali.

---

## 🛠 Panduan Penggunaan dan Dokumentasi Menu

Aplikasi ini memiliki alur navigasi yang intuitif dari atas ke bawah:

### 1. Pencarian & Filter (Home, Couple, Family, Promo)
* **Real-time Search:** Masukkan nama villa pada kolom pencarian; hasil akan muncul secara instan saat Anda mengetik.
* **Kategori:** Pilih kategori pada sidebar untuk melihat daftar villa yang telah dikurasi oleh tim LuxeNest.

### 2. Detail Villa
* Klik kartu villa untuk melihat galeri foto resolusi tinggi, kebijakan pembatalan, dan daftar detail kamar. Di sini, Anda juga dapat menekan ikon hati untuk menambahkannya ke **Wishlist**.

### 3. Villa Comparison (Fitur Perbandingan)
* Masuk ke menu **Compare**.
* Gunakan tombol "Select Villa" untuk membuka modal daftar villa.
* Pilih dua villa berbeda, dan tabel akan menyajikan data teknis keduanya untuk membantu Anda mengambil keputusan.

### 4. Booking System
* Pilih villa, isi data pada form reservasi di halaman **Booking**.
* Setelah berhasil, reservasi Anda akan tercatat secara otomatis di halaman **My Booking**.

### 5. Settings (Pengaturan Profil)
* Halaman ini memungkinkan Anda mengubah foto profil (maks. 10MB) dan mengedit data pribadi seperti nama, tanggal lahir, dan kontak. Data ini disimpan secara persisten di browser Anda.

---

## 🛠 Instalasi Web

### 1. Akses Langsung (GitHub Pages)
Project ini telah dideploy dan dapat diakses secara instan melalui tautan resmi berikut:
👉 **[Live Demo LuxeNest](https://alumnicovids.github.io/Frontend-Project/#/)**

---

### 2. Menjalankan di Lingkungan Lokal (Development)
Untuk menjalankan project ini secara lokal, Anda memerlukan **Local Server** agar fitur `fetch()` (untuk memuat data JSON dan halaman parsial) dapat berfungsi dengan benar tanpa terblokir oleh kebijakan keamanan browser (CORS).

#### **Langkah-langkah Menjalankan Project:**

1.  **Clone Repository**
    Buka terminal atau command prompt, lalu jalankan perintah berikut untuk mengunduh source code:
    ```bash
    git clone [https://github.com/alumnicovids/Frontend-Project.git](https://github.com/alumnicovids/Frontend-Project.git)
    ```

2.  **Masuk ke Folder Project**
    ```bash
    cd Frontend-Project
    ```

3.  **Jalankan dengan Local Server (Pilih salah satu)**:
    * **Metode A: VS Code (Live Server)**
        * Instal ekstensi **Live Server** di VS Code.
        * Klik kanan pada file `index.html`.
        * Pilih **Open with Live Server**.
    * **Metode B: Python**
        ```bash
        python -m http.server 8000
        ```
        Lalu buka `http://localhost:8000` di browser.
    * **Metode C: Node.js (npx)**
        ```bash
        npx serve .
        ```

---

## 📂 Struktur Direktori

Berikut adalah peta navigasi kode sumber proyek ini. Struktur ini memisahkan logika (JS), gaya (CSS), dan konten tampilan (HTML Pages) untuk kemudahan pengembangan.

```text
LuxeNest/
├── css/                    # 🎨 Stylesheets
│   ├── utils.css           #    > Variabel global, reset, animasi
│   ├── navbar.css          #    > Styling Sidebar & Navigasi
│   ├── villas-list.css     #    > Grid layout untuk katalog
│   ├── detail.css          #    > Styling halaman detail
│   ├── compare.css         #    > Styling tabel perbandingan
│   ├── booking.css         #    > Styling form booking
│   └── setting.css         #    > Profile info, photo upload, & form styling
├── js/                     # 🧠 Logika Aplikasi (Core Logic)
│   ├── utils.js            #    > Helper functions (Format IDR, Toast, Modals)
│   ├── villa-list.js       #    > Render logika katalog (Home/Couple/Family)
│   ├── compare.js          #    > Logika perbandingan villa
│   ├── booking.js          #    > Logika form booking
│   └── setting.js          #    > Logika pengaturan profil
├── JSON
│    ├── villas.json        # 💾 Database JSON (Sumber data villa)
├── Media
│    ├── FolderFoto_Project # 🖼️ Berisikan Media foto Lokal dari seluruh Villa
├── pages/                  # 📄 Halaman Parsial (SPA Views/Fragments)
│   ├── home.html           #    > Landing page utama
│   ├── detail.html         #    > Template detail spesifik villa
│   ├── couple.html         #    > Kategori: Couple Villas
│   ├── family.html         #    > Kategori: Family Villas
│   ├── promo.html          #    > Kategori: Promo Special
│   ├── compare.html        #    > Fitur perbandingan villa
│   ├── booking.html        #    > Formulir pemesanan
│   ├── my-booking.html     #    > Halaman riwayat pemesanan user
│   ├── wishlist.html       #    > Halaman villa favorit
│   └── setting.html        #    > Pengaturan & edit profil pengguna
├── routers/
│   └── routers.js          # 🧭 Router System (Mengambil file dari folder /pages)
└── index.html              # 🚪 Pintu masuk utama (Main Entry Point / Shell)
