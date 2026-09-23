import { SiteLanguageSwitcher } from "@/components/SiteLanguageSwitcher";
import { Brand } from "@/components/Brand";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="demo-page">
      <div className="shell demo-topbar">
        <Link href="/ar"><Brand /></Link>
        <div className="demo-top-actions">
          <SiteLanguageSwitcher locale="ar" path="/demo" />
          <Link href="/ar" className="text-link">{"العودة إلى الموقع"}</Link>
        </div>
      </div>
      <div className="shell demo-grid">
        <section>
          <div className="eyebrow">{"طلب عرض تجريبي"}</div>
          <h1>{"اكتشف COSTERA مع سير عمل مطعمك."}</h1>
          <p>
            {"أخبرنا كيف تدير نقاط البيع والمخزون والوصفات حاليًا لنقدم لك الإعداد الأنسب."}</p>
          <div className="demo-points">
            <span>{"✓ متابعة التكلفة والفروق"}</span>
            <span>{"✓ مراجعة تكامل نقاط البيع والمخزون"}</span>
            <span>{"✓ مناقشة إعداد الفروع والوصفات"}</span>
          </div>
        </section>
        <form className="demo-form">
          <label>{"الاسم الكامل"}<input placeholder="اسمك" /></label>
          <label>{"بريد العمل"}<input type="email" placeholder="name@restaurant.com" /></label>
          <label>{"المطعم / المجموعة"}<input placeholder="اسم المطعم" /></label>
          <label>{"عدد الفروع"}<select defaultValue="1"><option>1</option><option>2-3</option><option>4-10</option><option>10+</option></select></label>
          <label>{"نظام نقاط البيع الحالي"}<input placeholder="مزود نقاط البيع، إن كان معروفًا" /></label>
          <button className="button button-gold full-button" type="button">{"طلب عرض تجريبي"}</button>
          <small>{"نموذج طلب العرض التجريبي في وضع المعاينة خلال هذا النشر الاختباري."}</small>
        </form>
      </div>
    </main>
  );
}
