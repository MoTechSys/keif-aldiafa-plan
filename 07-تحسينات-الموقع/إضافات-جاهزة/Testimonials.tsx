"use client";

import { motion } from "motion/react";

/**
 * قسم شهادات العملاء — إثبات اجتماعي (توصية تقرير التحليل).
 * ⚠️ الشهادات هنا هيكل جاهز — يجب استبدالها بشهادات حقيقية من العملاء فقط.
 * لا تُختلق شهادات وهمية (مخالفة ثقة + قد تُكتشف).
 *
 * املأ المصفوفة من شهادات واتساب/إنستغرام الفعلية (باسم العميل + المدينة + نوع المناسبة).
 * يمكن ربطها لاحقاً بمصدر بيانات (CMS/Sheet) بدل الثابت.
 */

type Testimonial = {
  name: string;
  city: string;
  occasion: string;
  text: string;
  rating?: number; // 1-5 (اختياري — لا تضع تقييمات مجمّعة في schema بدون نظام تقييم حقيقي)
};

// TODO: استبدل بشهادات حقيقية من العملاء (من واتساب/إنستغرام بإذنهم)
const testimonials: Testimonial[] = [
  // مثال للبنية (احذفه واملأ الحقيقي):
  // { name: "أبو محمد", city: "جدة", occasion: "حفل زفاف", text: "خدمة راقية والتزام بالموعد..." },
];

export default function Testimonials() {
  if (testimonials.length === 0) return null; // لا يظهر القسم حتى تُضاف شهادات حقيقية

  return (
    <section className="px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-10"
        >
          <p className="text-[#B8860B] mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.35em" }}>
            ✦ آراء عملائنا ✦
          </p>
          <h2 className="text-[#F5F5DC]" style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800 }}>
            ماذا قال من وثقوا بنا
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08 }}
              className="card-luxury p-6 rounded-2xl"
              style={{
                background: "linear-gradient(160deg, rgba(25,20,8,0.85), rgba(15,12,5,0.92))",
                border: "1px solid rgba(184,134,11,0.2)",
              }}
            >
              <div className="text-[#B8860B] text-3xl mb-2" aria-hidden>❝</div>
              <p className="text-[#F5F5DC]/80 text-sm leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F5F5DC] text-sm" style={{ fontWeight: 700 }}>{t.name}</p>
                  <p className="text-[#F5F5DC]/45 text-xs">{t.occasion} · {t.city}</p>
                </div>
                {t.rating && (
                  <div className="text-[#D4A017] text-sm" aria-label={`تقييم ${t.rating} من 5`}>
                    {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
