"use client";

import { useEffect, useState } from "react";

/**
 * إشعار كوكيز متوافق مع نظام حماية البيانات السعودي (PDPL).
 * - يظهر مرة واحدة حتى يوافق/يرفض المستخدم (يُحفظ في localStorage).
 * - يبثّ حدث "consent-updated" ليتمكّن سكربت التحليلات من التفعيل بعد الموافقة (consent gating).
 * - أنيق ومنسجم مع الهوية الذهبية، متجاوب للجوال، يحترم prefers-reduced-motion.
 *
 * الاستخدام: ضعه في layout.tsx داخل <body>. واربط سكربتات GA/Meta/TikTok
 * بحيث لا تُطلق إلا بعد consent === "granted" (اقرأ localStorage "kd-consent").
 */

const STORAGE_KEY = "kd-consent";

type Consent = "granted" | "denied";

export function getStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getStoredConsent()) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (choice: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
      window.dispatchEvent(new CustomEvent("consent-updated", { detail: choice }));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="إشعار ملفات تعريف الارتباط"
      className="fixed bottom-0 inset-x-0 z-[60] px-4 pb-4 sm:pb-6"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
        style={{
          background: "linear-gradient(160deg, rgba(25,20,8,0.97), rgba(15,12,5,0.98))",
          border: "1px solid rgba(184,134,11,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p className="text-[#F5F5DC]/75 text-xs sm:text-sm leading-relaxed flex-1">
          نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربتك وتحليل أداء الموقع.
          بموافقتك تساعدنا على تقديم خدمة أفضل. يمكنك الرفض دون التأثير على تصفّحك.
        </p>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => decide("denied")}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs sm:text-sm min-h-[44px] text-[#F5F5DC]/70"
            style={{ border: "1px solid rgba(184,134,11,0.25)" }}
          >
            رفض
          </button>
          <button
            onClick={() => decide("granted")}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs sm:text-sm min-h-[44px] text-black"
            style={{ background: "linear-gradient(135deg, #D4A017, #B8860B)", fontWeight: 700 }}
          >
            موافق
          </button>
        </div>
      </div>
    </div>
  );
}
