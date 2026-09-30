# 🚗 Yolda - Mini Yolculuk Talep Platformu

Kullanıcıların anlık yolculuk talebi oluşturabildiği, sürücülerin bekleyen talepleri inceleyip kabul edebildiği ve sürecin uçtan uca yönetilebildiği full-stack mobil platform.

---

## 🛠️ Kullanılan Teknolojiler

- **Mobil:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express, TypeScript, Socket.io
- **Veritabanı & ORM:** PostgreSQL (Supabase Cloud), Prisma ORM
- **Kimlik Doğrulama:** JWT (JSON Web Token), bcrypt
- **Canlı Dağıtım:** Render (Web Service), Supabase (Database)

---

## 🌐 Canlı Servis Bağlantıları

- **Canlı Backend API:** `https://yolda-mobile-app.onrender.com/api`
- **Mobil Test APK:** `[APK dosyasını indirdiğinde Drive veya GitHub linkini buraya ekleyebilirsin]`

---

## 📱 Temel Özellikler & İş Akışı

1. **Kimlik Doğrulama:** JWT tabanlı güvenli kayıt ve giriş. Müşteri (`CUSTOMER`) ve Sürücü (`DRIVER`) rolleri.
2. **Yolculuk Talebi:** Müşteri başlangıç ve varış noktalarını belirterek anlık talep oluşturur.
3. **Talep Durum Takibi:** Talepler `PENDING`, `ACCEPTED`, `COMPLETED` ve `CANCELLED` durumlarıyla anlık izlenir.
4. **Talep İptali:** Müşteri, henüz sürücü tarafından kabul edilmemiş talebini iptal edebilir.
5. **Sürücü Operasyonu:** Sürücüler bekleyen talepleri listeleyebilir, bir talebi kabul edip yolculuk sonunda "Tamamlandı" olarak işaretleyebilir.
6. **Gerçek Zamanlı Haberleşme:** Socket.io altyapısı ile anlık oda ve durum yönetimi.

---

## 🗄️ Veritabanı Mimarisi

```sql
-- Kullanıcı Tablosu
users (id, fullName, email, phone, password, role, createdAt, updatedAt)

-- Yolculuk Talepleri Tablosu
rides (id, customerId, driverId, originAddress, originLat, originLng, destinationAddress, destinationLat, destinationLng, price, status, createdAt, updatedAt)