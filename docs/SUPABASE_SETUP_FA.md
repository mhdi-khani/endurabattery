# راهنمای اختصاصی Supabase — Endura Battery

[ابتدا README.md ریشه پروژه را بخوانید.](../README.md)

## تست‌های بعد از استقرار

1. بدون ورود، `/#/admin` باید صفحه ایمیل/رمز نشان دهد، نه جدول مشتریان.
2. ورود با حساب معمولی فاقد نقش `admin` باید رد شود.
3. مدیر بعد از ورود باید به محصولات/محتوا و آپلود تصاویر دسترسی داشته باشد.
4. محصول تازه در Table Editor دیده شود؛ روی مرورگر دوم پس از Reload قابل مشاهده باشد.
5. مقاله جدید در `cms_articles` و تنظیم Hero در `site_settings` ذخیره شود.
6. بارگذاری تصویر به `Storage → endura-public` برود و Public URL آن برای محصول ثبت شود.
7. کاربر ناشناس نباید بتواند با Publishable Key عملیات INSERT/UPDATE روی محصولات یا تنظیمات انجام دهد (RLS).
8. هیچ پرداخت یا سفارش واقعی از مرورگر ثبت نشود، تا زمانی که Edge Function های امن پیاده‌سازی شوند.

## اگر خطا دیدید

- `relation public.products does not exist`: فایل Migration اولیه اجرا نشده.
- `permission denied for function is_admin`: Migration hardening را اجرا کن.
- `new row violates row-level security policy`: حساب نقش `admin` ندارد یا سیاست‌ها اعمال نشده‌اند.
- `Invalid login credentials`: ایمیل/رمز اشتباه یا حساب غیرفعال است.
- `Failed to fetch`: اینترنت/فیلتر CDN، دامنه Supabase یا Data API در دسترس نیست.
- اگر محصولات نمایش داده نمی‌شوند: ابتدا تعداد رکوردهای `public.products` و وضعیت `active` را بررسی کن.

**کلید Secret یا رمز مدیر را برای پشتیبانی نفرستید.**
