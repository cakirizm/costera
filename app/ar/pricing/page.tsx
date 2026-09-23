import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const plans = [
  {
    name: "البداية",
    price: "$99",
    note: "للمطاعم المستقلة التي تبدأ بتنظيم مراقبة التكاليف.",
    features: ["فرع واحد", "حتى ٥ مستخدمين", "تكامل نقاط البيع", "محرك الوصفات والتكاليف", "فروق المخزون", "التقارير الأساسية", "واجهة متوافقة مع جميع الأجهزة", "دعم عبر البريد الإلكتروني"],
  },
  {
    name: "النمو",
    price: "$249",
    note: "لمجموعات المطاعم المتنامية التي تحتاج إلى متابعة كل فرع.",
    popular: true,
    features: ["حتى ٣ فروع", "حتى ٢٥ مستخدمًا", "تكامل نقاط البيع عبر الفروع", "محرك الوصفات والتكاليف", "فروق المخزون", "تحليلات التوصيل", "تقارير متقدمة", "أولوية الدعم"],
  },
  {
    name: "المؤسسات",
    price: "حسب الطلب",
    note: "للمجموعات الكبيرة ذات متطلبات البيانات والتكامل والتحكم الخاصة.",
    features: ["فروع غير محدودة", "هيكل مستخدمين مخصص", "تكاملات متقدمة", "محرك تكاليف متقدم", "تحليل مفصل للمخزون والهدر", "تقارير مؤشرات أداء مخصصة", "تنفيذ مخصص", "دعم نجاح العملاء"],
  },
];

const faq = [
  ["ما الخطة المناسبة لمطعمي؟", "خطة البداية لفرع واحد، والنمو للفرق متعددة الفروع، والمؤسسات للمجموعات الكبيرة ومتطلبات التكامل الخاصة."],
  ["كم يستغرق الإعداد؟", "تعتمد مدة الإعداد على بيانات نقاط البيع والمخزون والوصفات. يبدأ COSTERA بفحص التوافق ثم التحقق من البيانات قبل التشغيل."],
  ["هل يوجد التزام طويل الأجل؟", "يمكن تكييف الشروط التجارية حسب الخطة ونطاق التنفيذ. يُعتمد الاتفاق النهائي قبل بدء الإعداد."],
  ["هل تتغير الأسعار بحسب تعقيد التكامل؟", "نعم. الموصلات الجاهزة أسهل في التنفيذ، وقد تُسعر تكاملات نقاط البيع أو ERP أو الربط المحلي المخصصة بشكل منفصل."],
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader locale="ar" path="/pricing" />
      <main>
        <section className="pricing-visual-hero">
          <div className="pricing-hero-photo" />
          <div className="shell pricing-visual-grid">
            <div>
              <div className="eyebrow">{"خطط لمطاعم أكثر ربحية"}</div>
              <h1>{"اختر الخطة المناسبة لعملياتك."}</h1>
              <p>
                {"ابدأ بمستوى التحكم الذي تحتاجه اليوم وتوسع مع نمو مطاعمك. قد تختلف الأسعار النهائية حسب متطلبات التكامل."}</p>
              <div className="trust-row"><span>{"دون تعقيد غير ضروري"}</span><span>{"إعداد منظم"}</span><span>{"نطاق تنفيذ واضح"}</span></div>
            </div>
            <div className="pricing-hero-quote">
              <strong>{"بيانات أفضل."}</strong>
              <strong>{"قرارات أفضل."}</strong>
              <strong>{"هوامش ربح أقوى."}</strong>
            </div>
          </div>
        </section>

        <section className="pricing-plans-section">
          <div className="shell pricing-grid reference-pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
                {plan.popular && <div className="popular-label">{"الأكثر اختيارًا"}</div>}
                <h2>{plan.name}</h2>
                <p>{plan.note}</p>
                <div className="price">{plan.price}{plan.price.startsWith("$") && <span>{"/ شهريًا"}</span>}</div>
                <Link className={`button ${plan.popular ? "button-gold" : "button-outline"} full-button`} href="/ar/demo">
                  {plan.name === "المؤسسات" ? "تواصل مع المبيعات" : "طلب عرض تجريبي"} <span>←</span>
                </Link>
                <ul className="plan-list">{plan.features.map((item) => <li key={item}>✓ {item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section pricing-faq-section">
          <div className="shell pricing-faq-grid">
            <div>
              <div className="eyebrow">{"الأسئلة الشائعة"}</div>
              <h2>{"إجابات واضحة قبل البدء."}</h2>
              <p>{"التسعير جزء من التنفيذ. تُراجع جاهزية التكامل وجودة البيانات قبل التشغيل."}</p>
              <Link className="button button-outline" href="/ar/demo">{"تواصل معنا"}<span>←</span></Link>
            </div>
            <div className="faq-list">
              {faq.map(([q,a]) => (
                <details key={q}>
                  <summary>{q}<span>+</span></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <aside className="pricing-help-card">
              <span className="pricing-help-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span>
              <h3>{"لم تقرر بعد؟"}</h3>
              <p>{"يمكننا مراجعة نظام نقاط البيع والمخزون وهيكل الفروع قبل اختيار الخطة."}</p>
              <Link className="button button-outline full-button" href="/ar/demo">{"اطلب مراجعة مجانية"}<span>←</span></Link>
            </aside>
          </div>
        </section>

        <section className="pricing-bottom-banner">
          <div className="shell">
            <div>
              <div className="eyebrow eyebrow-light">{"ابدأ بالإعداد المناسب"}</div>
              <h2>{"فاقد أقل. تحكم أكبر."}</h2>
              <p>{"تعرف على ملاءمة COSTERA لعملك قبل اعتماد التنفيذ."}</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/ar/demo">{"طلب عرض تجريبي"}</Link>
              <Link className="button button-ghost" href="/ar/how-it-works">{"كيف يعمل"}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="ar" />
    </>
  );
}
