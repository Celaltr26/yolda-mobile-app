# 🚗 Yolda - Mini Yolculuk Talep Platformu

Kullanıcıların anlık yolculuk talebi oluşturabildiği, sürücülerin bekleyen talepleri inceleyip kabul edebildiği ve sürecin uçtan uca yönetilebildiği full-stack mobil platform.

---

## 🛠️ Kullanılan Teknolojiler

- **Mobil:** React Native, Expo (SDK 57), TypeScript, React Navigation, Zustand
- **Backend:** Node.js, Express, TypeScript, Socket.io
- **Veritabanı & ORM:** PostgreSQL (Supabase Cloud), Prisma ORM
- **Kimlik Doğrulama:** JWT (JSON Web Token), bcrypt
- **Canlı Dağıtım:** Render (Web Service), Supabase (Database)

---

## 🌐 Canlı Servis Bağlantıları & Test APK

- **Canlı Backend API:** `https://yolda-mobile-app.onrender.com/api`
- **Mobil Test APK:** [app-release.apk İndir](https://github.com/Celaltr26/yolda-mobile-app/releases/download/v1.0.0/app-release.apk)
- **API Değiştirici:** Uygulama içindeki üst başlıkta (Header) bulunan `⚙️ API` butonu ile canlı sunucu veya yerel IP adresi anlık olarak değiştirilebilir.

---

## ⚡ Hızlı Test İçin Demo Hesaplar

Uygulama giriş ekranındaki tek tıkla demo giriş butonları kullanılabilir ya da aşağıdaki bilgiler girilebilir:

| Rol | E-Posta | Şifre |
|---|---|---|
| **Yolcu (Müşteri)** | `yolcu@yolda.com` | `123456` |
| **Sürücü** | `surucu@yolda.com` | `123456` |

*(Dilerseniz yeni bir Müşteri veya Sürücü hesabı da oluşturabilirsiniz).*

---

## 📱 Temel Özellikler & İş Akışı

1. **Kimlik Doğrulama:** JWT tabanlı güvenli kayıt ve giriş. Müşteri (`CUSTOMER`) ve Sürücü (`DRIVER`) rolleri.
2. **Yolculuk Talebi Oluşturma:** Müşteri başlangıç ve varış noktalarını belirterek anlık talep oluşturur (tek tıkla başlangıç/hedef ters çevirme ve popüler konumlar desteğiyle).
3. **Talep Durum Takibi:** Talepler `PENDING` (Bekliyor), `ACCEPTED` (Kabul Edildi), `COMPLETED` (Tamamlandı) ve `CANCELLED` (İptal) durumlarıyla anlık izlenir.
4. **Talep İptali:** Müşteri, henüz sürücü tarafından kabul edilmemiş talebini iptal edebilir.
5. **Sürücü Operasyonu:** Sürücüler bekleyen talepleri listeleyebilir, bir talebi kabul edip yolculuk sonunda "Tamamlandı" olarak işaretleyebilir.
6. **Gerçek Zamanlı Haberleşme (Socket.io):** Yeni bir talep açıldığında tüm sürücülere anlık bildirim düşer; talep kabul edildiğinde veya tamamlandığında yolcunun ekranı otomatik güncellenir.

---

## 💻 Yerel Geliştirme & Kurulum Adımları

### 1. Backend Kurulumu
```bash
cd backend
npm install

# .env dosyasını oluşturun (.env.example şablonunu kullanabilirsiniz)
# DATABASE_URL="postgresql://kullanici:sifre@host:5432/veritabani"
# JWT_SECRET="super_secret_jwt_key"
# PORT=5000

# Veritabanı şemasını eşitleyin
npx prisma generate
npx prisma db push

# Geliştirme sunucusunu başlatın
npm run dev
```

### 2. Mobil Kurulumu
```bash
cd mobile
npm install

# Expo geliştirici sunucusunu başlatın
npx expo start
```

---

## 📡 API Uç Noktaları

| Metot | Uç Nokta | Açıklama | Yetki |
|---|---|---|---|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı | Herkes |
| `POST` | `/api/auth/login` | Kullanıcı girişi & JWT üretimi | Herkes |
| `GET` | `/api/auth/me` | Aktif kullanıcı profili | JWT |
| `POST` | `/api/rides` | Yeni yolculuk talebi oluşturma | CUSTOMER |
| `GET` | `/api/rides/my-rides` | Kullanıcının kendi yolculukları | JWT |
| `GET` | `/api/rides/pending` | Bekleyen talepler listesi | DRIVER |
| `PATCH` | `/api/rides/:id/accept` | Yolculuk talebini kabul etme | DRIVER |
| `PATCH` | `/api/rides/:id/complete`| Yolculuğu tamamlama | DRIVER |
| `PATCH` | `/api/rides/:id/cancel` | Bekleyen talebi iptal etme | CUSTOMER |

---

## 🗄️ Veritabanı Mimarisi (Prisma)

```prisma
enum Role {
  CUSTOMER
  DRIVER
}

enum RideStatus {
  PENDING
  ACCEPTED
  COMPLETED
  CANCELLED
}

model User {
  id             String     @id @default(uuid())
  fullName       String
  email          String     @unique
  password       String
  role           Role       @default(CUSTOMER)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  ridesAsCustomer Ride[]    @relation("CustomerRides")
  ridesAsDriver   Ride[]    @relation("DriverRides")
}

model Ride {
  id                 String     @id @default(uuid())
  customerId         String
  customer           User       @relation("CustomerRides", fields: [customerId], references: [id])
  driverId           String?
  driver             User?      @relation("DriverRides", fields: [driverId], references: [id])
  originAddress      String
  destinationAddress String
  status             RideStatus @default(PENDING)
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
}
```