# راهنمای نسخه ۳ فروشگاه Endura Battery

## خروجی شامل چیست؟

این ZIP **کل نسخه قبلی سایت به‌علاوه تغییرات جدید** است، نه یک بسته Patch. همه صفحات عمومی، PDP، PLP، Checkout نمایشی غیرفعال، حساب مشتری، فرم‌ها و پنل ادمین قبلی حفظ شده‌اند. مدل خودرو، جست‌وجوی ترکیبی، روابط خودرو–باتری، آیکون‌های SVG و تصویرسازی‌ها اضافه شده‌اند.

### داده‌های افزوده‌شده

- ۷۸۶ مدل خودرو، ۱۱۶ برند از فایل Excel ارسالی
- جدول `vehicle_models` در Supabase
- جدول واسط `vehicle_battery_fitments` با کلید مرکب `(vehicle_id, product_id)`
- ۹٬۲۱۰ رابطه کاندید از تطبیق اولیه ظرفیت، ولتاژ و قالب باتری در فایل‌های واردسازی
- وضعیت‌های `candidate`، `verified` و `rejected` برای هر رابطه

**هشدار:** روابط اولیه صرفاً پیشنهادند. بدون تأیید ابعاد دقیق، جای قطب‌ها، نوع باتری و تیپ/سال خودرو، سازگاری قطعی نیست.

## ۱. جایگزینی فایل‌ها در GitHub

1. محتویات فولدر `endura-battery-site` را در **ریشه ریپازیتوری GitHub** کپی کنید (فقط محتویات آن، نه پوشه تو در تو).
2. فایل‌ها را Commit و Push کنید.
3. در GitHub وارد `Settings → Pages` شوید و منبع انتشار را **GitHub Actions** بگذارید.
4. پس از انتشار، آدرس صفحه اصلی و `/#/vehicles` را باز کنید.
5. اگر Supabase تنظیم نشده یا اتصال برقرار نیست، برای مشاهده ساختار عمومی، `?preview=1` را قبل از `#/...` قرار دهید: `https://YOUR-SITE/?preview=1#/vehicles`. این فقط حالت پیش‌نمایش است و اطلاعات را ذخیره نمی‌کند.

## ۲. ترتیب اجرای SQL در Supabase

**اگر قبلاً دو Migration قدیمی را اجرا کرده‌اید، آن‌ها را دوباره اجرا نکنید.**

وارد Supabase Dashboard → SQL Editor شوید و این مراحل را به‌ترتیب انجام دهید:

1. اگر اولین نصب است، فایل `supabase/migrations/20261029000000_endura_initial.sql` را اجرا کنید.
2. اگر اولین نصب است، فایل `supabase/migrations/20261030000000_live_catalog_cms_hardening.sql` را اجرا کنید.
3. فایل `supabase/migrations/20261031000000_vehicle_catalog_fitments.sql` را اجرا کنید. این دو جدول و RLS را ایجاد می‌کند.
4. فایل `supabase/migrations/20261101000000_endura_visual_defaults.sql` را اجرا کنید تا اگر بنر قبلی هنوز تصویر پیش‌فرض داشت به تصویر جدید منتقل شود.
5. در صورت خالی بودن جدول `products`، ابتدا `supabase/seeds/02_import_catalog_124_ONCE.sql` را اجرا کنید.
6. برای خودروها و روابط، **فایل‌های `supabase/seeds/04_part_01_vehicles_fitments.sql` تا `04_part_06_vehicles_fitments.sql` را به ترتیب شماره** اجرا کنید. هر قسمت مستقلاً commit می‌شود.

فایل تجمیعی `04_import_vehicles_and_candidates_ONCE.sql` نیز برای اجرای ماشینی موجود است. فقط **یکی از روش‌های ورود خودرو** (فایل تجمیعی یا شش فایل تفکیک‌شده) را استفاده کنید.

**نکته:** اگر GitHub Integration به‌صورت خودکار Migrationها را اجرا می‌کند، مسیر CLI/Integration را مبنا بگذارید و همان Migrationها را بی‌دلیل در SQL Editor دوباره اعمال نکنید. داده Seed باید جدا اجرا شود مگر آن را در روند Deploy خودتان افزوده باشید.

## ۳. بررسی دیتابیس

پس از واردسازی، کوئری زیر را در Supabase SQL Editor اجرا کنید:

```sql
select count(*) as vehicle_models from public.vehicle_models;
select count(distinct brand) as vehicle_brands from public.vehicle_models;
select count(*) as candidate_fitments from public.vehicle_battery_fitments;
select v.brand, v.model, p.name as battery_name, f.status
from public.vehicle_battery_fitments f
join public.vehicle_models v on v.id=f.vehicle_id
join public.products p on p.id=f.product_id
limit 15;
```

**انتظار:** مدل‌ها ۷۸۶، برندها ۱۱۶؛ روابط بر حسب تعداد محصولات موجود می‌تواند کم‌تر از ۹٬۲۱۰ باشد.

## ۴. صفحات جدید

- `/#/vehicles` — جست‌وجو و مشاهده تمام مدل‌ها
- `/#/vehicle/VH-0001` — صفحه اختصاصی مدل و باتری‌های پیشنهادی
- `/#/search?q=پژو` — جست‌وجوی ترکیبی خودرو و باتری
- `/#/finder/light` — انتخاب برند و مدل خودرو با گزینه‌های وابسته
- `/#/admin/vehicles` — مرور روابط و ثبت وضعیت «تأیید فنی» توسط مدیر واقعی

بخش جست‌وجو در هدر، پیشنهاد مدل خودرو را در کنار محصول نمایش می‌دهد. صفحه PDP باتری نیز خودروهای مرتبط را فهرست می‌کند.

## ۵. ورود به پنل مدیریت

در `Authentication → Users` یک کاربر با ایمیل خود ایجاد کنید. سپس در SQL Editor به آن کاربر نقش مدیر دهید:

```sql
insert into public.user_roles (user_id, role)
select id,'admin' from auth.users
where email='YOUR_EMAIL@example.com'
on conflict (user_id,role) do nothing;
```

در سایت به آدرس `/#/admin` مراجعه کنید. ورود با ایمیل و رمز Supabase انجام می‌شود. فقط حساب دارای نقش Admin می‌تواند محتوای مشترک و روابط خودرو را تغییر دهد.

## ۶. فایل‌ها و فونت‌ها

در `assets/icons` تعداد ۳۹ آیکون SVG اختصاصی موجود است. در `assets/images` تصویر کمپین Hero جدید و چهار تصویر دسته‌بندی مستقل قرار دارد. تصاویر نامطمئن محصولات همچنان با Placeholder مشخص نمایش داده می‌شوند.

فونت فارسی در `assets/css/styles.css` با **IRANSans** و فونت انگلیسی با **Open Sans** تنظیم شده است. برای فعال شدن فونت فارسی، یک نسخه مجاز از فایل `IRANSans.ttf` خودتان را در `assets/fonts/IRANSans.ttf` بگذارید؛ فایل فونت در بسته ZIP بازتوزیع نشده است. Open Sans از Google Fonts بارگیری می‌شود و در حالت آفلاین از فونت جایگزین استفاده خواهد شد.

## ۷. نکات بهره‌برداری

- کلید `sb_publishable_...` در فرانت‌اند قابل استفاده است؛ کلید Secret/Service Role نباید وارد مخزن شود.
- RLS بر روی `products`، `vehicle_models` و `vehicle_battery_fitments` فعال است؛ تأیید رابطه فقط برای مدیر مجاز است.
- پرداخت و ثبت سفارش واقعی، انتقال موجودی عامل و عملیات حساب مشتری هنوز نیاز به بک‌اند امن و احراز هویت مربوط دارند؛ آن‌ها را به‌عنوان پرداخت واقعی فعال نکنید.
- این بسته روی GitHub Pages **پیش‌نمایش و بخش مدیریت محصولات/CMS متصل به Supabase** را فراهم می‌کند و جایگزین سامانه عملیاتی فروش و پرداخت نیست.
