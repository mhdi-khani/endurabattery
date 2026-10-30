> نسخه ۷: اصلاحات تصویر Hero، کنتراست تم تاریک، فیلتر موبایل، انتخاب استان/شهر و کارت دسته‌ها. راهنما: [docs/V7_UX_RESPONSIVE_LOCATIONS_FA.md](docs/V7_UX_RESPONSIVE_LOCATIONS_FA.md)

# Endura Battery — Full Site V4 (Official Brand Identity + Light/Dark Theme)

> نسخه ۴ با هویت بصری رسمی Nexus Grid؛ تمام ماژول‌ها، داده‌ها و اتصال عمومی Supabase نسخه ۳ حفظ شده‌اند.

**راهنمای به‌روزرسانی هویت و تم:** `docs/BRAND_THEME_V4_FA.md`

**فونت فارسی:** لطفاً فایل دارای مجوز `IRANSans.ttf` را شخصاً در مسیر `assets/fonts/IRANSans.ttf` قرار دهید (فونت همراه این بسته توزیع نشده).

**SQL جدید در Supabase:** `supabase/migrations/20261102000000_endura_brand_identity.sql` را پس از Migrationهای پیشین اجرا کنید.

---

# Endura Battery — Supabase Edition V2.0

نسخه GitHub Pages فروشگاه **Endura Battery** با اتصال محصولات و محتوای عمومی به Supabase، ورود مدیر با ایمیل/رمز و آپلود تصاویر در Supabase Storage.

> **دامنه تحویل:** محصولات، برندها (از جدول محصولات)، بنر و تنظیمات سایت، مطالب و توضیحات دسته‌ها، مقالات، مناطق پوشش و مدیریت اولیه عاملان با نقش مدیر به Supabase متصل شده‌اند. **پرداخت واقعی، ثبت امن سفارش، موجودی اختصاصی عاملان و پنل عملیاتی عاملان هنوز راه‌اندازی نشده‌اند.** هیچ پرداختی به‌عنوان واقعی ثبت نمی‌شود. سبد خرید و برخی ابزارهای حساب مشتری صرفاً محلی/آزمایشی هستند.

## شروع سریع — مراحل را به ترتیب انجام بده

### ۱. دیتابیس Supabase

Project URL از قبل در `assets/js/supabase-config.js` تنظیم شده است. کلید این فایل **Publishable** است و برای کد فرانت‌اند مجاز است. هرگز `service_role`، `sb_secret_...` یا رمز دیتابیس را در GitHub یا کد سایت قرار نده.

در Supabase Dashboard وارد **SQL Editor → New Query** شو. ترتیب اجرای SQL:

1. اگر جداول Endura را **هنوز نساخته‌ای**، محتوای `supabase/migrations/20261029000000_endura_initial.sql` را اجرا کن.
2. سپس محتوای `supabase/migrations/20261030000000_live_catalog_cms_hardening.sql` را اجرا کن. این فایل دسترسی SQL، داده پایه CMS و RLS را تکمیل می‌کند.
3. اگر محصولات قبلاً وارد نشده‌اند، `supabase/seeds/02_import_catalog_124_ONCE.sql` را **فقط یک بار** اجرا کن. سپس از **Table Editor → products** تعداد رکوردها را بررسی کن.
4. اگر جداول و محصولات از Starter Kit قبلی ساخته شده‌اند، **مرحله ۱ و ۳ را تکرار نکن**؛ فقط فایل مرحله ۲ را اجرا کن. قبل از اجرای فایل‌ها از دیتابیس موجود نسخه پشتیبان تهیه کن.

> اگر اتصال GitHub-Supabase برای اجرای خودکار migration فعال است، اجرای دستی همان migrationها ممکن است با تاریخچه migration تداخل پیدا کند. یکی از دو مسیر «Supabase CLI/GitHub Integration» یا «SQL Editor» را انتخاب کن و migration اجراشده را دوباره اجرا نکن.

**مهم:** ۱۲۴ ردیف کاتالوگ بر اساس فایل اولیه هستند؛ ۵۱ قیمت موجود و بقیه نیازمند استعلام‌اند. تعدادی از تصاویر فقط نمونه خانواده محصول‌اند و موجودی `stock` در داده اولیه **دمو** است؛ برای راه‌اندازی فروش واقعی باید قیمت، عکس و موجودی عاملان را بازبینی کنی. برای UPS و سولار محصول ساختگی درج نشده؛ از پنل می‌توانی اضافه کنی.

### ۲. ساخت حساب مدیر و اختصاص نقش

1. Supabase → **Authentication → Users → Add user**، یک کاربر ایمیل/رمز بساز یا دعوت کن.
2. ایمیل کاربر را دقیقاً از فهرست Users کپی کن.
3. فایل `supabase/seeds/03_grant_admin_template.sql` را در ویرایشگر باز کن و **هر دو** عبارت `admin@example.com` را با ایمیل کاربر جایگزین کن.
4. SQL را در **SQL Editor** اجرا کن. خروجی جدول پایانی باید همان ایمیل با نقش `admin` باشد.
5. از آدرس `/#/admin` وارد پنل شو و ایمیل و رمز واقعی حساب را وارد کن.

بدون نقش `admin`، Supabase اجازه ویرایش محصولات/محتوا را نمی‌دهد؛ پنهان‌کردن منوی مرورگر تنها لایه امنیتی نیست و RLS روی پایگاه‌داده اعمال می‌شود.

### ۳. تنظیم Auth برای دامنه GitHub Pages

Supabase → Authentication → URL Configuration:

- **Site URL:** آدرس نهایی فروشگاه (مثال: `https://USERNAME.github.io/REPOSITORY/`).
- **Redirect URLs:** همان دامنه GitHub Pages و اگر لازم است آدرس تست توسعه محلی (مثال `http://localhost:8000/`).

ورود ایمیل/رمز پنل از `signInWithPassword` استفاده می‌کند. در صورت استفاده از دعوت ایمیلی/بازیابی رمز، URL Configuration اهمیت بیشتری دارد.

### ۴. انتشار روی GitHub Pages

- محتویات پوشه `endura-battery-site` باید در **ریشه Repository** باشد؛ `index.html` و پوشه `.github` را به ریشه ببر.
- فایل `.github/workflows/pages.yml` همراه پروژه است.
- GitHub → Repository → **Settings → Pages → Source: GitHub Actions**.
- روی branch `main` Push کن؛ پس از اجرای Workflow، سایت در دامنه اعلام‌شده باز می‌شود.
- آدرس پنل: `https://USERNAME.github.io/REPOSITORY/#/admin`.

برای تست محلی: `python -m http.server 8000` در پوشه سایت و سپس `http://localhost:8000/`. به اینترنت برای SDK Supabase و API پروژه نیاز است.

### ۵. امتحان ذخیره آنلاین

1. با حساب مدیر وارد `/#/admin/products` شو.
2. نام یک محصول آزمایشی یا قیمت اون رو تغییر بده و ذخیره کن.
3. در Supabase → **Table Editor → products** همان رکورد را پیدا کن و مقدار جدید را ببین.
4. سایت را روی یک دستگاه/مرورگر دیگر باز یا Refresh کن؛ مقدار جدید باید از Supabase خوانده شود.
5. در `/#/admin/content` بنر یا مقاله را اصلاح کن؛ اطلاعات CMS در `site_settings` و `cms_articles` ذخیره می‌شوند.
6. آپلود عکس از `/#/admin/products` یا ویرایش Hero در Storage bucket به نام `endura-public` ذخیره می‌شود.

در پنل گزینه **بازخوانی دیتابیس** هم وجود دارد. همگام‌سازی داده‌ها در این نسخه روی بارگذاری/بازخوانی انجام می‌شود و Realtime subscription فعال نیست.

## نقشه داده‌ها

| بخش | منبع |
| --- | --- |
| محصولات و قیمت | `public.products` |
| محتوای مقاله | `public.cms_articles` |
| عنوان Hero، فوتر، تعرفه و متن دسته‌ها | `public.site_settings`، رکورد `key=public` |
| پوشش منطقه | `public.service_zones` |
| عاملان قابل مدیریت توسط ادمین | `public.agents` |
| ورود و نشست مدیر | `auth.users` / `public.user_roles` |
| آپلود عکس عمومی | `storage` bucket: `endura-public` |

فایل‌های `supabase/migrations` کنترل ایجاد جدول‌ها و سیاست‌ها را انجام می‌دهند. کلید عمومی به تنهایی مجوز مدیریتی ایجاد نمی‌کند.

## وضعیت عملیاتی و محدودیت‌ها

- **عملیاتی:** نمایش کالا و محتوای منتشرشده از Supabase، ورود مدیر، ویرایش محصول/قیمت/مقاله/تنظیمات، بارگذاری تصویر و ورود فایل Excel/CSV از داخل پنل ادمین.
- **در انتظار بک‌اند/Edge Functions:** ثبت سفارش واقعی، پرداخت آنلاین و COD، مدیریت پرداخت/استرداد، تخصیص سفارش به عامل، رزرو اتمیک موجودی، صورت‌حساب و تسویه.
- **غیرفعال در سایت عمومی:** ثبت سفارش آزمایشی با «پرداخت موفق» و تغییر وضعیت مالی از پنل نمایشی عامل. این کار از ایجاد تصور دریافت واقعی وجه جلوگیری می‌کند.
- **محلی / آزمایشی:** سبد خرید، مقایسه، شهر انتخابی و برخی قابلیت‌های حساب مشتری. این داده‌ها بین دستگاه‌ها همگام نمی‌شوند.
- **قالب فارسی:** CSS از `IRANSans` و برای لاتین از `Open Sans` استفاده می‌کند. فایل فونت IRANSans به دلیل مجوز انتشار در بسته نیست؛ صاحب لایسنس می‌تواند آن را در `assets/fonts/IRANSans.ttf` قرار دهد و در ریپازیتوری خصوصی/دارای مجوز نگهداری کند.
- **دقت داده:** نمایش قیمت از فایل مبنا به معنای تأیید قیمت یا امکان خرید قطعی نیست؛ پیش از عرضه واقعی کنترل شود.

## نکات امنیتی

- Publishable Key در فرانت‌اند **عمومی** است؛ سطح دسترسی واقعی با RLS و Grants محدود می‌شود.
- هیچ Secret/Service Role در پروژه وجود ندارد.
- لاگین ادمین با Supabase Auth و نقش دیتابیس کنترل می‌شود.
- اسناد مشتری، پرداخت و تسویه از مرورگر عمومی نوشته نمی‌شوند.
- برای تولیدی شدن، لازم است کد امن سفارش/پرداخت و قوانین دسترسی، با تست نفوذ و بررسی حقوقی/مالی تأیید شوند.

## فایل‌های اصلی

`index.html`، `assets/js/app.js`، `assets/js/supabase-live.js`، `assets/js/supabase-config.js`، `assets/js/store.js`، `assets/js/backoffice.js`، `assets/css/styles.css`، `.github/workflows/pages.yml`، `supabase/migrations/*.sql`، `supabase/seeds/*.sql`.


## V3 — Vehicle battery finder (2026-10-29)

- 786 vehicle models and 116 vehicle makes imported from the provided Excel workbook.
- Vehicle database relationship: `vehicle_models` → `vehicle_battery_fitments` → `products`.
- Candidate matches require manual technical verification of year, trim, terminals, dimensions, start/stop technology, and vehicle specifications. They are not installation guarantees.
- Vehicle finder: `/#/finder/light`, all models: `/#/vehicles`, individual model: `/#/vehicle/VH-0001`, combined search: header or `/#/search?q=...`.
- Admin verification of fitment: `/#/admin/vehicles` after admin authentication.
- Migration sequence: base migrations (20261029, 20261030) → `20261031000000_vehicle_catalog_fitments.sql` → `20261101000000_endura_visual_defaults.sql`.
- Seed sequence: existing products import `02_import_catalog_124_ONCE.sql` BEFORE `04_import_vehicles_and_candidates_ONCE.sql`.
- SQL seed is optional if database has already been populated separately, but required for live vehicle data/relations. The site includes bundled read-only catalog for preview.
- SVGs: 39 handcrafted interface assets in `assets/icons/`, category illustrations and automotive hero in `assets/images/`.
- IRANSans: CSS @font-face points to `assets/fonts/IRANSans.ttf`. Add your own licensed copy in that exact location before deploying; the ZIP does not distribute font data. Open Sans is configured through Google Fonts.
- Payment, real order placement, and agent operations remain disabled until secure server-side backend is implemented.


## اسلایدر مدیریت‌پذیر
راهنمای جدید: [HERO_SLIDER_V5_FA](docs/HERO_SLIDER_V5_FA.md). از مسیر `/#/admin/content` مدیریت کنید.
