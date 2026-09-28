/* ---------- Setup Supabase ---------- */

const SUPABASE_URL = "https://xtyahgoipkrtcejbirrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_EMCUNoKr1o7Cbvc0_SNQhA_2HDK4ZUu";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Helper pesan sukses/error ---------- */

// Dulu warna pesan (merah/ijo) di-hardcode langsung lewat style.color di
// tiap tempat. Masalahnya warna yang di-hardcode gitu nggak ikut berubah
// pas mode gelap aktif (ijo tua jadi susah kebaca di background gelap).
// Sekarang pakai kelas CSS (.pesan-error / .pesan-sukses) yang warnanya
// diatur lewat variabel tema di style.css, jadi otomatis nyesuain.
function tampilkanPesan(elemen, teks, jenis) {
  // jenis: "error", "sukses", atau "" (netral, misal pas lagi nyimpen)
  elemen.textContent = teks;
  elemen.classList.remove("pesan-error", "pesan-sukses");
  if (jenis === "error") elemen.classList.add("pesan-error");
  if (jenis === "sukses") elemen.classList.add("pesan-sukses");
}

/* ---------- Modal Konfirmasi (custom, gantiin confirm() bawaan) ---------- */

const modalKonfirmasi = document.getElementById("modalKonfirmasi");
const modalJudul = document.getElementById("modalJudul");
const modalPesan = document.getElementById("modalPesan");
const modalBatal = document.getElementById("modalBatal");
const modalLanjut = document.getElementById("modalLanjut");

// Dipake kayak: const jawaban = await tampilkanKonfirmasi("Judul", "Pesan");
// jawaban isinya true kalau user klik Lanjut, false kalau Batal.
function tampilkanKonfirmasi(judul, pesan) {
  modalJudul.textContent = judul;
  modalPesan.textContent = pesan;
  modalKonfirmasi.classList.remove("modal-tersembunyi");

  return new Promise(function (resolve) {
    function bersihkan(hasil) {
      modalKonfirmasi.classList.add("modal-tersembunyi");
      modalBatal.removeEventListener("click", klikBatal);
      modalLanjut.removeEventListener("click", klikLanjut);
      resolve(hasil);
    }
    function klikBatal() {
      bersihkan(false);
    }
    function klikLanjut() {
      bersihkan(true);
    }

    modalBatal.addEventListener("click", klikBatal);
    modalLanjut.addEventListener("click", klikLanjut);
  });
}

/* ---------- Mode Gelap/Terang ---------- */

const btnModeGelap = document.getElementById("btnModeGelap");

// Ikon SVG (Lucide: moon & sun) buat tombol mode gelap/terang. Ditulis
// di JS (bukan cuma HTML) soalnya ikonnya emang ganti-ganti tergantung
// tema yang lagi aktif.
const ikonBulan = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>';
const ikonMatahari = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>';

// Samain tampilan ikon tombol sama tema yang lagi aktif sekarang.
// Dipanggil pas load (buat nyesuain kalau tema gelap udah aktif dari
// script di <head>) dan tiap kali tombolnya diklik.
function perbaruiIkonMode() {
  const modeGelapAktif = document.documentElement.getAttribute("data-theme") === "dark";
  btnModeGelap.innerHTML = modeGelapAktif ? ikonMatahari : ikonBulan;
  btnModeGelap.setAttribute("aria-label", modeGelapAktif ? "Ganti ke mode terang" : "Ganti ke mode gelap");
}

btnModeGelap.addEventListener("click", function () {
  const modeGelapAktif = document.documentElement.getAttribute("data-theme") === "dark";

  if (modeGelapAktif) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("temaWCT", "terang");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("temaWCT", "gelap");
  }

  perbaruiIkonMode();
});

perbaruiIkonMode();

/* ---------- Autentikasi ---------- */

const authBox = document.getElementById("authBox");
const appContent = document.getElementById("appContent");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const pesanAuth = document.getElementById("pesanAuth");
const btnMasuk = document.getElementById("btnMasuk");
const btnDaftar = document.getElementById("btnDaftar");
const btnKeluar = document.getElementById("btnKeluar");
const btnLihatPassword = document.getElementById("btnLihatPassword");

// Tombol mata: gantiin type input password <-> text, ikon ganti
// otomatis lewat CSS berdasar atribut data-terlihat
btnLihatPassword.addEventListener("click", function () {
  const sedangTerlihat = btnLihatPassword.getAttribute("data-terlihat") === "true";
  if (sedangTerlihat) {
    authPassword.type = "password";
    btnLihatPassword.setAttribute("data-terlihat", "false");
    btnLihatPassword.setAttribute("aria-label", "Lihat password");
  } else {
    authPassword.type = "text";
    btnLihatPassword.setAttribute("data-terlihat", "true");
    btnLihatPassword.setAttribute("aria-label", "Sembunyikan password");
  }
});

btnDaftar.addEventListener("click", async function () {
  if (authEmail.value === "" || authPassword.value === "") {
    tampilkanPesan(pesanAuth, "Email dan password wajib diisi.", "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Mendaftarkan...", "");

  const { error } = await supabaseClient.auth.signUp({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    tampilkanPesan(pesanAuth, "Gagal daftar: " + error.message, "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi sebelum masuk.", "sukses");
});

btnMasuk.addEventListener("click", async function () {
  if (authEmail.value === "" || authPassword.value === "") {
    tampilkanPesan(pesanAuth, "Email dan password wajib diisi.", "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Masuk...", "");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    tampilkanPesan(pesanAuth, "Gagal masuk: " + error.message, "error");
    return;
  }
});

btnKeluar.addEventListener("click", async function () {
  await supabaseClient.auth.signOut();
});

let userSaatIni = null;

supabaseClient.auth.onAuthStateChange(function (event, session) {
  if (session) {
    userSaatIni = session.user.id;
    authBox.classList.add("auth-tersembunyi");
    appContent.classList.remove("app-tersembunyi");
    authEmail.value = "";
    authPassword.value = "";
    tampilkanPesan(pesanAuth, "", "");
    muatSemuaData();
  } else {
    userSaatIni = null;
    authBox.classList.remove("auth-tersembunyi");
    appContent.classList.add("app-tersembunyi");
  }
});

/* ---------- Satuan (kg/lb) ---------- */

let satuanAktif = "kg";
const KG_KE_LB = 2.20462;

function kgKeLb(kg) {
  return kg * KG_KE_LB;
}

function lbKeKg(lb) {
  return lb / KG_KE_LB;
}

// Ubah angka kg (yang selalu jadi satuan penyimpanan internal) jadi teks
// sesuai satuan yang lagi aktif dipilih user.
function formatBerat(kg) {
  const nilai = satuanAktif === "kg" ? kg : kgKeLb(kg);
  return `${nilai.toFixed(1)} ${satuanAktif}`;
}

// Baca nilai mentah dari sebuah input berat, dan selalu kembalikan dalam kg -
// biar semua perhitungan di bawah nggak perlu peduli satuan apa yang lagi aktif.
function bacaBeratKg(nilaiString) {
  const angka = Number(nilaiString);
  return satuanAktif === "kg" ? angka : lbKeKg(angka);
}

const semuaTombolSatuan = document.querySelectorAll(".satuan-btn");
const semuaLabelUnit = document.querySelectorAll(".unit-teks");

semuaTombolSatuan.forEach(function (btn) {
  btn.addEventListener("click", function () {
    satuanAktif = btn.dataset.satuan;

    semuaTombolSatuan.forEach(function (b) {
      b.classList.toggle("aktif", b.dataset.satuan === satuanAktif);
    });

    semuaLabelUnit.forEach(function (label) {
      label.textContent = satuanAktif;
    });

    // Render ulang semua tampilan yang nunjukkin angka berat, biar
    // langsung ke-update ke satuan baru tanpa perlu refresh.
    tampilkanCatatan();
    gambarGrafik();
    tampilkanRingkasan();
  });
});

/* ---------- Notifikasi Push ---------- */

const btnAktifkanPush = document.getElementById("btnAktifkanPush");
const inputJamPengingat = document.getElementById("jamPengingat");

// Server jalan pakai jam UTC, sedangkan kamu milih jam pakai waktu lokal
// (WIB, dst) - ini konversinya, biar jam yang tersimpan udah "pas" buat
// dibandingin server nanti.
function konversiJamKeUTC(jamLokal) {
  const bagian = jamLokal.split(":").map(Number);
  const d = new Date();
  d.setHours(bagian[0], bagian[1], 0, 0);
  const jamUTC = String(d.getUTCHours()).padStart(2, "0");
  const menitUTC = String(d.getUTCMinutes()).padStart(2, "0");
  return `${jamUTC}:${menitUTC}`;
}
const statusPengingat = document.getElementById("statusPengingat");

const VAPID_PUBLIC_KEY = "BE8r2yQcvwzjbL9vZ_5SjH7N4loU4AXBhv0zns1HcaVMnhhFqmhbi_qP5bFreCSes1Vs5BNAXfbYlZcRBoVGluc";

// Web Push butuh applicationServerKey dalam bentuk Uint8Array,
// bukan string - ini fungsi konversinya.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Satu tombol ini ngerjain semuanya: daftar Service Worker, minta izin,
// subscribe ke push, simpan ke Supabase, LALU langsung minta server
// kirim 1 notifikasi konfirmasi - jadi aktivasi + tes jadi satu langkah.
btnAktifkanPush.addEventListener("click", async function () {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    // Deteksi iPhone/iPad yang BELUM di-"Add to Home Screen" - di
    // Safari iOS, PushManager cuma tersedia kalau web-nya udah
    // "diinstall" ke Home Screen dulu (batasan dari Apple, bukan
    // dari app ini). Kasih instruksi yang jelas, bukan pesan generik.
    const iOSBelumInstall =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      window.navigator.standalone !== true;

    if (iOSBelumInstall) {
      tampilkanPesan(
        statusPengingat,
        "Di iPhone/iPad, notifikasi cuma bisa aktif kalau web ini di-\"Add to Home Screen\" dulu. Tap ikon Share di Safari, lalu pilih \"Add to Home Screen\".",
        "error"
      );
      return;
    }

    tampilkanPesan(statusPengingat, "Browser Anda tidak mendukung push notification.", "error");
    return;
  }

  if (inputJamPengingat.value === "") {
    tampilkanPesan(statusPengingat, "Jam pengingat wajib dipilih terlebih dahulu.", "error");
    return;
  }

  try {
    tampilkanPesan(statusPengingat, "Mendaftarkan...", "");

    const registration = await navigator.serviceWorker.register("sw.js");

    const izin = await Notification.requestPermission();
    if (izin !== "granted") {
      tampilkanPesan(statusPengingat, "Izin notifikasi ditolak.", "error");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subJson = subscription.toJSON();
    const jamUTC = konversiJamKeUTC(inputJamPengingat.value);

    const { error } = await supabaseClient.from("push_subscriptions").insert({
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
      user_id: userSaatIni,
      jam_pengingat: jamUTC,
    });

    if (error) {
      tampilkanPesan(statusPengingat, "Gagal menyimpan subscription: " + error.message, "error");
      return;
    }

    tampilkanPesan(statusPengingat, "Aktif! Mengirim notifikasi konfirmasi...", "");

    const { error: errorKirim } = await supabaseClient.functions.invoke("kirim-push");

    if (errorKirim) {
      tampilkanPesan(statusPengingat, "Notifikasi aktif, tetapi pengujian pengiriman gagal: " + errorKirim.message, "error");
      return;
    }

    tampilkanPesan(statusPengingat, `Notifikasi aktif! Anda akan diingatkan setiap jam ${inputJamPengingat.value}. Silakan periksa notifikasi konfirmasi yang baru saja dikirim.`, "sukses");
  } catch (err) {
    tampilkanPesan(statusPengingat, "Gagal mengaktifkan notifikasi: " + err.message, "error");
  }
});

/* ---------- Navigasi antar langkah ---------- */

const semuaLangkah = document.querySelectorAll(".langkah");
const semuaNavBtn = document.querySelectorAll(".nav-btn");
const semuaBtnLanjut = document.querySelectorAll(".btn-lanjut");

// Urutan tab dipakai buat deteksi arah geser (kiri atau kanan)
const urutanTab = ["langkah-profil", "langkah-target", "langkah-harian", "langkah-ringkasan"];

// Semua kelas geser yang mungkin nempel di .langkah
const kelasGeser = ["aktif", "dari-kanan", "dari-kiri", "keluar-ke-kiri", "keluar-ke-kanan"];

const langkahContainer = document.querySelector(".langkah-container");

// Pindah tab dengan mode tertentu:
// mode "tap"   = langsung muncul tanpa animasi (klik tab bar)
// mode "swipe" = animasi geser ala WhatsApp (dari swipe jari)
function pindahKe(idTujuan, mode) {
  const langkahAktif = document.querySelector(".langkah.aktif");
  const langkahTujuan = document.getElementById(idTujuan);

  if (!langkahAktif || langkahAktif === langkahTujuan) return;

  const indexAktif = urutanTab.indexOf(langkahAktif.id);
  const indexTujuan = urutanTab.indexOf(idTujuan);
  const geserKanan = indexTujuan > indexAktif;

  // Update nav tab
  semuaNavBtn.forEach(function (btn) {
    btn.classList.toggle("aktif", btn.dataset.tujuan === idTujuan);
  });

  if (mode === "swipe") {
    // --- Mode swipe: animasi geser penuh kiri/kanan ala WhatsApp ---
    langkahContainer.setAttribute("data-animasi", "geser");

    // 1. Posisikan langkah tujuan di luar layar
    kelasGeser.forEach(function (k) { langkahTujuan.classList.remove(k); });
    langkahTujuan.classList.add(geserKanan ? "dari-kanan" : "dari-kiri");

    // 2. Flush layout biar browser gambar posisi awal sebelum transition
    void langkahTujuan.offsetWidth;

    // 3. Jalankan animasi
    langkahAktif.classList.remove("aktif");
    langkahAktif.classList.add(geserKanan ? "keluar-ke-kiri" : "keluar-ke-kanan");
    langkahTujuan.classList.remove("dari-kanan", "dari-kiri");
    langkahTujuan.classList.add("aktif");

    // 4. Bersihkan setelah animasi selesai (~280ms + buffer)
    setTimeout(function () {
      langkahAktif.classList.remove("keluar-ke-kiri", "keluar-ke-kanan");
      langkahContainer.removeAttribute("data-animasi");
    }, 350);

  } else {
    // --- Mode tap: langsung muncul tanpa animasi ---
    // Pastikan data-animasi tidak ada (tidak ada transition yang aktif)
    langkahContainer.removeAttribute("data-animasi");
    kelasGeser.forEach(function (k) {
      langkahAktif.classList.remove(k);
      langkahTujuan.classList.remove(k);
    });
    langkahAktif.classList.remove("aktif");
    langkahTujuan.classList.add("aktif");
  }

  if (idTujuan === "langkah-ringkasan") {
    tampilkanRingkasan();
  }
}

// Tab bar: pakai animasi geser (dari sisi yang tepat), cepat
semuaNavBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    pindahKe(btn.dataset.tujuan, "swipe");
  });
});

// Tombol "Lanjut ke...": pakai animasi geser karena ini navigasi berurutan
semuaBtnLanjut.forEach(function (btn) {
  btn.addEventListener("click", function () {
    pindahKe(btn.dataset.tujuan, "swipe");
  });
});

/* ---------- Form Profil ---------- */

const formProfil = document.getElementById("profilForm");
const pesanProfil = document.getElementById("pesanProfil");

formProfil.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const peran = document.getElementById("peran").value;
  const beratRaw = document.getElementById("berat-sekarang").value;

  if (nama === "") {
    tampilkanPesan(pesanProfil, "Nama wajib diisi.", "error");
    return;
  }

  if (beratRaw === "") {
    tampilkanPesan(pesanProfil, "Berat badan harus diisi dengan angka yang valid.", "error");
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    tampilkanPesan(pesanProfil, "Berat badan harus diisi dengan angka yang valid.", "error");
    return;
  }

  tampilkanPesan(pesanProfil, "Menyimpan...", "");

  const { error } = await supabaseClient
    .from("profil")
    .insert({ nama: nama, peran: peran, berat_awal: beratKg, user_id: userSaatIni });

  if (error) {
    tampilkanPesan(pesanProfil, "Gagal menyimpan ke database: " + error.message, "error");
    return;
  }

  tampilkanPesan(pesanProfil, `Profil untuk ${nama} berhasil dibuat! Berat awal: ${formatBerat(beratKg)}.`, "sukses");
});

async function muatProfilTerbaru() {
  const { data, error } = await supabaseClient
    .from("profil")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Selalu kosongin dulu - biar nggak kebawa sisa data akun sebelumnya
  // kalau akun yang lagi login ini ternyata belum punya profil.
  document.getElementById("nama").value = "";
  document.getElementById("peran").value = "atlet";
  document.getElementById("berat-sekarang").value = "";
  tampilkanPesan(pesanProfil, "", "");

  if (error || !data || data.length === 0) return;

  const profil = data[0];
  document.getElementById("nama").value = profil.nama;
  document.getElementById("peran").value = profil.peran;
  document.getElementById("berat-sekarang").value = profil.berat_awal;

  tampilkanPesan(pesanProfil, `Selamat datang kembali, ${profil.nama}!`, "sukses");
}

/* ---------- Form Target ---------- */

const formTarget = document.getElementById("targetForm");
const pesanTarget = document.getElementById("pesanTarget");
const layarTarget = document.getElementById("layarTarget");
const angkaHari = document.getElementById("angkaHari");
const badgeTercapai = document.getElementById("badgeTercapai");
const btnPeriodeBaru = document.getElementById("btnPeriodeBaru");

formTarget.addEventListener("submit", async function (event) {
  event.preventDefault();

  const targetBeratRaw = document.getElementById("target-berat").value;
  const tanggalWeighin = document.getElementById("tanggal-weighin").value;

  if (targetBeratRaw === "") {
    tampilkanPesan(pesanTarget, "Target berat harus diisi angka yang valid.", "error");
    return;
  }

  const targetBeratKg = bacaBeratKg(targetBeratRaw);

  if (targetBeratKg <= 0) {
    tampilkanPesan(pesanTarget, "Target berat harus diisi angka yang valid.", "error");
    return;
  }

  if (targetBeratKg < 45) {
    tampilkanPesan(pesanTarget, "⚠️ Target ini berisiko tinggi bagi kesehatan. Sebaiknya konsultasikan terlebih dahulu dengan dokter/nutrisionis olahraga sebelum melanjutkan.", "error");
    return;
  }

  if (tanggalWeighin === "") {
    tampilkanPesan(pesanTarget, "Tanggal weigh-in wajib diisi.", "error");
    return;
  }

  const hariIni = new Date();
  const tanggalTarget = new Date(tanggalWeighin);
  const selisihMs = tanggalTarget - hariIni;
  const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));

  if (selisihHari < 0) {
    tampilkanPesan(pesanTarget, "Tanggal weigh-in sudah lewat. Silakan periksa kembali tanggal yang dimasukkan.", "error");
    return;
  }

  tampilkanPesan(pesanTarget, "Menyimpan...", "");

  const { data, error } = await supabaseClient
    .from("target")
    .insert({ target_berat: targetBeratKg, tanggal_weighin: tanggalWeighin, user_id: userSaatIni })
    .select();

  if (error) {
    tampilkanPesan(pesanTarget, "Gagal menyimpan ke database: " + error.message, "error");
    return;
  }

  idTargetAktif = data[0].id;

  tampilkanPesan(pesanTarget, `Target ${formatBerat(targetBeratKg)} tersimpan.`, "sukses");

  angkaHari.textContent = selisihHari;
  layarTarget.classList.remove("layar-tersembunyi");

  perbaruiStatusTargetTercapai();
  gambarGrafik();
});

// Tombol ini nggak langsung nyimpen apa-apa ke database - dia cuma
// ngosongin form Target biar siap diisi target BARU. Periode baru itu
// baru beneran "mulai" pas kamu submit target barunya. Data periode
// yang sekarang tetep utuh aman di database, cuma nanti nggak ikut
// ditampilin lagi di grafik/ringkasan/badge begitu ada periode baru.
btnPeriodeBaru.addEventListener("click", async function () {
  const konfirmasi = await tampilkanKonfirmasi(
    "Mulai Periode Baru?",
    "Data & grafik periode SEKARANG tetap aman tersimpan. Form Target bakal dikosongin, dan grafik bakal mulai dari nol lagi buat periode barunya."
  );

  if (!konfirmasi) return;

  document.getElementById("target-berat").value = "";
  document.getElementById("tanggal-weighin").value = "";
  tampilkanPesan(pesanTarget, "", "");
  layarTarget.classList.add("layar-tersembunyi");
  badgeTercapai.classList.add("badge-tersembunyi");
  document.getElementById("target-berat").focus();
});

// Badge "Target Tercapai" dicek dengan bandingin berat CATATAN HARIAN
// yang paling baru sama target berat. Dipanggil ulang tiap kali data
// target ATAU data harian berubah (submit form, atau pas load awal),
// soalnya dua-duanya bisa mempengaruhi status tercapai/belumnya.
function perbaruiStatusTargetTercapai() {
  const targetBeratRaw = document.getElementById("target-berat").value;
  const data = catatanPeriodeAktif();

  if (targetBeratRaw === "" || data.length === 0) {
    badgeTercapai.classList.add("badge-tersembunyi");
    return;
  }

  const targetBeratKg = bacaBeratKg(targetBeratRaw);
  const beratTerakhir = Number(data[data.length - 1].berat);

  if (beratTerakhir <= targetBeratKg) {
    badgeTercapai.classList.remove("badge-tersembunyi");
  } else {
    badgeTercapai.classList.add("badge-tersembunyi");
  }
}

async function muatTargetTerbaru() {
  const { data, error } = await supabaseClient
    .from("target")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Sama kayak profil - kosongin dulu, biar nggak kebawa sisa data
  // akun sebelumnya.
  document.getElementById("target-berat").value = "";
  document.getElementById("tanggal-weighin").value = "";
  tampilkanPesan(pesanTarget, "", "");
  layarTarget.classList.add("layar-tersembunyi");
  badgeTercapai.classList.add("badge-tersembunyi");
  idTargetAktif = null;

  if (error || !data || data.length === 0) return;

  const target = data[0];
  document.getElementById("target-berat").value = target.target_berat;
  document.getElementById("tanggal-weighin").value = target.tanggal_weighin;
  idTargetAktif = target.id;

  const hariIni = new Date();
  const tanggalTarget = new Date(target.tanggal_weighin);
  const selisihHari = Math.ceil((tanggalTarget - hariIni) / (1000 * 60 * 60 * 24));

  if (selisihHari >= 0) {
    angkaHari.textContent = selisihHari;
    layarTarget.classList.remove("layar-tersembunyi");
  }
}

/* ---------- Form Harian ---------- */

const formHarian = document.getElementById("harianForm");
const pesanHarian = document.getElementById("pesanHarian");
const daftarCatatan = document.getElementById("daftarCatatan");
const grafikBerat = document.getElementById("grafikBerat");
const grafikTanggal = document.getElementById("grafikTanggal");
const grafikTargetCaption = document.getElementById("grafikTargetCaption");
const bannerEditHarian = document.getElementById("bannerEditHarian");
const btnBatalEditHarian = document.getElementById("btnBatalEditHarian");
const btnSubmitHarian = document.getElementById("btnSubmitHarian");

// Kalau tidak null, berarti user lagi ngedit catatan yang sudah ada
// (bukan bikin catatan baru). Isinya objek catatan yang lagi diedit.
let catatanSedangDiedit = null;

// Catatan selalu disimpan dalam kg (satuan baku), apapun satuan yang
// lagi aktif dipilih user pas nge-input. "let" (bukan "const") karena
// nanti nilainya diganti total sama data yang diambil dari Supabase.
let catatanHarian = [];

// ID dari target yang lagi AKTIF sekarang (target paling baru). Dipakai
// buat "menandai" tiap catatan harian itu punya periode/cut yang mana,
// biar grafik/ringkasan/badge nggak nyampur data dari periode lama.
let idTargetAktif = null;

// Cuma ambil catatan harian yang tanda periode-nya (target_id) SAMA
// dengan periode yang lagi aktif sekarang. Data dari periode lama tetep
// aman tersimpan di database, cuma nggak ikut ditampilin di sini.
function catatanPeriodeAktif() {
  if (idTargetAktif === null) return [];
  return catatanHarian.filter(function (c) {
    return c.target_id === idTargetAktif;
  });
}

async function muatDataDariSupabase() {
  const { data, error } = await supabaseClient
    .from("catatan_harian")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("tanggal", { ascending: true });

  if (error) {
    tampilkanPesan(pesanHarian, "Gagal mengambil data dari database: " + error.message, "error");
    return;
  }

  catatanHarian = data;
  tampilkanCatatan();
  gambarGrafik();
  perbaruiStatusTargetTercapai();
}

async function muatSemuaData() {
  await muatProfilTerbaru();
  await muatTargetTerbaru();
  await muatDataDariSupabase();
}


formHarian.addEventListener("submit", async function (event) {
  event.preventDefault();

  const tanggal = document.getElementById("tanggal").value;
  const beratRaw = document.getElementById("berat").value;
  const air = document.getElementById("air").value;
  const latihan = document.getElementById("latihan").value;
  const nutrisi = document.getElementById("nutrisi").value;

  if (tanggal === "" || beratRaw === "") {
    tampilkanPesan(pesanHarian, "Tanggal dan berat badan wajib diisi dengan benar.", "error");
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    tampilkanPesan(pesanHarian, "Tanggal dan berat badan wajib diisi dengan benar.", "error");
    return;
  }

  if (catatanSedangDiedit) {
    // --- Mode UPDATE: catatan yang sudah ada, bukan bikin baru ---
    tampilkanPesan(pesanHarian, "Menyimpan perubahan...", "");

    const { data, error } = await supabaseClient
      .from("catatan_harian")
      .update({
        tanggal: tanggal,
        berat: beratKg,
        air: Number(air) || 0,
        latihan: latihan,
        nutrisi: nutrisi,
      })
      .eq("id", catatanSedangDiedit.id)
      .select();

    if (error) {
      tampilkanPesan(pesanHarian, "Gagal menyimpan perubahan: " + error.message, "error");
      return;
    }

    const index = catatanHarian.findIndex(function (c) {
      return c.id === catatanSedangDiedit.id;
    });
    if (index !== -1) {
      catatanHarian[index] = data[0];
    }

    tampilkanPesan(pesanHarian, "Catatan berhasil diperbarui!", "sukses");
    batalEditCatatan();
  } else {
    // --- Mode INSERT: catatan baru ---
    tampilkanPesan(pesanHarian, "Menyimpan...", "");

    const { data, error } = await supabaseClient
      .from("catatan_harian")
      .insert({
        tanggal: tanggal,
        berat: beratKg,
        air: Number(air) || 0,
        latihan: latihan,
        nutrisi: nutrisi,
        user_id: userSaatIni,
        target_id: idTargetAktif,
      })
      .select();

    if (error) {
      tampilkanPesan(pesanHarian, "Gagal menyimpan ke database: " + error.message, "error");
      return;
    }

    catatanHarian.push(data[0]);
    tampilkanPesan(pesanHarian, "Catatan tersimpan ke database!", "sukses");
    formHarian.reset();
  }

  tampilkanCatatan();
  gambarGrafik();
  perbaruiStatusTargetTercapai();
});

// Isi form pakai data catatan yang mau diedit, ganti tampilan form jadi
// "mode edit" (banner muncul, teks tombol berubah)
function mulaiEditCatatan(catatan) {
  catatanSedangDiedit = catatan;

  document.getElementById("tanggal").value = catatan.tanggal;
  document.getElementById("berat").value = (satuanAktif === "kg" ? catatan.berat : kgKeLb(catatan.berat)).toFixed(1);
  document.getElementById("air").value = catatan.air;
  document.getElementById("latihan").value = catatan.latihan || "";
  document.getElementById("nutrisi").value = catatan.nutrisi || "";

  bannerEditHarian.classList.remove("banner-edit-tersembunyi");
  btnSubmitHarian.textContent = "Update Catatan";
  tampilkanPesan(pesanHarian, "", "");

  formHarian.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Keluar dari mode edit, balik ke mode "catatan baru"
function batalEditCatatan() {
  catatanSedangDiedit = null;
  formHarian.reset();
  bannerEditHarian.classList.add("banner-edit-tersembunyi");
  btnSubmitHarian.textContent = "Simpan Catatan";
}

btnBatalEditHarian.addEventListener("click", batalEditCatatan);

// Hapus catatan (minta konfirmasi dulu lewat modal yang udah ada)
async function hapusCatatan(id) {
  const yakin = await tampilkanKonfirmasi(
    "Hapus Catatan?",
    "Catatan ini akan dihapus permanen dan tidak bisa dikembalikan."
  );
  if (!yakin) return;

  const { error } = await supabaseClient.from("catatan_harian").delete().eq("id", id);

  if (error) {
    tampilkanPesan(pesanHarian, "Gagal menghapus catatan: " + error.message, "error");
    return;
  }

  catatanHarian = catatanHarian.filter(function (c) {
    return c.id !== id;
  });

  // Kalau catatan yang lagi diedit ternyata dihapus, keluar dari mode edit
  if (catatanSedangDiedit && catatanSedangDiedit.id === id) {
    batalEditCatatan();
  }

  tampilkanPesan(pesanHarian, "Catatan berhasil dihapus.", "sukses");
  tampilkanCatatan();
  gambarGrafik();
  perbaruiStatusTargetTercapai();
}

function tampilkanCatatan() {
  daftarCatatan.innerHTML = "";

  catatanPeriodeAktif().forEach(function (catatan) {
    const item = document.createElement("div");
    item.className = "log-item";

    const info = document.createElement("div");
    info.className = "log-item-info";
    info.innerHTML = `
      <span class="log-tanggal">${catatan.tanggal}</span>
      <span class="log-detail">${formatBerat(catatan.berat)} · ${catatan.air} L · ${catatan.latihan}${catatan.nutrisi ? " · " + catatan.nutrisi : ""}</span>
    `;

    const aksi = document.createElement("div");
    aksi.className = "log-item-aksi";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn-edit-catatan";
    btnEdit.setAttribute("aria-label", "Edit catatan");
    btnEdit.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>';
    btnEdit.addEventListener("click", function () {
      mulaiEditCatatan(catatan);
    });

    const btnHapus = document.createElement("button");
    btnHapus.type = "button";
    btnHapus.className = "btn-hapus-catatan";
    btnHapus.setAttribute("aria-label", "Hapus catatan");
    btnHapus.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>';
    btnHapus.addEventListener("click", function () {
      hapusCatatan(catatan.id);
    });

    aksi.appendChild(btnEdit);
    aksi.appendChild(btnHapus);

    item.appendChild(info);
    item.appendChild(aksi);
    daftarCatatan.appendChild(item);
  });
}

function formatTanggalSingkat(tanggalISO) {
  const bagian = tanggalISO.split("-");
  return `${bagian[2]}/${bagian[1]}`;
}

// Versi lengkap dengan tahun, khusus buat teks yang dibagikan keluar
// (WhatsApp dll) biar jelas tahunnya, tidak ambigu kayak versi singkat.
function formatTanggalLengkap(tanggalISO) {
  const bagian = tanggalISO.split("-");
  return `${bagian[2]}/${bagian[1]}/${bagian[0]}`;
}

/* ---------- Bagikan Progress (jadi gambar kartu) ---------- */

const btnShareProgress = document.getElementById("btnShareProgress");

// Helper: gambar kotak dengan sudut membulat di canvas
function gambarKotakBulat(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Helper: gambar mini grafik garis progres berat di dalam canvas
function gambarMiniGrafikCanvas(ctx, data, x, y, w, h, warna) {
  if (data.length === 0) {
    ctx.fillStyle = warna.teksMutedLemah;
    ctx.font = "20px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Belum ada catatan progres", x + w / 2, y + h / 2 + 8);
    return;
  }

  const semuaBerat = data.map(function (c) {
    return Number(c.berat);
  });
  const min = Math.min(...semuaBerat);
  const max = Math.max(...semuaBerat);
  const rentang = max - min || 1;

  const titik = data.map(function (catatan, i) {
    const xi = data.length === 1 ? x + w / 2 : x + (i / (data.length - 1)) * w;
    const persenY = ((Number(catatan.berat) - min) / rentang) * 0.7 + 0.15;
    const yi = y + h - persenY * h;
    return { x: xi, y: yi };
  });

  if (titik.length > 1) {
    const gradArea = ctx.createLinearGradient(0, y, 0, y + h);
    gradArea.addColorStop(0, warna.areaGradAtas);
    gradArea.addColorStop(1, "rgba(107, 227, 156, 0)");

    ctx.beginPath();
    ctx.moveTo(titik[0].x, titik[0].y);
    for (let i = 1; i < titik.length; i++) ctx.lineTo(titik[i].x, titik[i].y);
    ctx.lineTo(titik[titik.length - 1].x, y + h);
    ctx.lineTo(titik[0].x, y + h);
    ctx.closePath();
    ctx.fillStyle = gradArea;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(titik[0].x, titik[0].y);
    for (let i = 1; i < titik.length; i++) ctx.lineTo(titik[i].x, titik[i].y);
    ctx.strokeStyle = warna.aksen;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = warna.aksenGlow;
    ctx.shadowBlur = warna.glowGrafik;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  titik.forEach(function (t, i) {
    const terkini = i === titik.length - 1;
    ctx.beginPath();
    ctx.arc(t.x, t.y, terkini ? 9 : 5, 0, Math.PI * 2);
    ctx.fillStyle = warna.aksen;
    ctx.fill();
    if (terkini) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = warna.titikStroke;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
}

// Bikin canvas kartu progres: latar halaman + kartu utama melayang di
// tengah dengan bayangan, biar terlihat seperti kartu yang dirancang,
// bukan sekadar kotak polos. Warnanya menyesuaikan tema aktif di web.
async function buatGambarProgress() {
  // Pastikan font custom sudah bisa dipakai sebelum digambar di canvas
  await Promise.all([
    document.fonts.load("700 120px 'Space Mono'"),
    document.fonts.load("700 32px 'Space Mono'"),
    document.fonts.load("700 30px Oswald"),
    document.fonts.load("600 34px Oswald"),
    document.fonts.load("400 20px Inter"),
    document.fonts.load("600 16px Inter"),
    document.fonts.load("700 16px Inter"),
  ]);

  const modeGelap = document.documentElement.getAttribute("data-theme") === "dark";

  const warna = modeGelap
    ? {
        pageBg: "#0A0806",
        kartuAtas: "#1E1914",
        kartuBawah: "#100D0A",
        kartuBorder: "rgba(242, 238, 229, 0.08)",
        bayangan: "rgba(0, 0, 0, 0.55)",
        teksUtama: "#F5F1E8",
        teksMutedKuat: "rgba(245, 241, 232, 0.75)",
        teksMuted: "rgba(245, 241, 232, 0.5)",
        teksMutedLemah: "rgba(245, 241, 232, 0.35)",
        aksen: "#6BE39C",
        aksenGlow: "rgba(107, 227, 156, 0.55)",
        glowHero: 22,
        glowGrafik: 12,
        areaGradAtas: "rgba(107, 227, 156, 0.28)",
        grafikFill: "rgba(255, 255, 255, 0.025)",
        garisPemisah: "rgba(242, 238, 229, 0.1)",
        pilFillNaik: "rgba(255, 107, 97, 0.14)",
        pilFillTurun: "rgba(107, 227, 156, 0.14)",
        merah: "#FF6B61",
        badgeTeks: "#0D2B18",
        titikStroke: "#100D0A",
      }
    : {
        pageBg: "#DCD4C2",
        kartuAtas: "#FDFBF7",
        kartuBawah: "#F3EEE3",
        kartuBorder: "rgba(33, 29, 25, 0.07)",
        bayangan: "rgba(33, 29, 25, 0.22)",
        teksUtama: "#211D19",
        teksMutedKuat: "rgba(33, 29, 25, 0.75)",
        teksMuted: "rgba(33, 29, 25, 0.55)",
        teksMutedLemah: "rgba(33, 29, 25, 0.38)",
        aksen: "#1F8A46",
        aksenGlow: "rgba(31, 138, 70, 0.25)",
        glowHero: 0,
        glowGrafik: 0,
        areaGradAtas: "rgba(31, 138, 70, 0.15)",
        grafikFill: "rgba(33, 29, 25, 0.025)",
        garisPemisah: "rgba(33, 29, 25, 0.1)",
        pilFillNaik: "rgba(179, 38, 30, 0.1)",
        pilFillTurun: "rgba(31, 138, 70, 0.1)",
        merah: "#B3261E",
        badgeTeks: "#0D2B18",
        titikStroke: "#FDFBF7",
      };

  const lebar = 720;
  const tinggi = 1174;
  const canvas = document.createElement("canvas");
  canvas.width = lebar;
  canvas.height = tinggi;
  const ctx = canvas.getContext("2d");

  // Lapis 1: latar halaman penuh
  ctx.fillStyle = warna.pageBg;
  ctx.fillRect(0, 0, lebar, tinggi);

  // Lapis 2: kartu utama, sedikit inset dari tepi, dengan bayangan -
  // ini yang bikin hasilnya terasa seperti kartu, bukan gambar polos.
  const marginKartu = 32;
  const kx = marginKartu;
  const ky = marginKartu;
  const kw = lebar - marginKartu * 2;
  const kh = tinggi - marginKartu * 2;

  ctx.save();
  ctx.shadowColor = warna.bayangan;
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  gambarKotakBulat(ctx, kx, ky, kw, kh, 36);
  const gradKartu = ctx.createLinearGradient(0, ky, 0, ky + kh);
  gradKartu.addColorStop(0, warna.kartuAtas);
  gradKartu.addColorStop(1, warna.kartuBawah);
  ctx.fillStyle = gradKartu;
  ctx.fill();
  ctx.restore();

  gambarKotakBulat(ctx, kx, ky, kw, kh, 36);
  ctx.strokeStyle = warna.kartuBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const pad = kx + 56;
  const lebarKonten = kw - 112;

  // Header: badge WCT (identitas brand, tema-invarian) + watermark
  gambarKotakBulat(ctx, pad, ky + 48, 48, 48, 14);
  const gradBadge = ctx.createLinearGradient(pad, ky + 48, pad + 48, ky + 96);
  gradBadge.addColorStop(0, "#6BE39C");
  gradBadge.addColorStop(1, "#2FAE68");
  ctx.fillStyle = gradBadge;
  ctx.fill();
  ctx.fillStyle = warna.badgeTeks;
  ctx.font = "700 16px Oswald";
  ctx.textAlign = "center";
  ctx.fillText("WCT", pad + 24, ky + 78);

  ctx.textAlign = "right";
  ctx.fillStyle = warna.teksMuted;
  ctx.font = "700 14px Inter";
  ctx.fillText("WEIGHT CUT TRACKER", pad + lebarKonten, ky + 78);

  // Nama pengguna - jadi header utama
  const nama = document.getElementById("nama").value || "Pengguna";
  ctx.textAlign = "left";
  ctx.fillStyle = warna.teksUtama;
  ctx.font = "600 34px Oswald";
  ctx.fillText(nama, pad, ky + 175);
  ctx.fillStyle = warna.teksMuted;
  ctx.font = "400 18px Inter";
  ctx.fillText("Progres Weight Cut", pad, ky + 204);

  // Garis pemisah di bawah header
  ctx.strokeStyle = warna.garisPemisah;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, ky + 232);
  ctx.lineTo(pad + lebarKonten, ky + 232);
  ctx.stroke();

  // Hero: berat sekarang
  const dataAktif = catatanPeriodeAktif();
  const beratTerkini = dataAktif.length > 0 ? Number(dataAktif[dataAktif.length - 1].berat) : null;
  const teksBerat = beratTerkini !== null ? formatBerat(beratTerkini) : "- kg";
  const [angkaBerat, satuanBerat] = teksBerat.split(" ");

  ctx.textAlign = "center";
  ctx.fillStyle = warna.teksMuted;
  ctx.font = "700 15px Inter";
  ctx.fillText("BERAT SAAT INI", lebar / 2, ky + 290);

  ctx.fillStyle = warna.aksen;
  ctx.shadowColor = warna.aksenGlow;
  ctx.shadowBlur = warna.glowHero;
  ctx.font = "700 118px 'Space Mono'";
  ctx.fillText(angkaBerat, lebar / 2, ky + 425);
  ctx.font = "700 26px Oswald";
  ctx.fillText((satuanBerat || "KG").toUpperCase(), lebar / 2, ky + 465);
  ctx.shadowBlur = 0;

  // Stats row: Target & Hari Tersisa, sebagai dua pil bersebelahan
  const yPil = ky + 510;
  const tinggiPil = 92;
  const lebarPil = (lebarKonten - 16) / 2;

  const targetBeratRaw = document.getElementById("target-berat").value;
  const teksTarget = targetBeratRaw !== "" ? formatBerat(bacaBeratKg(targetBeratRaw)) : "-";
  const teksHari =
    !layarTarget.classList.contains("layar-tersembunyi") && angkaHari.textContent !== "–"
      ? angkaHari.textContent
      : "-";

  function gambarPilStat(x, label, nilai) {
    gambarKotakBulat(ctx, x, yPil, lebarPil, tinggiPil, 18);
    ctx.fillStyle = warna.grafikFill;
    ctx.fill();
    ctx.strokeStyle = warna.kartuBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = warna.teksMuted;
    ctx.font = "700 13px Inter";
    ctx.fillText(label.toUpperCase(), x + lebarPil / 2, yPil + 32);
    ctx.fillStyle = warna.teksUtama;
    ctx.font = "700 30px 'Space Mono'";
    ctx.fillText(nilai, x + lebarPil / 2, yPil + 68);
  }

  gambarPilStat(pad, "Target", teksTarget);
  gambarPilStat(pad + lebarPil + 16, "Hari Tersisa", teksHari);

  // Label section mini grafik
  const yLabelGrafik = yPil + tinggiPil + 56;
  ctx.textAlign = "left";
  ctx.fillStyle = warna.teksMuted;
  ctx.font = "700 15px Inter";
  ctx.fillText("PROGRES 7 HARI TERAKHIR", pad, yLabelGrafik);

  // Kartu mini grafik
  const yGrafik = yLabelGrafik + 24;
  const tinggiGrafik = 240;
  gambarKotakBulat(ctx, pad, yGrafik, lebarKonten, tinggiGrafik, 20);
  ctx.fillStyle = warna.grafikFill;
  ctx.fill();
  ctx.strokeStyle = warna.kartuBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  gambarMiniGrafikCanvas(ctx, dataAktif, pad + 32, yGrafik + 32, lebarKonten - 64, tinggiGrafik - 64, warna);

  // Perubahan minggu ini - pil berwarna sesuai arah (turun=hijau/naik=merah)
  const perubahan = document.getElementById("ringkasanPerubahan").textContent;
  const perubahanNaik = perubahan.trim().startsWith("+");
  const yPerubahan = yGrafik + tinggiGrafik + 48;

  gambarKotakBulat(ctx, pad, yPerubahan, lebarKonten, tinggiPil, 18);
  ctx.fillStyle = perubahanNaik ? warna.pilFillNaik : warna.pilFillTurun;
  ctx.fill();

  // Susunan dibuat sama persis dengan pil Target/Hari Tersisa di atas:
  // label di atas, angka di bawah, keduanya rata tengah.
  ctx.textAlign = "center";
  ctx.fillStyle = warna.teksMuted;
  ctx.font = "700 13px Inter";
  ctx.fillText("PERUBAHAN MINGGU INI", lebar / 2, yPerubahan + 32);
  ctx.fillStyle = perubahanNaik ? warna.merah : warna.aksen;
  ctx.font = "700 30px 'Space Mono'";
  ctx.fillText(perubahan, lebar / 2, yPerubahan + 68);

  return canvas;
}

// Coba share sebagai FILE gambar (kalau device dukung). Return true
// kalau berhasil dibagikan sebagai gambar, false kalau tidak didukung
// (dan sudah otomatis diunduh sebagai gantinya).
async function bagikanSebagaiGambar(teksCaption) {
  const canvas = await buatGambarProgress();

  return new Promise(function (resolve) {
    canvas.toBlob(async function (blob) {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File([blob], "progres-weight-cut.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: teksCaption });
        } catch (e) {
          // Pengguna membatalkan proses berbagi - tidak perlu ditangani
        }
        resolve(true);
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "progres-weight-cut.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 2000);
      resolve(false);
    }, "image/png");
  });
}

btnShareProgress.addEventListener("click", async function () {
  const nama = document.getElementById("nama").value || "Pengguna";

  const berhasilShareGambar = await bagikanSebagaiGambar(`Progres Weight Cut - ${nama}`);

  if (berhasilShareGambar) return;

  // Fallback kalau perangkat tidak mendukung berbagi gambar langsung:
  // gambar sudah otomatis diunduh, dan WhatsApp dibuka dengan teks
  // ringkasan yang siap dikirim, agar pengguna tinggal melampirkan
  // gambar tersebut secara manual.
  const dataAktif = catatanPeriodeAktif();
  const beratTerkini = dataAktif.length > 0 ? Number(dataAktif[dataAktif.length - 1].berat) : null;
  const targetBeratRaw = document.getElementById("target-berat").value;
  const tanggalWeighinRaw = document.getElementById("tanggal-weighin").value;
  const perubahan = document.getElementById("ringkasanPerubahan").textContent;

  let teks = `Progres Weight Cut - ${nama}\n\n`;
  if (beratTerkini !== null) teks += `Berat saat ini: ${formatBerat(beratTerkini)}\n`;
  if (targetBeratRaw !== "") {
    const targetKg = bacaBeratKg(targetBeratRaw);
    teks += `Target: ${formatBerat(targetKg)}`;
    if (tanggalWeighinRaw !== "") teks += ` (weigh-in ${formatTanggalLengkap(tanggalWeighinRaw)})`;
    teks += "\n";
  }
  if (!layarTarget.classList.contains("layar-tersembunyi") && angkaHari.textContent !== "–") {
    teks += `${angkaHari.textContent} hari lagi menuju weigh-in.\n`;
  }
  teks += `\nPerubahan minggu ini: ${perubahan}\n\nGambar progres telah diunduh. Silakan lampirkan secara manual pada pesan ini.\n\nWeight Cut Tracker`;

  if (navigator.share) {
    navigator.share({ text: teks }).catch(function () {});
  } else {
    const urlWa = "https://wa.me/?text=" + encodeURIComponent(teks);
    window.open(urlWa, "_blank");
  }
});

function gambarGrafik() {
  grafikBerat.innerHTML = "";
  grafikTanggal.innerHTML = "";

  const data = catatanPeriodeAktif();

  if (data.length === 0) return;

  const semuaBerat = data.map(function (catatan) {
    return Number(catatan.berat);
  });

  const beratMin = Math.min(...semuaBerat);
  const beratMax = Math.max(...semuaBerat);
  const rentang = beratMax - beratMin || 1;

  function hitungTinggiPersen(berat) {
    return ((berat - beratMin) / rentang) * 72 + 16;
  }

  // Posisi X tiap titik, dikasih jarak 7% dari tepi kiri/kanan biar
  // label angka di titik ujung tidak kepotong.
  function hitungPosisiX(index) {
    if (data.length === 1) return 50;
    return 7 + (index / (data.length - 1)) * 86;
  }

  const titikPersen = data.map(function (catatan, index) {
    return {
      xPersen: hitungPosisiX(index),
      bottomPersen: hitungTinggiPersen(Number(catatan.berat)),
    };
  });

  const plot = document.createElement("div");
  plot.className = "grafik-plot";
  grafikBerat.appendChild(plot);

  // Ukur dimensi ASLI plot dalam pixel, baru gambar SVG pakai satuan
  // itu - biar garis presisi pas ke titik-titiknya, tidak melenceng.
  const lebarPlot = plot.clientWidth || 300;
  const tinggiPlot = plot.clientHeight || 140;

  const titikPosisi = titikPersen.map(function (t) {
    return {
      x: (t.xPersen / 100) * lebarPlot,
      y: tinggiPlot - (t.bottomPersen / 100) * tinggiPlot,
      xPersen: t.xPersen,
      bottomPersen: t.bottomPersen,
    };
  });

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + lebarPlot + " " + tinggiPlot);
  svg.classList.add("grafik-svg");

  // Bikin path kurva halus yang melewati semua titik (Catmull-Rom
  // diubah jadi kurva bezier kubik) - bukan garis lurus patah-patah.
  function buatPathHalus(titik) {
    if (titik.length === 1) return "";
    let d = "M " + titik[0].x + " " + titik[0].y;
    for (let i = 0; i < titik.length - 1; i++) {
      const p0 = titik[i - 1] || titik[i];
      const p1 = titik[i];
      const p2 = titik[i + 1];
      const p3 = titik[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += " C " + cp1x + " " + cp1y + ", " + cp2x + " " + cp2y + ", " + p2.x + " " + p2.y;
    }
    return d;
  }

  const pathD = buatPathHalus(titikPosisi);

  if (pathD) {
    // Gradient area di bawah kurva - kasih "isi" biar tidak keliatan
    // kosong/polos, sekaligus nyamarin transisi ke bawah kartu.
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "gradientAreaGrafik");
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y2", "1");
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "var(--screen-text)");
    stop1.setAttribute("stop-opacity", "0.28");
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "var(--screen-text)");
    stop2.setAttribute("stop-opacity", "0");
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const area = document.createElementNS(svgNS, "path");
    area.setAttribute(
      "d",
      pathD + " L " + titikPosisi[titikPosisi.length - 1].x + " " + tinggiPlot + " L " + titikPosisi[0].x + " " + tinggiPlot + " Z"
    );
    area.setAttribute("fill", "url(#gradientAreaGrafik)");
    area.setAttribute("stroke", "none");
    svg.appendChild(area);

    const garis = document.createElementNS(svgNS, "path");
    garis.setAttribute("d", pathD);
    garis.classList.add("grafik-garis");
    garis.style.opacity = "0";
    svg.appendChild(garis);
    requestAnimationFrame(function () {
      garis.style.opacity = "1";
    });
  }

  plot.appendChild(svg);

  // Titik + label angka di tiap data, ditaruh sebagai elemen HTML biar
  // bentuknya tetap bulat sempurna dan gampang diatur posisi labelnya.
  data.forEach(function (catatan, index) {
    const posisi = titikPersen[index];
    const posisiPuncak = index === data.length - 1;

    const titik = document.createElement("div");
    titik.className = "grafik-titik" + (posisiPuncak ? " grafik-titik-terkini" : "");
    titik.style.left = posisi.xPersen + "%";
    titik.style.bottom = posisi.bottomPersen + "%";

    const label = document.createElement("span");
    // Label ditaruh berdasar bentuk LOKAL kurva di titik ini: kalau
    // titik ini puncak (lebih tinggi dari tetangganya) label ditaruh
    // di atas (area situ kosong), kalau lembah ditaruh di bawah.
    // Ini lebih aman daripada cuma liat posisi tinggi absolut, karena
    // kurva halus suka sedikit "overshoot" di dekat titik tajam.
    let taruhAtas;
    if (data.length === 1) {
      taruhAtas = true;
    } else if (index === 0) {
      taruhAtas = posisi.bottomPersen >= titikPersen[1].bottomPersen;
    } else if (index === data.length - 1) {
      taruhAtas = posisi.bottomPersen >= titikPersen[index - 1].bottomPersen;
    } else {
      const rataTetangga = (titikPersen[index - 1].bottomPersen + titikPersen[index + 1].bottomPersen) / 2;
      taruhAtas = posisi.bottomPersen >= rataTetangga;
    }
    label.className = "grafik-titik-label " + (taruhAtas ? "label-atas" : "label-bawah");
    label.textContent = formatBerat(catatan.berat);
    titik.appendChild(label);

    plot.appendChild(titik);

    titik.style.opacity = "0";
    requestAnimationFrame(function () {
      titik.style.opacity = "1";
    });

    const labelTanggal = document.createElement("span");
    labelTanggal.textContent = formatTanggalSingkat(catatan.tanggal);
    grafikTanggal.appendChild(labelTanggal);
  });

  const targetBeratRaw = document.getElementById("target-berat").value;
  if (targetBeratRaw !== "") {
    const targetBeratKg = bacaBeratKg(targetBeratRaw);
    let posisiPersen = hitungTinggiPersen(targetBeratKg);
    posisiPersen = Math.max(0, Math.min(100, posisiPersen));

    // Garis putus-putus polos di posisi target (cuma referensi visual)
    const garisTarget = document.createElement("div");
    garisTarget.className = "garis-target";
    garisTarget.style.bottom = posisiPersen + "%";
    plot.appendChild(garisTarget);

    // Teks "Target: X kg" ditaruh di LUAR kartu grafik sebagai caption
    // - dijamin tidak akan pernah numpuk sama label data manapun,
    // walau kebetulan ada angka yang nilainya deket sama target.
    grafikTargetCaption.textContent = `Target: ${formatBerat(targetBeratKg)}`;
  } else {
    grafikTargetCaption.textContent = "";
  }
}

/* ---------- Ringkasan Mingguan ---------- */

function tampilkanRingkasan() {
  const ringkasanKosong = document.getElementById("ringkasanKosong");
  const ringkasanIsi = document.getElementById("ringkasanIsi");

  // Cuma ambil catatan dari 7 hari terakhir, biar ini beneran
  // "ringkasan mingguan" - bukan rata-rata dari semua data sepanjang waktu.
  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

  const catatanMingguIni = catatanPeriodeAktif().filter(function (c) {
    return new Date(c.tanggal) >= tujuhHariLalu;
  });

  if (catatanMingguIni.length === 0) {
    ringkasanKosong.style.display = "block";
    ringkasanIsi.classList.add("ringkasan-tersembunyi");
    return;
  }

  ringkasanKosong.style.display = "none";
  ringkasanIsi.classList.remove("ringkasan-tersembunyi");

  const beratArray = catatanMingguIni.map(function (c) {
    return Number(c.berat);
  });
  const airArray = catatanMingguIni.map(function (c) {
    return Number(c.air) || 0;
  });

  const rataBerat = beratArray.reduce(function (total, angka) {
    return total + angka;
  }, 0) / beratArray.length;

  const rataAir = airArray.reduce(function (total, angka) {
    return total + angka;
  }, 0) / airArray.length;

  const beratAwal = beratArray[0];
  const beratAkhir = beratArray[beratArray.length - 1];
  const perubahanKg = beratAkhir - beratAwal;

  const elPerubahan = document.getElementById("ringkasanPerubahan");
  const perubahanTampil = satuanAktif === "kg" ? perubahanKg : kgKeLb(perubahanKg);

  if (perubahanKg > 0) {
    elPerubahan.textContent = `+${perubahanTampil.toFixed(1)} ${satuanAktif}`;
    // Warna ini SENGAJA di-hardcode (bukan ngikut var(--danger) yang beda
    // per tema terang/gelap), soalnya layar LCD ini bg-nya emang selalu
    // gelap biarpun tema halamannya lagi terang atau gelap.
    elPerubahan.style.color = "#FF6B61";
  } else {
    elPerubahan.textContent = `${perubahanTampil.toFixed(1)} ${satuanAktif}`;
    elPerubahan.style.color = "";
  }

  document.getElementById("statRataBerat").textContent = formatBerat(rataBerat);
  document.getElementById("statRataAir").textContent = rataAir.toFixed(1);
  document.getElementById("statJumlahHari").textContent = catatanMingguIni.length;
}

/* ---------- Kasih Masukan ---------- */

const formMasukan = document.getElementById("masukanForm");
const pesanMasukan = document.getElementById("pesanMasukan");
const statusMasukan = document.getElementById("statusMasukan");

formMasukan.addEventListener("submit", async function (event) {
  event.preventDefault();

  const pesan = pesanMasukan.value.trim();

  if (pesan === "") {
    tampilkanPesan(statusMasukan, "Masukan wajib diisi terlebih dahulu.", "error");
    return;
  }

  tampilkanPesan(statusMasukan, "Mengirim...", "");

  const { error } = await supabaseClient
    .from("masukan")
    .insert({ pesan: pesan, user_id: userSaatIni });

  if (error) {
    tampilkanPesan(statusMasukan, "Gagal mengirim: " + error.message, "error");
    return;
  }

  tampilkanPesan(statusMasukan, "Terima kasih! Masukan Anda telah terkirim.", "sukses");
  formMasukan.reset();
});

/* ---------- Getar (Haptic Feedback) ---------- */

// Getar tipis tiap kali nge-tap TOMBOL apapun di app ini (nav, submit,
// dll) - kayak feedback yang biasa dirasain di app native. Cuma jalan
// di HP yang browser-nya dukung Vibration API (kebanyakan Android;
// iPhone/Safari belum dukung, jadi di situ ya diem aja, nggak error).
document.addEventListener("click", function (event) {
  if (event.target.closest("button") && navigator.vibrate) {
    navigator.vibrate(10);
  }
});

/* ---------- Swipe Follow Finger (Drag to Switch Tab) ---------- */

// Variabel state drag
let dragStartX = 0;
let dragStartY = 0;
let dragArahTerkunci = null; // "horizontal" | "vertikal" | null
let dragAktif = false;
let dragLangkahAktif = null;
let dragLangkahTarget = null; // langkah tetangga yang ikut bergerak
let dragArah = null; // "kiri" | "kanan"
let lebarLayar = window.innerWidth;

window.addEventListener("resize", function () {
  lebarLayar = window.innerWidth;
});

// Pasang transform langsung ke elemen tanpa transition (mode drag)
function setDragTransform(el, x) {
  if (!el) return;
  el.style.transition = "none";
  el.style.transform = "translateX(" + x + "px)";
}

// Snap ke posisi akhir dengan transition mulus, lalu bersihkan
function snapSelesai(pindah) {
  if (!dragLangkahAktif) return;

  const durasi = "0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  if (pindah && dragLangkahTarget) {
    // Commit: langkah target jadi aktif
    const idTujuan = dragLangkahTarget.id;

    // Scroll ke atas dulu biar tidak kelihatan lompat saat pindah tab
    window.scrollTo(0, 0);

    dragLangkahAktif.style.transition = "transform " + durasi;
    dragLangkahTarget.style.transition = "transform " + durasi;

    dragLangkahAktif.style.transform = "translateX(" + (dragArah === "kiri" ? -lebarLayar : lebarLayar) + "px)";
    dragLangkahTarget.style.transform = "translateX(0)";

    // Update nav tab
    semuaNavBtn.forEach(function (btn) {
      btn.classList.toggle("aktif", btn.dataset.tujuan === idTujuan);
    });

    setTimeout(function () {
      // Bersihkan semua tetangga yang sempat disiapkan
      const indexTujuan = urutanTab.indexOf(idTujuan);
      urutanTab.forEach(function (id, i) {
        const el = document.getElementById(id);
        el.style.transition = "";
        el.style.transform = "";
        el.style.visibility = "";
        el.style.opacity = "";
        el.style.pointerEvents = "";
      });

      dragLangkahAktif.classList.remove("aktif");
      dragLangkahTarget.classList.add("aktif");

      if (idTujuan === "langkah-ringkasan") {
        tampilkanRingkasan();
      }

      bersihkanDrag();
    }, 250);

  } else {
    // Batalkan: kembalikan ke posisi semula
    dragLangkahAktif.style.transition = "transform " + durasi;
    dragLangkahAktif.style.transform = "translateX(0)";

    if (dragLangkahTarget) {
      dragLangkahTarget.style.transition = "transform " + durasi;
      dragLangkahTarget.style.transform = "translateX(" + (dragArah === "kiri" ? lebarLayar : -lebarLayar) + "px)";
    }

    setTimeout(function () {
      dragLangkahAktif.style.transition = "";
      dragLangkahAktif.style.transform = "";

      if (dragLangkahTarget) {
        dragLangkahTarget.style.transition = "";
        dragLangkahTarget.style.transform = "";
        dragLangkahTarget.style.visibility = "";
        dragLangkahTarget.style.opacity = "";
        dragLangkahTarget.style.pointerEvents = "";
      }

      bersihkanDrag();
    }, 300);
  }
}

function bersihkanDrag() {
  dragAktif = false;
  dragArahTerkunci = null;
  dragLangkahAktif = null;
  dragLangkahTarget = null;
  dragArah = null;
}

document.addEventListener("touchstart", function (event) {
  if (dragAktif) return;

  dragStartX = event.touches[0].clientX;
  dragStartY = event.touches[0].clientY;
  dragArahTerkunci = null;
  dragAktif = false;
  dragArah = null;
  dragLangkahTarget = null;

  const langkahSaatIni = document.querySelector(".langkah.aktif");
  if (!langkahSaatIni) return;

  const indexSekarang = urutanTab.indexOf(langkahSaatIni.id);
  if (indexSekarang === -1) return;

  dragLangkahAktif = langkahSaatIni;
}, { passive: true });

document.addEventListener("touchmove", function (event) {
  const x = event.touches[0].clientX;
  const y = event.touches[0].clientY;
  const deltaX = x - dragStartX;
  const deltaY = y - dragStartY;

  // Kunci arah di awal gerakan
  if (!dragArahTerkunci) {
    if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
    dragArahTerkunci = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertikal";
  }

  if (dragArahTerkunci !== "horizontal") return;

  // Inisialisasi drag pertama kali (arah sudah pasti horizontal)
  if (!dragAktif) {
    if (!dragLangkahAktif) return;
    const indexSekarang = urutanTab.indexOf(dragLangkahAktif.id);
    const arah = deltaX < 0 ? "kiri" : "kanan";
    const indexTarget = arah === "kiri" ? indexSekarang + 1 : indexSekarang - 1;

    if (indexTarget < 0 || indexTarget >= urutanTab.length) return;

    dragAktif = true;
    dragArah = arah;
    dragLangkahTarget = document.getElementById(urutanTab[indexTarget]);

    // Siapkan tetangga: posisi awal di luar layar, langsung visible
    if (dragLangkahTarget) {
      dragLangkahTarget.style.transition = "none";
      dragLangkahTarget.style.transform = "translateX(" + (arah === "kiri" ? lebarLayar : -lebarLayar) + "px)";
      dragLangkahTarget.style.visibility = "visible";
      dragLangkahTarget.style.opacity = "1";
      dragLangkahTarget.style.pointerEvents = "none";
      dragLangkahTarget.scrollTop = 0;
      // Flush layout biar posisi awal tergambar sebelum ikut jari
      void dragLangkahTarget.offsetWidth;
    }
  }

  if (!dragAktif) return;

  // Gerakkan kedua langkah ikut jari
  setDragTransform(dragLangkahAktif, deltaX);
  if (dragLangkahTarget) {
    const offsetTarget = dragArah === "kiri" ? lebarLayar + deltaX : -lebarLayar + deltaX;
    setDragTransform(dragLangkahTarget, offsetTarget);
  }

}, { passive: true });

document.addEventListener("touchend", function (event) {
  if (!dragLangkahAktif) return;

  if (!dragAktif) {
    // Jari diangkat tanpa drag horizontal - tidak ada yang perlu dibersihkan
    dragLangkahAktif = null;
    return;
  }

  const deltaX = event.changedTouches[0].clientX - dragStartX;
  const threshold = lebarLayar * 0.35;
  const pindah = Math.abs(deltaX) > threshold;

  snapSelesai(pindah);
}, { passive: true });
