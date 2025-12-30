# BSU Chat - Bakı Dövlət Universiteti Tələbə Chat Platforması

## 📋 Layihə Haqqında

BSU Chat - Bakı Dövlət Universiteti tələbələri üçün real-time mesajlaşma platforması. 16 fakültə üçün ayrı-ayrı chat otaqları, şəxsi mesajlaşma, admin paneli və təhlükəsizlik sistemləri ilə təchiz edilmiş müasir web tətbiqi.

## 🎯 Əsas Xüsusiyyətlər

### ✅ Tamamlanmış Funksiyalar

- ✅ **Qeydiyyat Sistemi**
  - BSU email validasiyası (@bsu.edu.az)
  - Azərbaycan telefon nömrəsi (+994XXXXXXXXX)
  - 3 verification sualı (minimum 2 doğru cavab)
  - 16 fakültə korpus məlumatları ilə verification

- ✅ **16 Fakültə Chat Otaqları**
  - Real-time mesajlaşma (2 saniyə refresh)
  - Profil şəkli dəstəyi
  - Bakı saat zonası ilə timestamp
  - 72 saatdan köhnə mesajların avtomatik silinməsi

- ✅ **Şəxsi Mesajlaşma**
  - İstifadəçilər arası 1-on-1 chat
  - Mesaj göndərmə və qəbul etmə
  - Profil məlumatları görüntüləmə

- ✅ **Bloklama və Şikayət Sistemi**
  - İstifadəçi bloklama funksiyası
  - Şikayət göndərmə sistemi
  - 16+ şikayət = təhlükəli hesab statusu

- ✅ **Admin Paneli**
  - Super Admin hesabı (ursamajor / ursa618)
  - Alt admin hesabları yaratma və silmə
  - Təhlükəli hesabları görüntüləmə və ban etmə
  - Qadağan olunmuş sözlər filtr sistemi
  - Sayt qaydalarını düzənləmə
  - Günün mövzusunu yeniləmə

- ✅ **Təhlükəsizlik**
  - Password əsaslı authentication
  - Banned user əngəlləməsi
  - Qadağan olunmuş sözlərin avtomatik filtrləməsi
  - Session idarəetməsi

## 🌐 URL-lər

- **Development Server**: https://3000-i25zwni1i8uy0qosxq8se-a402f90a.sandbox.novita.ai
- **Admin Paneli**: https://3000-i25zwni1i8uy0qosxq8se-a402f90a.sandbox.novita.ai/#admin
- **GitHub**: https://github.com/ilhamaliyevaz/bsu_chat_1__
- **Project Backup**: https://www.genspark.ai/api/files/s/y54hvks6

## 📊 Məlumat Strukturu

### Database Cədvələri (Cloudflare D1)

1. **users** - İstifadəçi hesabları
   - id, email, phone, password, full_name, faculty, course, profile_image, is_banned

2. **admins** - Admin hesabları
   - id, username, password, is_super_admin

3. **faculty_messages** - Fakültə chat mesajları
   - id, faculty, user_id, message, created_at

4. **private_messages** - Şəxsi mesajlar
   - id, sender_id, receiver_id, message, created_at

5. **blocks** - Bloklanmış istifadəçilər
   - id, blocker_id, blocked_id

6. **reports** - Şikayətlər
   - id, reporter_id, reported_id, reason, status

7. **banned_words** - Qadağan olunmuş sözlər

8. **rules** - Sayt qaydaları

9. **daily_topic** - Günün mövzusu

## 🚀 İstifadə Təlimatı

### Tələbə Girişi

1. Ana səhifədən "Qeydiyyatdan keç" düyməsinə klikləyin
2. Ad Soyad, email (@bsu.edu.az), telefon (+994XXXXXXXXX), şifrə, fakültə və kurs məlumatlarını daxil edin
3. 3 verification sualına cavab verin (minimum 2 doğru)
4. Qeydiyyat tamamlandıqdan sonra giriş edin
5. Öz fakültənizin chat otağına daxil olun
6. Digər tələbələrlə mesajlaşın
7. Şəxsi chat üçün istifadəçi adına klikləyin

### Admin Girişi

1. URL sonuna `#admin` əlavə edin
2. İstifadəçi adı: `ursamajor`
3. Şifrə: `ursa618`
4. Admin panelindən bütün funksiyaları idarə edin

## 🏗️ Texnologiyalar

- **Backend**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Icons**: Font Awesome
- **HTTP Client**: Axios
- **Deployment**: Cloudflare Pages (Render.com ready)

## 📦 Quraşdırma və İşə Salma

### Local Development

```bash
# Dependencies yükləmək
npm install

# Database migration
npm run db:migrate:local

# Build etmək
npm run build

# Development server başlatmaq
pm2 start ecosystem.config.cjs

# Serveri test etmək
curl http://localhost:3000
```

### Production Deployment (Render.com)

1. GitHub-a push edin
2. Render.com-da yeni Web Service yaradın
3. GitHub repository-ni bağlayın
4. Build Command: `npm run build`
5. Start Command: `npx wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000`

## 📝 Fakültələr

1. Mexanika-riyaziyyat fakültəsi (3-cü korpus)
2. Tətbiqi riyaziyyat və kibernetika fakültəsi (3-cü korpus)
3. Fizika fakültəsi (Əsas korpus)
4. Kimya fakültəsi (Əsas korpus)
5. Biologiya fakültəsi (Əsas korpus)
6. Ekologiya və torpaqşünaslıq fakültəsi (Əsas korpus)
7. Coğrafiya fakültəsi (Əsas korpus)
8. Geologiya fakültəsi (Əsas korpus)
9. Filologiya fakültəsi (1-ci korpus)
10. Tarix fakültəsi (3-cü korpus)
11. Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi (1-ci korpus)
12. Hüquq fakültəsi (1-ci korpus)
13. Jurnalistika fakültəsi (2-ci korpus)
14. İnformasiya və sənəd menecmenti fakültəsi (2-ci korpus)
15. Şərqşünaslıq fakültəsi (2-ci korpus)
16. Sosial elmlər və psixologiya fakültəsi (2-ci korpus)

## 🔐 Təhlükəsizlik Xüsusiyyətləri

- Email və telefon validasiyası
- Verification sualları sistemi
- Session-əsaslı authentication
- Banned user əngəlləməsi
- Bloklanmış istifadəçilərlə mesajlaşma əngəli
- Avtomatik söz filtrləməsi
- 16+ şikayət = təhlükəli hesab
- 72 saatdan köhnə mesajların avtomatik silinməsi

## ⚙️ Konfiqurasiya

### Super Admin Hesabı

- **İstifadəçi adı**: ursamajor
- **Şifrə**: ursa618

### Environment Variables

Local development üçün `.dev.vars` faylı:
```
# Bu layihədə environment variables lazım deyil
```

## 📊 API Endpoints

### Auth
- `POST /api/auth/get-questions` - Verification sualları
- `POST /api/auth/register` - Qeydiyyat
- `POST /api/auth/login` - Giriş

### Faculty Chat
- `GET /api/faculty/:faculty/messages` - Mesajları gətir
- `POST /api/faculty/:faculty/send` - Mesaj göndər
- `GET /api/faculty/:faculty/users` - İstifadəçiləri gətir

### Private Chat
- `GET /api/private/:userId1/:userId2/messages` - Şəxsi mesajlar
- `POST /api/private/send` - Şəxsi mesaj göndər

### Block & Report
- `POST /api/block` - Blokla
- `POST /api/report` - Şikayət et

### Admin
- `POST /api/admin/login` - Admin girişi
- `GET /api/admin/dangerous-accounts` - Təhlükəli hesablar
- `POST /api/admin/ban-user` - İstifadəçi ban et
- `GET /api/admin/banned-words` - Qadağan sözlər
- `POST /api/admin/add-banned-word` - Söz əlavə et
- `GET /api/rules` - Qaydalar
- `POST /api/admin/update-rules` - Qaydaları yenilə
- `GET /api/daily-topic` - Günün mövzusu
- `POST /api/admin/update-topic` - Mövzunu yenilə
- `GET /api/admin/sub-admins` - Alt adminlər
- `POST /api/admin/create-sub-admin` - Alt admin yarat
- `POST /api/admin/delete-sub-admin` - Alt admin sil

## 🎨 Dizayn

- Gradient background (purple to pink)
- Card-based layout
- Responsive design (mobile-first)
- Smooth animations
- Modern UI components
- Telegram/WhatsApp-inspired chat interface

## 📅 Status

- **Deployment Status**: ✅ Aktiv (Development)
- **Production**: Gözlənilir
- **Son Yeniləmə**: 2025-12-30

## 🔄 Növbəti Addımlar

1. GitHub-a push etmək
2. Production deployment (Cloudflare Pages və ya Render.com)
3. Custom domain bağlamaq
4. Real-time WebSocket əlavə etmək (optional)
5. Push notifications (optional)
6. File upload funksiyası (optional)

## 🤝 Töhfə

Bu layihə Bakı Dövlət Universiteti tələbələri üçün yaradılıb. İstənilən təklif və ya problem üçün GitHub issues istifadə edin.

## 📄 Lisenziya

Bu layihə təhsil məqsədləri üçün yaradılıb.

---

**Yaradılma tarixi**: 2025-12-30  
**Texnologiya**: Hono + Cloudflare Workers + D1 Database  
**Müəllif**: BSU Chat Development Team
