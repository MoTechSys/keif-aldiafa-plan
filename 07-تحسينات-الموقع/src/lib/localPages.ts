/**
 * بيانات صفحات الخدمات المحلية (خدمة × مدينة) — كيف الضيافة.
 * مصدر واحد للحقيقة لصفحات السيو المحلي (slug لاتيني يطابق البحث، محتوى عربي غني).
 * يُستهلك من: src/app/[serviceCity]/page.tsx + src/app/sitemap.ts.
 *
 * الروابط تطابق ما يبحث عنه الناس فعلاً، مثال:
 *   /sababin-qahwa-jeddah  → «صبابين قهوة جدة»
 *   /qahwajiin-riyadh      → «قهوجي / قهوجيين الرياض»
 *   /diyafa-munasabat-makkah → «ضيافة مناسبات مكة»
 */

export type LocalCity = {
  slug: string; // جزء المدينة في الـ URL (لاتيني)
  ar: string; // اسم المدينة بالعربي
  region: string; // المنطقة الإدارية
  districts: string[]; // أحياء (إشارة جغرافية للسيو المحلي)
  intro: string; // جملة سياق خاصة بالمدينة
};

export const CITIES: Record<string, LocalCity> = {
  jeddah: {
    slug: "jeddah",
    ar: "جدة",
    region: "منطقة مكة المكرمة",
    // أحياء مرتّبة حسب طلب البحث الفعلي (من بيانات الحملة): الفيحاء/المحمدية/الزهراء
    // ثم بقية الأحياء عالية الكثافة السكنية في جدة.
    districts: ["الفيحاء", "المحمدية", "الزهراء", "أبحر الشمالية", "الشاطئ", "الحمراء", "الروضة", "الصفا", "النعيم", "الخالدية", "السلامة", "النزهة"],
    intro: "نخدم عروس البحر الأحمر بكل أحيائها — من الفيحاء والمحمدية والزهراء إلى أبحر شمالاً والحمدانية — بفريق ضيافة متنقّل جاهز لأي مناسبة.",
  },
  riyadh: {
    slug: "riyadh",
    ar: "الرياض",
    region: "منطقة الرياض",
    districts: ["العليا", "الملقا", "حطين", "الياسمين", "النرجس", "الروضة", "الملز", "السفارات"],
    intro: "نغطّي العاصمة الرياض شمالاً وجنوباً وشرقاً وغرباً، بفريق فاخر لمؤتمرات وأعراس وفعاليات كبار الضيوف.",
  },
  makkah: {
    slug: "makkah",
    ar: "مكة المكرمة",
    region: "منطقة مكة المكرمة",
    districts: ["العزيزية", "الششة", "النسيم", "العوالي", "الزاهر", "الشوقية", "الرصيفة", "بطحاء قريش"],
    intro: "نقدّم ضيافة عربية أصيلة لمناسبات أهل مكة وزوّارها، بطاقم يراعي خصوصية المدينة المقدّسة.",
  },
  madinah: {
    slug: "madinah",
    ar: "المدينة المنورة",
    region: "منطقة المدينة المنورة",
    districts: ["قباء", "العوالي", "الحرة الشرقية", "شوران", "العزيزية", "الدفاع", "الملك فهد", "النصر"],
    intro: "نقدّم ضيافة تليق بمدينة رسول الله ﷺ، لأعراس وفعاليات ومؤتمرات المدينة المنورة وأحيائها.",
  },
  dammam: {
    slug: "dammam",
    ar: "الدمام",
    region: "المنطقة الشرقية",
    districts: ["الشاطئ", "الفيصلية", "النزهة", "الروضة", "أحد", "الخليج", "الجلوية", "الدواسر"],
    intro: "نغطّي الدمام والخبر والظهران بخدمة منظّمة تناسب فعاليات الشركات والمؤتمرات وأعراس المنطقة الشرقية.",
  },
  taif: {
    slug: "taif",
    ar: "الطائف",
    region: "منطقة مكة المكرمة",
    districts: ["الحوية", "الشفا", "الهدا", "قروى", "الوسام", "معشي", "السلامة", "شهار"],
    intro: "نخدم مدينة الورد الطائف لمناسباتها العائلية والفعاليات الموسمية، خصوصاً في موسم الصيف.",
  },
  abha: {
    slug: "abha",
    ar: "أبها",
    region: "منطقة عسير",
    districts: ["المفتاحة", "النصب", "الموظفين", "الوردتين", "السد", "المنسك", "شمسان", "الخشع"],
    intro: "نغطّي أبها وعسير لفعاليات الصيف والمهرجانات والمناسبات العائلية في أجواء المنطقة الجبلية.",
  },
  yanbu: {
    slug: "yanbu",
    ar: "ينبع",
    region: "منطقة المدينة المنورة",
    districts: ["ينبع البحر", "ينبع الصناعية", "الهيئة الملكية", "النواة", "الصبيب", "شربا", "ينبع النخل", "الفيصلية"],
    intro: "نغطّي ينبع البحر وينبع الصناعية والهيئة الملكية بخدمة ضيافة حاضرة بسرعة وكفاءة.",
  },
};

export type ServiceKind = {
  slug: string; // جزء الخدمة في الـ URL (لاتيني)
  ar: string; // اسم الخدمة بالعربي (يظهر في العناوين)
  short: string; // وصف قصير
  /** كلمات مرادفة يبحث بها الناس — تُستخدم في الميتا/المحتوى دون حشو */
  synonyms: string[];
  /** أي أنواع صور من imageCatalog تناسب هذه الخدمة */
  imageCategories: string[];
};

export const SERVICES: Record<string, ServiceKind> = {
  "sababin-qahwa": {
    slug: "sababin-qahwa",
    ar: "صبابين قهوة",
    short: "صبّابون وقهوجيون بزيّ سعودي تراثي لتقديم القهوة العربية",
    synonyms: ["صبابين قهوة", "صبابين سعوديين", "قهوجي", "قهوجيين", "مباشرين قهوة", "صبابات قهوة"],
    imageCategories: ["services", "events", "distributions"],
  },
  qahwajiin: {
    slug: "qahwajiin",
    ar: "قهوجيين ومباشرين",
    short: "قهوجيون ومباشرون محترفون بزيّ رسمي لخدمة كبار الضيوف",
    synonyms: ["قهوجي", "قهوجيين", "مباشرين قهوة", "مباشرين", "صبابين سعوديين"],
    imageCategories: ["services", "events"],
  },
  "diyafa-munasabat": {
    slug: "diyafa-munasabat",
    ar: "ضيافة مناسبات",
    short: "تجهيز ضيافة متكاملة للأعراس والمؤتمرات والفعاليات",
    synonyms: ["ضيافة مناسبات", "ضيافة أعراس", "ضيافة مؤتمرات", "ضيافة حفلات", "تجهيز ضيافة"],
    imageCategories: ["events", "weddings", "distributions"],
  },
};

/** كل صفحات (خدمة × مدينة) المفعّلة — تُستخدم في sitemap + generateStaticParams */
export const LOCAL_PAGES: { service: string; city: string }[] = Object.keys(
  SERVICES
).flatMap((service) => Object.keys(CITIES).map((city) => ({ service, city })));

export function localSlug(service: string, city: string): string {
  return `${service}-${CITIES[city].slug}`;
}

/** حلّ slug الرابط إلى (service, city) — يُعيد null لو غير معروف */
export function parseServiceCity(
  slug: string
): { service: string; city: string } | null {
  const entry = LOCAL_PAGES.find((p) => localSlug(p.service, p.city) === slug);
  return entry ? { service: entry.service, city: entry.city } : null;
}
