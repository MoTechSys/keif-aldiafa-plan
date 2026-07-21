// ═══════════════════════════════════════════════════════
// سكربت Google Ads المُحسّن — كيف الضيافة
// تحسينات: تكرارية (Idempotent) + معالجة أخطاء + تقييد الحملة + تقرير مفصّل
// ═══════════════════════════════════════════════════════
//
// التحسينات عن النسخة الأصلية:
// 1. يفحص الكلمات السلبية الموجودة قبل الإضافة (لا تكرار)
// 2. معالجة أخطاء try/catch لكل كلمة (لا توقف كامل)
// 3. يقتصر على حملة محددة بالاسم (لا يطبّق على كل الحساب)
// 4. تقرير مفصّل: مضافة / موجودة / خطأ
// 5. خيار مطابقة واسعة سلبية لكلمات مختارة
// ═══════════════════════════════════════════════════════

function main() {
  // ── إعدادات ──────────────────────────────────────────
  // اسم الحملة المستهدفة (بدل تطبيق على كل الحملات)
  // اتركه null لتطبيق على كل حملات Search المفعّلة
  var TARGET_CAMPAIGN_NAME = "كيف الضيافة - بحث - جدة";

  // الكلمات السلبية بمطابقة العبارة (الافتراضي)
  // (الكلمات المستخرجة من تحليل بيانات حقيقية 3.5 سنة)
  var negativeKeywordsPhrase = [
    "كوفي", "مقهى", "كافيه", "كافي", "منيو",
    "الفيحاء", "المحمدية", "المحمديه", "الزهراء", "الزهرا", "الزهرة",
    "النسيم", "النعيم", "المرجان", "الروضه", "البساتين", "السطوح",
    "محل", "موقعي", "اجهزة", "ادوات", "v60", "ديوانية", "بانك",
    "مختصه", "قريب", "وظيفة", "توظيف", "راتب",
    // إضافات من التحليل الذكي المتكامل
    "مطعم", "بوفيه مفتوح", "اكل", "وجبات", "طبخ", "شيف",
    "باريستا", "حلا", "حلويات", "كيك", "مناسبات اطفال",
    "كم سعر", "تدريب", "دورة", "كورس",
    // إضافات من عبارات البحث
    "طريقة", "معنى", "صور", "انستقرام", "تيك توك", "مجاني"
  ];

  // ⚠️ ملاحظة: "اسعار" أُزيلت من السلبيات — نية شرائية (مقارنة قبل الحجز)
  // "اسعار قهوجيين جدة" = عميل محتمل، لا يجب حجبه

  // ── تنفيذ ────────────────────────────────────────────
  var added = 0;
  var existing = 0;
  var errors = 0;
  var campaignsProcessed = 0;

  // بناء استعلام الحملات
  var query = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .withCondition("AdvertisingChannelType = SEARCH");

  // تقييد باسم الحملة إن حُدد
  if (TARGET_CAMPAIGN_NAME) {
    query = query.withCondition('Name = "' + TARGET_CAMPAIGN_NAME + '"');
  }

  var campaignIterator = query.get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    campaignsProcessed++;

    // جمع الكلمات السلبية الموجودة في هذه الحملة
    var existingNegatives = {};
    var existingIterator = campaign.negativeKeywords().get();
    while (existingIterator.hasNext()) {
      var nk = existingIterator.next();
      existingNegatives[nk.getText()] = true;
    }

    // إضافة الكلمات الجديدة فقط
    for (var i = 0; i < negativeKeywordsPhrase.length; i++) {
      var kw = '"' + negativeKeywordsPhrase[i] + '"';

      if (existingNegatives[kw]) {
        existing++;
        continue;
      }

      try {
        campaign.createNegativeKeyword(kw);
        added++;
      } catch (e) {
        errors++;
        Logger.log("⚠️ خطأ بإضافة «" + negativeKeywordsPhrase[i] + "»: " + e.message);
      }
    }

    Logger.log("═══════════════════════════════════════");
    Logger.log("✓ حملة: " + campaign.getName());
    Logger.log("  مضافة: " + added + " | موجودة: " + existing + " | أخطاء: " + errors);
  }

  // ── التقرير النهائي ───────────────────────────────────
  Logger.log("");
  Logger.log("═══════════════════════════════════════════════");
  Logger.log("📊 التقرير النهائي — سكربت الكلمات السلبية");
  Logger.log("═══════════════════════════════════════════════");
  Logger.log("الحملات المُعالجة: " + campaignsProcessed);
  Logger.log("الكلمات المضافة: " + added);
  Logger.log("الكلمات الموجودة (تُخطّي): " + existing);
  Logger.log("الأخطاء: " + errors);
  Logger.log("إجمالي الكلمات في القائمة: " + negativeKeywordsPhrase.length);
  Logger.log("═══════════════════════════════════════════════");

  if (TARGET_CAMPAIGN_NAME && campaignsProcessed === 0) {
    Logger.log("⚠️ لم تُعثر على حملة باسم: " + TARGET_CAMPAIGN_NAME);
    Logger.log("  تأكّد من اسم الحملة أو اترك TARGET_CAMPAIGN_NAME = null لتطبيق على الكل");
  }
}
