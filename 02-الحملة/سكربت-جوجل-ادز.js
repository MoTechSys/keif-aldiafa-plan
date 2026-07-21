// ═══════════════════════════════════════════════════════
// سكربت Google Ads — كيف الضيافة
// يضيف الكلمات السلبية (المستخرجة من دراسة 3.5 سنة) لكل حملات البحث
// + يطبع تقرير أداء موجز في السجل
// ═══════════════════════════════════════════════════════

function main() {
  // الكلمات السلبية المستخرجة من تحليل البيانات الحقيقية
  var negativeKeywords = [
    "كوفي", "مقهى", "كافيه", "كافي", "منيو",
    "الفيحاء", "المحمدية", "المحمديه", "الزهراء", "الزهرا", "الزهرة",
    "النسيم", "النعيم", "المرجان", "الروضه", "البساتين", "السطوح",
    "محل", "موقعي", "اجهزة", "ادوات", "v60", "ديوانية", "بانك",
    "مختصه", "قريب", "اسعار", "وظيفة", "توظيف", "راتب"
  ];

  var campaignIterator = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .get();

  var count = 0;
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    for (var i = 0; i < negativeKeywords.length; i++) {
      // إضافة ككلمة سلبية بمطابقة العبارة
      campaign.createNegativeKeyword('"' + negativeKeywords[i] + '"');
    }
    count++;
    Logger.log("✓ أُضيفت " + negativeKeywords.length + " كلمة سلبية لحملة: " + campaign.getName());
  }
  Logger.log("═══ اكتمل: " + count + " حملة مُعالجة ═══");
}
