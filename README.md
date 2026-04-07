# Panduan Export APK — FR Finance

## Prasyarat
| Tools | Download |
|-------|---------|
| Node.js v18+ | https://nodejs.org |
| Git (opsional) | https://git-scm.com |
| Akun Expo (gratis) | https://expo.dev |

---

## TAHAP 1 — Buat Proyek Expo

Buka terminal / command prompt, jalankan:

```bash
npx create-expo-app FRFinance
cd FRFinance
```

---

## TAHAP 2 — Install Dependensi SQLite

```bash
npx expo install expo-sqlite expo-status-bar
```

---

## TAHAP 3 — Masukkan Kode Aplikasi

1. Buka folder `FRFinance` di VS Code (atau editor apapun)
2. Hapus isi file **App.js** yang ada
3. Copy-paste seluruh kode dari artifact **App.js** yang sudah disiapkan

---

## TAHAP 4 — Konfigurasi app.json

Buka file `app.json`, sesuaikan seperti ini:

```json
{
  "expo": {
    "name": "FR Finance",
    "slug": "fr-finance",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#4F46E5"
    },
    "android": {
      "package": "com.frfinance.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      }
    },
    "ios": {
      "bundleIdentifier": "com.frfinance.app"
    }
  }
}
```

---

## TAHAP 5 — Test di HP Dulu (Opsional tapi Disarankan)

```bash
npx expo start
```

- Install aplikasi **Expo Go** di HP Android dari Play Store
- Scan QR code yang muncul di terminal
- Aplikasi langsung jalan di HP tanpa perlu build

---

## TAHAP 6 — Build APK via EAS (Cloud, Gratis)

### 6a. Install EAS CLI
```bash
npm install -g eas-cli
```

### 6b. Login ke akun Expo
```bash
eas login
```
Masukkan email & password akun expo.dev Anda.

### 6c. Inisialisasi EAS di proyek
```bash
eas init
```
Ikuti instruksi, pilih proyek baru jika ditanya.

### 6d. Buat file eas.json di root folder proyek
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 6e. Mulai Build APK
```bash
eas build -p android --profile preview
```

Proses build berjalan di server Expo (10–20 menit).
Anda akan dapat **link download APK** setelah selesai.

---

## TAHAP 7 — Install APK ke HP Android

**Cara 1 — Download langsung dari link:**
- Buka link APK dari Expo di browser HP
- Tap download → tap file APK → Install

**Cara 2 — Transfer manual:**
- Download APK ke PC
- Kirim via kabel USB / Google Drive / WhatsApp ke HP
- Buka file APK di HP → Install

> ⚠️ Aktifkan **"Izinkan instalasi dari sumber tidak dikenal"**
> Pengaturan → Keamanan → Sumber Tidak Dikenal → Aktifkan

---

## Ringkasan Perintah (Cepat)

```bash
# 1. Buat proyek
npx create-expo-app FRFinance && cd FRFinance

# 2. Install dependensi
npx expo install expo-sqlite

# 3. Test di HP
npx expo start

# 4. Build APK
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

---

## Estimasi Waktu

| Tahap | Waktu |
|-------|-------|
| Setup proyek | 5 menit |
| Pasang kode | 5 menit |
| Test di Expo Go | 2 menit |
| Build APK di cloud | 10–20 menit |
| Install ke HP | 2 menit |
| **Total** | **~30 menit** |

---

## Masalah Umum

| Error | Solusi |
|-------|--------|
| `eas: command not found` | Jalankan `npm install -g eas-cli` ulang |
| Build gagal | Cek `app.json`, pastikan `package` unik |
| APK tidak bisa diinstall | Aktifkan sumber tidak dikenal di HP |
| Expo Go tidak scan | Pastikan HP & PC satu jaringan WiFi |
