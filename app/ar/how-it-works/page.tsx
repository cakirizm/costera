import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { HowProcess } from "@/components/HowProcess";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const benefits = [
  ["توفير الوقت", "قلل تجميع البيانات يدويًا والعمل على جداول البيانات."],
  ["تقليل الفاقد", "اكتشف الاستهلاك غير المعتاد قبل أن يصبح نمطًا متكررًا."],
  ["عمليات أوضح", "اجمع المخزون والوصفات والمبيعات في رؤية موحدة."],
  ["قرارات أسرع", "شاهد المشكلة وأثرها المالي دون البحث المطول في التقارير."],
  ["هوامش ربح أقوى", "احمِ الربحية برؤية أوضح للتكاليف."],
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader locale="ar" path="/how-it-works" />
      <main>
        <section className="inner-hero visual-hero">
          <div className="inner-hero-photo" />
          <div className="shell visual-hero-grid">
            <div className="inner-hero-copy">
              <div className="eyebrow">{"تكامل بسيط. نتائج أفضل."}</div>
              <h1>{"كيف يضبط COSTERA تكاليف المطعم."}</h1>
              <p>
                {"تستمر أنظمتك في العمل كالمعتاد. يجمع COSTERA البيانات ويتحقق منها ويحول الفروق إلى رؤية إدارية واضحة."}</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/ar/demo">{"طلب عرض تجريبي"}<span>←</span></Link>
                <Link className="button button-outline" href="/ar/features">{"استكشف المزايا"}</Link>
              </div>
            </div>
            <div className="inner-dashboard"><DashboardMock locale="ar" /></div>
          </div>
        </section>

        <section className="section">
          <div className="shell how-title-row">
            <div>
              <div className="eyebrow">{"٦ خطوات لمراقبة أوضح للتكاليف"}</div>
              <h2>{"من بيانات نقاط البيع إلى نتائج جاهزة للإدارة."}</h2>
            </div>
            <p>{"إعداد سريع. بيانات فعلية. استثناءات واضحة."}</p>
          </div>
          <div className="shell"><HowProcess locale="ar" /></div>
        </section>

        <section className="section soft-section">
          <div className="shell benefits-feature-row">
            <div className="benefits-heading">
              <div className="eyebrow">{"أكثر من مجرد تحليل"}</div>
              <h2>{"قيمة عملية للتشغيل اليومي."}</h2>
            </div>
            {benefits.map(([title, text]) => (
              <div className="benefit-feature" key={title}>
                <span>✓</span><strong>{title}</strong><p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="how-bottom-cta">
          <div className="how-bottom-photo" />
          <div className="shell how-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">{"ابدأ اليوم"}</div>
              <h2>{"رؤية أوضح في المطبخ."}<br/><span>{"تحكم أكبر في العمل."}</span></h2>
            </div>
            <div>
              <p>{"اربط فرعًا واحدًا وتحقق من البيانات ثم توسع بثقة."}</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/ar/demo">{"طلب عرض تجريبي"}</Link>
                <Link className="button button-ghost" href="/ar/pricing">{"عرض الأسعار"}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="ar" />
    </>
  );
}
