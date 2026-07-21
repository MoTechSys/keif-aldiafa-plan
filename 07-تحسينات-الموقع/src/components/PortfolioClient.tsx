"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useScroll } from "motion/react";

import ProtectedImage from "@/components/ProtectedImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  EVENT_IMAGES,
  WEDDING_IMAGES,
  EQUIPMENT_IMAGES,
} from "@/lib/images";


const ITEMS_PER_PAGE = 12;

type FilterType = "all" | "events" | "weddings" | "equipment";

interface PortfolioItem {
  id: number;
  image: string;
  category: FilterType;
}

const seoAltMapping: Record<string, string> = {
  all: "خدمات ضيافة فاخرة في السعودية - كيف الضيافة",
  events: "تجهيز ضيافة فعاليات ومؤتمرات VIP - صبابين وقهوجية مناسبات",
  weddings: "ضيافة زواجات فاخرة في السعودية - صبابات ومباشرات ضيافة نسائية",
  equipment: "تأجير معدات ضيافة ملكية - دلال نحاسية وكاونترات استقبال"
};

/**
 * Builds a UNIQUE, natural alt per image (P0 fix): combines the Arabic category
 * context with the descriptive part of the image filename, so every image gets
 * a distinct, human-readable alt instead of a repeated template. Pure (no fs) so
 * it is safe in this client component.
 */
function uniqueAlt(src: string, category: FilterType): string {
  const base = (src.split("/").pop() || "").replace(/\.[a-z0-9]+$/i, "");
  const words = base
    .split(/[-_]+/)
    .filter((w) => w && !/^\d+$/.test(w))
    .slice(0, 8);
  const descriptive = words.join(" ");
  const context = seoAltMapping[category] || seoAltMapping.all;
  return descriptive ? `${context} — ${descriptive}` : context;
}

const portfolioItems: PortfolioItem[] = [
  ...EVENT_IMAGES.map((img, i) => ({
    id: i + 1,
    image: img,
    category: "events" as FilterType,
  })),
  ...WEDDING_IMAGES.map((img, i) => ({
    id: 100 + i + 1,
    image: img,
    category: "weddings" as FilterType,
  })),
  ...EQUIPMENT_IMAGES.map((img, i) => ({
    id: 200 + i + 1,
    image: img,
    category: "equipment" as FilterType,
  })),
];

const filters: { key: FilterType; label: string; icon: string }[] = [
  { key: "all", label: "الكل", icon: "◎" },
  { key: "events", label: "الفعاليات", icon: "🎉" },
  { key: "weddings", label: "الأعراس", icon: "💍" },
  { key: "equipment", label: "المعدات", icon: "⚙️" },
];

const categoryHeadings: Record<FilterType, string> = {
  all: "جميع أعمال الضيافة: فعاليات، أعراس ومعدات فاخرة",
  events: "ضيافة فعاليات ومؤتمرات ومحافل رسمية",
  weddings: "ضيافة أعراس وزواجات فاخرة بطاقم قهوجيين وصبابات",
  equipment: "معدات ضيافة ملكية: دلال نحاسية وكاونترات استقبال",
};

// ─────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────
function Lightbox({
  items,
  initialIndex,
  onClose,
}: {
  items: PortfolioItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const dragX = useMotionValue(0);
  const bgOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);
  const item = items[index];

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= items.length) return;
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index, items.length]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
      const { velocity, offset } = info;
      if (velocity.x < -300 || offset.x < -80) {
        goTo(index + 1);
      } else if (velocity.x > 300 || offset.x > 80) {
        goTo(index - 1);
      } else {
        animate(dragX, 0, { type: "spring", stiffness: 400, damping: 40 });
      }
    },
    [goTo, index, dragX]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index - 1);
      if (e.key === "ArrowLeft") goTo(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goTo, index]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.92 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(5,4,2,0.95)", backdropFilter: "blur(24px)", opacity: bgOpacity }}
      />

      <button
        onClick={onClose}
        className="absolute top-5 left-5 z-20 w-11 h-11 rounded-full flex items-center justify-center text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors"
        style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(184,134,11,0.2)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full text-xs text-[#B8860B]"
        style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(184,134,11,0.2)" }}>
        {index + 1} / {items.length}
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center px-2 md:px-4" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={item.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x: dragX }}
            onDragEnd={handleDragEnd}
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          >
            <div className="relative w-full h-full max-w-[95vw] max-h-[85vh] md:max-w-[75vw] md:max-h-[75vh] flex items-center justify-center">
              <ProtectedImage
                src={item.image}
                alt={uniqueAlt(item.image, item.category)}
                fill={true}
                sizes="(max-width: 768px) 95vw, 75vw"
                className="object-contain shadow-2xl select-none"
                priority
                showWatermark={true}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Royal Trio Sticky Navigation Component
// ─────────────────────────────────────────────
function RoyalTrioNav({ activeFilter, onFilterChange }: { activeFilter: FilterType; onFilterChange: (key: FilterType) => void }) {
  const [isSticky, setIsSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.onChange(() => {
      if (containerRef.current) {
        const containerTop = containerRef.current.getBoundingClientRect().top;
        setIsSticky(containerTop <= 0);
      }
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Measure nav height so we can reserve space (spacer) when it goes `fixed`,
  // preventing the content below from jumping up (major CLS source).
  useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.offsetHeight);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <motion.section
        ref={navRef}
        className={`w-full ${isSticky ? 'fixed top-0 left-0 right-0 z-50' : 'relative'}`}
        style={{
          paddingTop: isSticky ? '12px' : '16px',
          paddingBottom: isSticky ? '12px' : '16px',
          background: isSticky ? 'rgba(15, 15, 15, 0.95)' : 'transparent',
          backdropFilter: isSticky ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isSticky ? 'blur(16px)' : 'none',
          borderBottom: isSticky ? '1px solid rgba(184, 134, 11, 0.15)' : '1px solid transparent',
          transition: 'background 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out, border-color 0.3s ease-in-out',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-2 sm:gap-3">
            {filters.map((filter) => (
              <motion.button
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                className="relative group flex-1 max-w-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Background with Glassmorphism */}
                <motion.div
                  className="absolute inset-0 rounded-3xl transition-all duration-300"
                  animate={{
                    background: activeFilter === filter.key
                      ? 'linear-gradient(135deg, rgba(184, 134, 11, 0.25), rgba(212, 160, 23, 0.15))'
                      : 'rgba(0, 0, 0, 0.25)',
                    border: activeFilter === filter.key
                      ? '2px solid rgba(184, 134, 11, 0.7)'
                      : '1.5px solid rgba(184, 134, 11, 0.15)',
                    boxShadow: activeFilter === filter.key
                      ? '0 0 30px rgba(184, 134, 11, 0.4), inset 0 0 20px rgba(184, 134, 11, 0.1)'
                      : 'none',
                  }}
                />

                {/* Content Container */}
                <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 h-full min-h-[65px] sm:min-h-[80px]">
                  {/* Icon with Animation */}
                  <motion.span 
                    className="text-lg sm:text-xl mb-1.5"
                    animate={{ 
                      scale: activeFilter === filter.key ? 1.2 : 1,
                      filter: activeFilter === filter.key ? 'drop-shadow(0 0 8px rgba(184, 134, 11, 0.5))' : 'grayscale(0.5) opacity(0.7)'
                    }}
                  >
                    {filter.icon}
                  </motion.span>
                  <motion.p
                    className="text-[10px] sm:text-[12px] text-center font-bold leading-tight"
                    style={{
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(184, 134, 11, 0.2)',
                    }}
                    animate={{
                      color: activeFilter === filter.key ? '#D4A017' : '#F5F5DC',
                      opacity: activeFilter === filter.key ? 1 : 0.8,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.8, delay: 0.05 }}
                  >
                    {filter.label}
                  </motion.p>
                </div>

                {/* Active Indicator Line */}
                {activeFilter === filter.key && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8860B] via-[#D4A017] to-[#B8860B]"
                    style={{ borderRadius: '2px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>
      {/* Spacer: reserves the nav height when it goes `fixed` so content below
          does not jump up (eliminates the large CLS on this page). */}
      {isSticky && navHeight > 0 && <div style={{ height: navHeight }} aria-hidden="true" />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function PortfolioClient() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredItems = activeFilter === "all"
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeFilter);

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-32">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(184,134,11,0.08) 0%, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Breadcrumbs />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#B8860B] mb-3 mt-8" style={{ fontSize: "0.75rem", letterSpacing: "0.35em" }}>✦ معرض أعمالنا ✦</motion.p>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[#F5F5DC] mb-4 font-tajawal" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, lineHeight: 1.15}}>معرض أعمالنا: مناسبات ضيافة<br /><span className="gold-gradient-text">في مدن المملكة</span></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#F5F5DC]/55 max-w-xl mx-auto text-sm leading-relaxed">توثيق للحظات الفخامة والتميز — استعرض أفضل لحظاتنا من الفعاليات والأعراس والمعدات الفاخرة التي تعكس جودة خدماتنا</motion.p>
        </div>
      </section>

      {/* Royal Trio Sticky Navigation */}
      <RoyalTrioNav activeFilter={activeFilter} onFilterChange={setActiveFilter} />


      {/* Gallery Grid - Masonry Style (Natural Aspect Ratio) */}
      <div className="container mx-auto px-4 pt-12">
        <h2 className="text-center text-[#F5F5DC]/85 mb-8 font-tajawal" style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.4rem)", fontWeight: 700 }}>{categoryHeadings[activeFilter]}</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {displayedItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedIndex(idx)}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-pointer bg-[#1a1a1a] mb-4 sm:mb-6"
            >
              <ProtectedImage
                src={item.image}
                alt={uniqueAlt(item.image, item.category)}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 img-overlay" />
              <div className="absolute inset-0 bg-[#B8860B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md border border-[#B8860B]/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadMore}
              className="px-10 py-4 rounded-full font-bold text-[#0f0f0f] transition-all duration-300 text-sm"
              style={{
                background: "linear-gradient(135deg, #FFD700, #D4A017, #B8860B)",
                boxShadow: "0 8px 30px rgba(184,134,11,0.4)",
              }}
            >
              عرض المزيد ({filteredItems.length - displayCount} متبقي)
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#F5F5DC]/40 text-lg">لا توجد صور في هذه الفئة حالياً</p>
          </div>
        )}

        {/* CTA واتساب بعد المعرض — يلتقط الزائر بعد تصفّح الأعمال (CRO) */}
        <motion.section
          dir="rtl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mt-20 sm:mt-24 text-center rounded-3xl px-6 py-12 sm:py-14 border border-[#C5A059]/20"
          style={{ background: "linear-gradient(160deg, #1a1a1a 0%, #141414 100%)" }}
        >
          <h2
            className="text-[#F5F5DC] font-tajawal mb-3"
            style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 800, lineHeight: 1.3 }}
          >
            أعجبتك أعمالنا؟ <span className="gold-gradient-text">لنصنع مناسبتك القادمة</span>
          </h2>
          <p className="text-[#F5F5DC]/65 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
            أكثر من +500 مناسبة ناجحة تشهد لنا. أخبرنا عن مناسبتك واحصل على عرض سعر مجاني ومخصّص خلال دقائق.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href={`https://wa.me/966508252134?text=${encodeURIComponent(
                "مرحباً، رأيت معرض أعمالكم وأود الاستفسار عن باقات الضيافة لمناسبتي."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #25D366, #1da851)", boxShadow: "0 8px 24px rgba(37,211,102,0.35)" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              احجز عبر واتساب
            </a>
            <a
              href="tel:+966508252134"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#C5A059]/40 text-[#C5A059] font-bold hover:bg-[#C5A059]/10 transition"
            >
              اتصل: 0508252134
            </a>
          </div>
        </motion.section>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            items={displayedItems}
            initialIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
