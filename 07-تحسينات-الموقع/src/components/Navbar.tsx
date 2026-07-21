"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { DallahLogo } from "@/components/DallahLogo";
import {
  CITIES as SC_CITIES,
  SERVICES as SC_SERVICES,
  parseServiceCity,
} from "@/lib/localPages";
import { getCity } from "@/lib/cities";

const WA_NUMBER = "966508252134";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: "⌂" },
  { href: "/services", label: "خدماتنا", icon: "◈" },
  { href: "/offerings", label: "تقديماتنا", icon: "☕" },
  { href: "/portfolio", label: "معرض الأعمال", icon: "◻" },
  { href: "/about", label: "من نحن", icon: "✦" },
  { href: "/contact", label: "تواصل معنا", icon: "✉" },
];

/**
 * يبني رسالة واتساب سياقية حسب المسار الحالي.
 * يدعم الصفحات الثابتة + الصفحات الديناميكية:
 *   /[serviceCity]      → يذكر الخدمة + المدينة تلقائياً
 *   /locations/[city]   → يذكر المدينة تلقائياً
 * بحيث يفتح زر الواتساب العائم برسالة تخص الصفحة التي يتصفّحها العميل.
 */
function buildWhatsAppMessage(pathname: string): string {
  const staticMessages: Record<string, string> = {
    "/": "مرحباً، أود الاستفسار عن خدمات الضيافة لديكم.",
    "/services": "مرحباً، أود الاستفسار عن خدمات الضيافة لديكم.",
    "/offerings": "مرحباً، أود الاستفسار عن تقديماتكم وتوزيعاتكم الفاخرة.",
    "/portfolio": "مرحباً، رأيت أعمالكم وأود الاستفسار عن باقات الضيافة.",
    "/about": "مرحباً، تعرفت على كيف الضيافة وأود الاستفسار عن خدماتكم.",
    "/contact": "مرحباً، أود التواصل معكم للاستفسار عن خدمات الضيافة.",
  };
  if (staticMessages[pathname]) return staticMessages[pathname];

  // صفحة مدينة عامة: /locations/[city]
  const locMatch = pathname.match(/^\/locations\/([^/]+)\/?$/);
  if (locMatch) {
    const citySlug = decodeURIComponent(locMatch[1]);
    const city = getCity(citySlug);
    if (city) {
      return `مرحباً، أرغب بالاستفسار عن خدمات الضيافة في ${city.name}.`;
    }
  }

  // صفحة خدمة×مدينة: /[serviceCity]
  const segMatch = pathname.match(/^\/([^/]+)\/?$/);
  if (segMatch) {
    const parsed = parseServiceCity(decodeURIComponent(segMatch[1]));
    if (parsed) {
      const s = SC_SERVICES[parsed.service];
      const c = SC_CITIES[parsed.city];
      if (s && c) {
        return `مرحباً، أرغب بالاستفسار عن خدمة ${s.ar} في ${c.ar}.`;
      }
    }
  }

  return "مرحباً، أود الاستفسار عن خدمات الضيافة لديكم.";
}

function useWhatsAppUrl() {
  const pathname = usePathname() ?? "/";
  const msg = buildWhatsAppMessage(pathname);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export { navLinks, useWhatsAppUrl, WA_NUMBER };

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NavbarProps {
  deferredPrompt?: BeforeInstallPromptEvent | null;
  setDeferredPrompt?: (prompt: BeforeInstallPromptEvent | null) => void;
}

function NavbarContent({ deferredPrompt, setDeferredPrompt }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const pathname = usePathname() ?? "/";
  const waUrl = useWhatsAppUrl();

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setScrollDir(y > lastY ? "down" : "up");
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isActive = (href: string) => pathname === href;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    if (setDeferredPrompt) setDeferredPrompt(null);
    closeMenu();
  };

  return (
    <>
      {/* ══════════════════════ HEADER ══════════════════════ */}
      <motion.header
        initial={false}
        animate={{
          y: scrolled && scrollDir === "down" ? -80 : 0,
          backgroundColor: scrolled ? "rgba(26, 26, 26, 0.95)" : "transparent",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(197, 160, 89, 0.2)" : "none",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="الصفحة الرئيسية">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <DallahLogo size={60} />
              <motion.div
                className="absolute -inset-1 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.15) 0%, transparent 70%)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <div className="block">
              <span className="block gold-shine-text" style={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.1 }}>
                كيف الضيافة
              </span>
              <span className="block text-gold-matte/60" style={{ fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                KEIF AL-DIAFA
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="التنقل الرئيسي">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-sm transition-all duration-200 min-h-[44px] flex items-center ${
                  isActive(link.href) ? "text-gold-matte" : "text-text-primary/70 hover:text-gold-matte"
                }`}
                style={{ fontWeight: isActive(link.href) ? 700 : 400 }}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(197, 160, 89, 0.1)", border: "1px solid rgba(197, 160, 89, 0.2)" }}
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm gold-button min-h-[44px]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل الآن
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════ BOTTOM MOBILE NAV ══════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom bottom-nav" 
        style={{ 
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: "rgba(15, 15, 15, 0.96)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          borderTop: "1px solid rgba(212, 175, 55, 0.15)",
          boxShadow: "0 -4px 40px rgba(0, 0, 0, 0.6)"
        }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#25D366] min-h-[44px]" style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span style={{ fontWeight: 600 }}>واتساب</span>
            </a>
            <a href="tel:+966508252134" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gold-matte min-h-[44px]" style={{ background: "rgba(197,160,89,0.08)", border: "1px solid rgba(197,160,89,0.2)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span style={{ fontWeight: 600 }}>اتصال</span>
            </a>
          </div>
          <motion.button onClick={toggleMenu} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-luxury-black min-h-[44px]" style={{ background: "var(--gradient-gold-matte)", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 20px rgba(197,160,89,0.4)" }} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} aria-controls="mobile-nav-menu">
            <motion.span aria-hidden="true" animate={{ rotate: menuOpen ? 45 : 0 }} transition={{ duration: 0.25 }}>{menuOpen ? "✕" : "☰"}</motion.span>
            <span>القائمة</span>
          </motion.button>
        </div>
      </div>

      {/* ══════════════════════ SLIDE-UP MENU ══════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={closeMenu} />
            <motion.nav 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 28, stiffness: 280 }} 
              id="mobile-nav-menu" 
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl overflow-hidden" 
              style={{ 
                background: "linear-gradient(160deg, rgba(18, 18, 18, 0.98) 0%, rgba(12, 10, 3, 0.99) 100%)", 
                backdropFilter: "blur(30px) saturate(200%)", 
                WebkitBackdropFilter: "blur(30px) saturate(200%)", 
                borderTop: "1px solid rgba(212, 175, 55, 0.25)", 
                boxShadow: "0 -20px 80px rgba(212, 175, 55, 0.1)", 
                paddingBottom: "max(100px, calc(80px + env(safe-area-inset-bottom)))" 
              }} 
              role="navigation" 
              aria-label="القائمة الرئيسية"
            >
              <div className="max-w-lg mx-auto px-5 pt-6">
                <div className="w-10 h-1 bg-gold-matte/40 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-center gap-3 mb-6">
                  <DallahLogo size={32} />
                  <span className="gold-shine-text" style={{ fontSize: "1.1rem", fontWeight: 800 }}>كيف الضيافة</span>
                </div>
                
                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                        isActive(link.href) ? "bg-gold-matte/15 border border-gold-matte/30 text-gold-matte" : "bg-white/5 border border-white/5 text-text-primary/70"
                      }`}
                      onClick={closeMenu}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="text-xs font-bold tracking-wide">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* PWA Install Button Section - Luxury Adapted */}
                {deferredPrompt && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                    className="mt-6 pt-6 border-t border-white/5"
                  >
                    <button 
                      onClick={handleInstallClick}
                      className="group relative overflow-hidden flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl text-luxury-black transition-all duration-500 active:scale-[0.98]"
                      style={{ background: "var(--gradient-gold-matte)", fontWeight: 700 }}
                    >
                      <span className="relative z-10">تثبيت التطبيق</span>
                    </button>
                  </motion.div>
                )}

                {/* Developer credit */}
                <div className="mt-6 pt-5 border-t border-white/5 text-center">
                  <p className="text-xs text-text-primary/40" dir="ltr">
                    Developed by{" "}
                    <span className="text-gold-matte font-bold">Alabbasi Soft</span>
                  </p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={null}>
      <NavbarContent {...props} />
    </Suspense>
  );
}
