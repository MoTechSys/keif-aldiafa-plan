# 🔐 دليل ربط إشعار الكوكيز بالتحليلات (Consent Gating — PDPL)

> يكمّل مكوّن `CookieConsent.tsx`. الهدف: عدم تشغيل GA/Ads/Meta/TikTok إلا بعد موافقة المستخدم — امتثال نظام حماية البيانات السعودي.

## الوضع الحالي
- التحليلات تُحمّل `afterInteractive` **دائماً** (بدون موافقة).
- تتبّع تحويل الواتساب/الاتصال يعمل عبر مستمع نقرات عام.

## التطبيق (3 خطوات)

### 1) ضع المكوّن في layout.tsx (داخل body، آخر عنصر)
```tsx
import CookieConsent from "@/components/CookieConsent";
// ...
<CookieConsent />
```

### 2) Google Consent Mode v2 (الأفضل — لا يوقف القياس كلياً)
في `<head>` قبل gtag، اضبط الوضع الافتراضي "denied":
```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
```
ثم عند الموافقة (استمع لحدث المكوّن):
```js
window.addEventListener('consent-updated', function (e) {
  var granted = e.detail === 'granted';
  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied'
  });
});
```
> Google Consent Mode v2 يسمح بقياس مجمّع (modeling) حتى مع الرفض — أفضل من إيقاف تام.

### 3) Meta/TikTok (اختياري)
لفّ تحميل بكسل Meta/TikTok بشرط `getStoredConsent() === 'granted'`، أو استخدم `ttq.holdConsent()`/`grantConsent()` (TikTok يدعمها أصلاً في الكود الحالي).

## ملاحظة
تتبّع تحويل الواتساب (الأهم لك) يبقى يعمل — Consent Mode يؤثر على تخزين الكوكيز لا على إطلاق الأحداث الأساسية. التحويلات تُقاس (بنمذجة عند الرفض).

## المخاطر
- بدون consent gating: مخاطرة PDPL (غرامات محتملة).
- مع Consent Mode v2: امتثال + الحفاظ على 70-90% من دقة القياس.
