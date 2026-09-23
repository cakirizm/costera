import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const cards = [
  ["مراقبة المخزون", "تابع حالة المخزون وتكلفة الوحدة وفروق الكميات غير المفسرة.", "inventory"],
  ["الوصفات وتكلفة الطعام", "أعد حساب تكلفة الوصفة عند تغير أسعار الشراء وقارنها بالتكلفة المستهدفة.", "recipe"],
  ["المشتريات", "تابع تغير تكاليف الموردين وحدد أصناف القائمة المتأثرة.", "purchase"],
  ["تحليل قنوات التوصيل", "قارن المبيعات المباشرة وربحية قنوات التوصيل في لوحة واحدة.", "delivery"],
  ["الاستهلاك النظري مقابل الفعلي", "قارن الاستهلاك المتوقع حسب الوصفات بحركة المخزون الفعلية.", "variance"],
  ["لوحة الإدارة عبر الجوال", "راجع المؤشرات المهمة من الكمبيوتر أو الجهاز اللوحي أو الجوال.", "mobile"],
  ["التنبيهات ومراقبة الاستثناءات", "اكتشف الاستهلاك غير المعتاد وتجاوز المستهدفات والوصفات المفقودة ومشكلات التكامل.", "alerts"],
];

function FeatureVisual({ type }: { type: string }) {
  if (type === "inventory") return <div className="feature-mini-table"><span>{"لحم بقري"}<b>{"12.5 كغ"}</b><em>$230</em></span><span>{"موزاريلا"}<b>{"8.0 كغ"}</b><em>$49.60</em></span><span>{"طماطم"}<b>{"4.0 كغ"}</b><em>$8.40</em></span></div>;
  if (type === "recipe") return <div className="feature-recipe"><div>◎</div><section><b>{"باستا بالكمأة"}</b><span>{"تكلفة الوصفة $4.21"}</span><span>{"المستهدف 28.0%"}</span><em>{"الفعلي 34.5%"}</em></section></div>;
  if (type === "purchase") return <div className="feature-purchases"><span>Metro <b>$1,240</b></span><span>Bidfood <b>$980</b></span><span>Fresh Supply <b>$640</b></span></div>;
  if (type === "delivery") return <div className="feature-channel"><span>{"داخل المطعم"}<b>22.4%</b></span><span>{"التوصيل"}<b>12.1%</b></span><span>{"طلبات خارجية"}<b>18.7%</b></span></div>;
  if (type === "variance") return <div className="feature-variance"><span>{"دجاج"}<b>50.0</b><em>62.8</em><i>+25.6%</i></span><span>{"زيت زيتون"}<b>18.0</b><em>21.4</em><i>+18.9%</i></span><span>{"موزاريلا"}<b>20.0</b><em>18.2</em><u>-9.0%</u></span></div>;
  if (type === "mobile") return <div className="feature-phone"><small>{"اليوم"}</small><strong>$6,240</strong><span>{"تكلفة الطعام 28.9%"}</span><b>{"صافي الهامش 17.5%"}</b></div>;
  return <div className="feature-alerts"><span>{"استهلاك الدجاج أعلى من المتوقع بنسبة 25.6%."}</span><span>{"تكلفة الباستا بالكمأة تتجاوز المستهدف."}</span><span>{"مخزون الموزاريلا يقترب من الحد الأدنى."}</span></div>;
}

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader locale="ar" path="/features" />
      <main>
        <section className="feature-hero">
          <div className="feature-hero-photo" />
          <div className="shell feature-hero-grid">
            <div>
              <div className="eyebrow">{"عمليات مطعمك بالكامل في شاشة واحدة"}</div>
              <h1>{"المطاعم الرابحة تُدار بالبيانات."}</h1>
              <p>
                {"يوضح COSTERA تغير التكاليف في المخزون والوصفات والمشتريات والمبيعات والتوصيل لتتحرك الإدارة قبل تراجع الأرباح."}</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/ar/demo">{"طلب عرض تجريبي"}<span>←</span></Link>
                <Link className="button button-outline" href="/ar/how-it-works">{"اكتشف كيف يعمل"}</Link>
              </div>
              <div className="trust-row"><span>{"رؤية لحظية"}</span><span>{"تحكم سهل"}</span><span>{"مصمم للمطاعم"}</span></div>
            </div>
            <div className="feature-hero-dashboard"><DashboardMock locale="ar" /></div>
          </div>
        </section>

        <section className="section feature-section">
          <div className="shell feature-section-heading">
            <div>
              <div className="eyebrow">{"ما الذي يراقبه COSTERA"}</div>
              <h2>{"تابع العمليات المؤثرة في هوامش ربحك."}</h2>
            </div>
            <p>
              {"يربط COSTERA مؤشرات تكلفة الطعام وفروق المخزون وربحية القنوات في لوحة إدارية متسقة."}</p>
          </div>

          <div className="shell feature-showcase-grid">
            {cards.map(([title, copy, type], index) => (
              <article className={`feature-showcase-card ${index === 4 || index === 6 ? "feature-wide" : ""}`} key={title}>
                <div className="feature-card-heading">
                  <span className="feature-card-icon">{String(index + 1).padStart(2,"0")}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </div>
                <FeatureVisual type={type} />
              </article>
            ))}
          </div>
        </section>

        <section className="proof-strip">
          <div className="shell proof-strip-inner">
            <div className="proof-quote">
              <div className="proof-mark">”</div>
              <p>
                {"القيمة في معرفة اتجاه التكاليف قبل نهاية الشهر، وليس في إضافة تقرير آخر."}</p>
              <small>{"المبدأ وراء COSTERA"}</small>
            </div>
            <div className="proof-stat"><strong>↓</strong><b>{"مراقبة أوضح للمخزون"}</b><span>{"عبر جميع الفروع المتصلة"}</span></div>
            <div className="proof-stat"><strong>24/7</strong><b>{"رؤية شاملة للإدارة"}</b><span>{"الكمبيوتر والجهاز اللوحي والجوال"}</span></div>
            <div className="proof-stat"><strong>1</strong><b>{"رؤية تشغيلية"}</b><span>{"المخزون والوصفات والمبيعات والتوصيل"}</span></div>
          </div>
        </section>

        <section className="feature-bottom-cta">
          <div className="shell feature-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">{"تحكم أفضل في عملياتك"}</div>
              <h2>{"حول بيانات المطعم إلى إدارة أسهل."}</h2>
              <p>{"ابدأ ببياناتك الحالية وتوسع تدريجيًا."}</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/ar/demo">{"طلب عرض تجريبي"}</Link>
              <Link className="button button-ghost" href="/ar/pricing">{"عرض الأسعار"}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="ar" />
    </>
  );
}
