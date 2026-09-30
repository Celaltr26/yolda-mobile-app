# 🚗 Yolda - Mini Yolculuk Talep (Ride-Hailing) Platformu

> **Martı TAG benzeri, tam zamanlı (real-time) mini yolculuk talep platformu teknik vaka çalışması (case study).**  
> Modern ve temiz mimari prensipleriyle Express, TypeScript, Prisma ORM, PostgreSQL (Supabase), Socket.io, React Native (Expo) ve Zustand kullanılarak geliştirilmiştir.

---

## 📌 Proje Genel Bakışı

Yolda; yolcuların (CUSTOMER) başlangıç ve varış adresi belirterek hızlıca yolculuk talebi oluşturabildiği, sürücülerin (DRIVER) ise bekleyen talepleri anlık olarak görüp kabul edebildiği ve yolculuğu tamamlayabildiği iki taraflı bir mobil platformdur.

- **Canlı Backend URL (Render):** `https://yolda-mobile-app.onrender.com`
- **Veritabanı (Supabase PostgreSQL):** `db.ggakwlhuttdopzxbsykv.supabase.co:5432/postgres`

---

## 🏗️ Mimari ve Dizin Yapısı

Proje iki ana modülden oluşur:

```
yolda/
├── backend/                  # Node.js + Express + TypeScript + Prisma + Socket.io
│   ├── prisma/
│   │   ├── schema.prisma     # Veritabanı model şeması
│   │   └── schema.sql        # Supabase için ham SQL migration betiği
│   ├── src/
│   │   ├── controllers/      # auth.controller.ts, ride.controller.ts
│   │   ├── middlewares/      # auth.middleware.ts (JWT & Rol kontrolü)
│   │   ├── routes/           # auth.routes.ts, ride.routes.ts, index.ts
│   │   ├── socket/           # socket.ts (Socket.io sunucu yapılandırması)
│   │   ├── prisma/           # client.ts (PrismaClient singleton)
│   │   └── server.ts         # Express sunucu giriş noktası
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                   # React Native (Expo) + TypeScript + Zustand
    ├── src/
    │   ├── api/              # client.ts (Axios), auth.api.ts, ride.api.ts
    │   ├── config/           # constants.ts (API URL, durum etiketleri)
    │   ├── navigation/       # AppNavigator.tsx, types.ts
    │   ├── screens/
    │   │   ├── auth/         # LoginScreen.tsx, RegisterScreen.tsx
    │   │   ├── customer/     # CreateRideScreen.tsx, CustomerRidesScreen.tsx
    │   │   └── driver/       # PendingRidesScreen.tsx, DriverActiveRideScreen.tsx
    │   ├── store/            # authStore.ts, rideStore.ts (Zustand)
    │   ├── socket/           # socket.ts (Socket.io-client bağlantı ve dinleyiciler)
    │   ├── theme/            # colors.ts (Martı TAG teması)
    │   └── components/       # Header.tsx, StatusBadge.tsx, RideCard.tsx
    ├── App.tsx
    ├── package.json
    └── tsconfig.json
```

---

## 🗄️ Veritabanı Şeması (Prisma / PostgreSQL)

### 1. `User` Modeli (users tablosu)
| Alan | Tip | Açıklama |
|---|---|---|
| `id` | String (UUID) | Birincil Anahtar |
| `fullName` | String | Kullanıcı Adı Soyadı |
| `email` | String (Unique) | Benzersiz e-posta adresi |
| `password` | String | bcryptjs ile tuzlanmış parola hash'i |
| `role` | Enum (`CUSTOMER`, `DRIVER`) | Kullanıcı rolü |
| `createdAt` | DateTime | Oluşturulma zamanı |
| `updatedAt` | DateTime | Güncellenme zamanı |

### 2. `Ride` Modeli (rides tablosu)
| Alan | Tip | Açıklama |
|---|---|---|
| `id` | String (UUID) | Birincil Anahtar |
| `customerId` | String (FK -> User.id) | Talebi oluşturan müşteri |
| `driverId` | String? (Nullable FK -> User.id) | Talebi kabul eden sürücü |
| `originAddress` | String | Alış noktası |
| `destinationAddress` | String | Varış noktası |
| `status` | Enum (`PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`) | Varsayılan: `PENDING` |
| `createdAt` | DateTime | Oluşturulma zamanı |
| `updatedAt` | DateTime | Güncellenme zamanı |

---

## 🔌 API Uç Noktaları

Tüm korumalı uç noktalar `Authorization: Bearer <JWT_TOKEN>` başlığı ile çalışır.

### Kimlik Doğrulama (`/api/auth`)
| Metot | Yol | Erişim | Açıklama |
|---|---|---|---|
| `POST` | `/api/auth/register` | Herkese Açık | Yeni kullanıcı kaydı (`fullName`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Herkese Açık | Giriş yapma, JWT token ve kullanıcı nesnesi döner |
| `GET` | `/api/auth/me` | Yetkili | Giriş yapan kullanıcının güncel profili |

### Yolculuk Talepleri (`/api/rides`)
| Metot | Yol | Erişim | Açıklama |
|---|---|---|---|
| `POST` | `/api/rides` | Sadece `CUSTOMER` | Yeni yolculuk talebi oluşturur (`originAddress`, `destinationAddress`) |
| `GET` | `/api/rides/my-rides` | `CUSTOMER` / `DRIVER` | Kullanıcının kendi geçmiş ve aktif talepleri |
| `GET` | `/api/rides/pending` | Sadece `DRIVER` | Bekleyen (`PENDING`) durumundaki tüm talepler |
| `PATCH` | `/api/rides/:id/accept` | Sadece `DRIVER` | Bekleyen talebi kabul eder (`status -> ACCEPTED`) |
| `PATCH` | `/api/rides/:id/complete` | Sadece `DRIVER` | Kabul edilmiş talebi tamamlar (`status -> COMPLETED`) |
| `PATCH` | `/api/rides/:id/cancel` | Sadece `CUSTOMER` | Bekleyen talebi iptal eder (`status -> CANCELLED`) |

---

## ⚡ Gerçek Zamanlı Güncellemeler (Socket.io)

Backend ve mobil uygulama Socket.io üzerinden canlı çift yönlü haberleşir:
1. `new_ride_request`: Bir müşteri yeni yolculuk oluşturduğunda tetiklenir; sürücü ekranındaki bekleyen listesine anında düşer.
2. `ride_status_updated`: Bir sürücü yolculuğu kabul ettiğinde, tamamladığında veya müşteri iptal ettiğinde tetiklenir; müşterinin ekranında anında durum rozeti ve sürücü bilgisi güncellenir.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js >= 18
- npm >= 9

### 1. Backend Kurulumu

```bash
cd backend

# 1. Bağımlılıkları yükleyin
npm install

# 2. Prisma istemcisini oluşturun
npx prisma generate

# 3. (İsteğe Bağlı) Veritabanı şemasını push edin
npx prisma db push

# 4. Geliştirme modunda başlatın
npm run dev

# 5. Üretim derlemesi oluşturup başlatın (Render uyumlu)
npm run build
npm start
```
> Backend varsayılan olarak `http://localhost:5000` portunda çalışır.

### 2. Mobil Uygulama Kurulumu

```bash
cd mobile

# 1. Bağımlılıkları yükleyin
npm install --legacy-peer-deps

# 2. Expo geliştirme sunucusunu başlatın
npx expo start
```

Uygulamayı:
- **Web üzerinde:** `w` tuşuna basarak tarayıcıda
- **Android Emulator üzerinde:** `a` tuşuna basarak
- **Fiziksel Cihazda:** Telefonunuza `Expo Go` indirip terminaldeki QR kodu okutarak açabilirsiniz.

> **İpucu:** Mobil uygulama varsayılan olarak canlı Render sunucusuna (`https://yolda-mobile-app.onrender.com`) bağlanacak şekilde yapılandırılmıştır. Uygulama içindeki üst menüde yer alan `⚙️ API` butonu ile test amaçlı olarak adresi dilediğiniz gibi yerel bilgisayarınızın IP adresine (örn: `http://192.168.1.X:5000`) de çekebilirsiniz.

---

## 🧪 Adım Adım Test Senaryosu (Case Study Doğrulaması)

Uygulamanın eksiksiz çalıştığını test etmek için iki farklı hesapla (veya tek cihazda çıkış/giriş yaparak) aşağıdaki adımları izleyin:

### 1. Adım: Hızlı Demo Girişi veya Kayıt
- Mobil giriş ekranında test kolaylığı için hazır düğmeler bulunmaktadır:
  - **👤 Yolcu Olarak:** `yolcu@yolda.com` (Şifre: `123456`)
  - **🚗 Sürücü Olarak:** `surucu@yolda.com` (Şifre: `123456`)
- Dilerseniz "Kayıt Ol" ekranından yeni bir Yolcu ve yeni bir Sürücü hesabı oluşturabilirsiniz.

### 2. Adım: Müşteri (Yolcu) Akışı - Talep Açma
1. `CUSTOMER` hesabıyla giriş yapın.
2. Karşınıza "Nereye Gitmek İstiyorsunuz?" ekranı gelecektir.
3. Hızlı çiplerden (örn: "Kadıköy Rıhtım" ve "Beşiktaş İskele") seçin veya manuel adres yazın.
4. **"🚗 TAG Yolculuğu Başlat"** butonuna basın.
5. "Taleplerim" ekranında yolculuk durumu sarı renkli **"Sürücü Bekleniyor (PENDING)"** olarak listelenecektir.

### 3. Adım: İptal Etme Testi (Opsiyonel)
- Henüz bir sürücü kabul etmemişken müşteri kartındaki **"Talebi İptal Et"** butonuna bastığınızda talep başarıyla `CANCELLED` durumuna geçer.

### 4. Adım: Sürücü Akışı - Talebi Kabul Etme
1. Çıkış yapıp `DRIVER` hesabıyla giriş yapın (veya 2. bir cihaz / tarayıcı sekmesinde açın).
2. Sürücü paneli ekranında bekleyen yolculuk canlı olarak listelenecektir (`PENDING`).
3. Kartın altındaki **"Yolculuğu Kabul Et"** butonuna basın.
4. Talep durumu `ACCEPTED` olarak güncellenir ve sürücü **"Aktif Yolculuk"** ekranına yönlendirilir.
5. Aynı anda Socket.io aracılığıyla müşteri tarafında **"🎉 Sürücü Bulundu!"** bildirimi gösterilir ve kart mavi renkli **"Yolda / Kabul Edildi"** durumuna geçer.

### 5. Adım: Sürücü Akışı - Yolculuğu Tamamlama
1. Sürücü Aktif Yolculuk ekranındaki yeşil renkli **"✓ Yolculuğu Tamamla"** butonuna basar.
2. Talep durumu `COMPLETED` olarak işaretlenir.
3. Sürücünün aktif ekranı sıfırlanır ve yeni bekleyen talepler paneline döner.
4. Müşteri ekranında anlık olarak **"✅ Yolculuk Tamamlandı"** uyarısı çıkar ve talep yeşil renkli tamamlandı rozeti alır.

---

## 🛡️ Güvenlik ve Kod Kalitesi

- **Parola Güvenliği:** Parolalar veritabanında asla düz metin olarak saklanmaz, `bcryptjs` ile hashlenir.
- **JWT Koruması:** Uç noktalar rol denetimli (`requireRole`) middleware ile güvence altına alınmıştır. Bir müşteri sürücü uç noktasına veya bir sürücü başka bir sürücünün yolculuğuna müdahale edemez.
- **Tip Güvenliği:** Hem backend hem mobil tarafında `%100` TypeScript kullanılmış, `strict: true` moduyla tip kontrolleri sağlanmıştır.
- **State Yönetimi:** Zustand ile merkezi, hafif ve reaktif bir durum yönetimi inşa edilmiştir.
