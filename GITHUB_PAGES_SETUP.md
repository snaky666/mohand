
# دليل نشر الموقع على GitHub Pages

## الخطوات المطلوبة

### 1. إعداد Supabase

تأكد من أنك قمت بإنشاء الجداول في Supabase باستخدام الملف `supabase-setup.sql` كما هو موضح في `SUPABASE_SETUP.md`.

### 2. تحديث إعدادات Supabase

افتح ملف `assets/js/supabase-config.js` وتأكد من أن القيم التالية صحيحة:

```javascript
const SUPABASE_URL = 'رابط_مشروعك_في_Supabase';
const SUPABASE_ANON_KEY = 'مفتاحك_العام_من_Supabase';
```

### 3. تحديث كلمة مرور الإدارة

⚠️ **مهم جداً للأمان!**

افتح ملف `assets/js/admin.js` وغيّر كلمة المرور الافتراضية:

```javascript
const ADMIN_PASSWORD = 'كلمة_مرور_قوية_جديدة';
```

### 4. تفعيل GitHub Pages

1. اذهب إلى إعدادات المستودع (Repository Settings)
2. اختر "Pages" من القائمة الجانبية
3. تحت "Source"، اختر "GitHub Actions"
4. احفظ التغييرات

### 5. رفع الملفات

```bash
git add .
git commit -m "Setup for GitHub Pages"
git push origin main
```

سيتم نشر الموقع تلقائياً على: `https://اسم_المستخدم.github.io/اسم_المستودع/`

## ملاحظات مهمة

### الفرق بين Replit و GitHub Pages

- **Replit**: يعمل مع Python وNode.js والخوادم
- **GitHub Pages**: يعمل فقط مع الملفات الثابتة (HTML, CSS, JavaScript)

### الأمان

- كلمة مرور الإدارة موجودة في الكود (JavaScript)
- هذا يعني أن أي شخص يمكنه رؤيتها إذا فحص الكود المصدري
- لذلك **يجب** تغيير كلمة المرور بانتظام
- للأمان الأفضل، استخدم Supabase Row Level Security policies

### إعدادات Supabase الأمنية

تأكد من أن RLS (Row Level Security) مفعّل كما في ملف `supabase-setup.sql`:

```sql
-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
```

### استكشاف الأخطاء

إذا لم يعمل الموقع:

1. افتح Developer Console (F12)
2. تحقق من وجود أخطاء
3. تأكد من صحة `SUPABASE_URL` و `SUPABASE_ANON_KEY`
4. تأكد من أن جميع ملفات JavaScript تُحمّل بشكل صحيح

## الملفات غير المطلوبة على GitHub Pages

الملفات التالية مطلوبة فقط على Replit ويمكن تجاهلها:

- `server.py` - الخادم Python
- `get_supabase_config.py` - سكريبت Python
- `pyproject.toml` - إعدادات Python
- `.replit` - إعدادات Replit

هذه الملفات لن تؤثر على عمل الموقع على GitHub Pages لأنها لن تُستخدم.
