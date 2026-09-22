"use client";

import { useMemo, useState } from "react";
import {
  buildCosteraInput,
  inferMapping,
  parseDelimited,
  schemas,
  type Mapping,
  type ParsedTable,
  type SourceKind,
} from "@/lib/costera/ingestion";
import type { CosteraAnalysis } from "@/lib/costera/types";
import type { AppLocale } from "@/lib/costera/i18n";

type SourceState = {
  fileName: string;
  table: ParsedTable | null;
  mapping: Mapping;
  error: string;
};

const blankSource = (): SourceState => ({
  fileName: "",
  table: null,
  mapping: {},
  error: "",
});

const demoCsv: Record<SourceKind, string> = {
  pos: [
    "Order ID,Product Name,Qty,Net Sales,Channel,Branch",
    "1001,Classic Burger,728,13104,Dine-in,Downtown",
    "1002,Chicken Caesar,1188,19008,Talabat,Downtown",
    "1003,Margherita Pizza,608,9120,Deliveroo,Marina",
    "1004,Classic Burger,640,11520,Careem,Jumeirah",
    "1005,Margherita Pizza,500,7500,Dine-in,Jumeirah",
  ].join("\n"),
  recipes: [
    "Menu Item,Ingredient,Recipe Qty,Unit,Unit Cost,Selling Price",
    "Classic Burger,Minced Beef,180,g,33,18",
    "Classic Burger,Tomatoes,40,g,2.1,18",
    "Chicken Caesar,Chicken Breast,160,g,16,16",
    "Chicken Caesar,Olive Oil,12,ml,13,16",
    "Margherita Pizza,Mozzarella,120,g,13,15",
    "Margherita Pizza,Tomatoes,80,g,2.1,15",
    "Margherita Pizza,Olive Oil,10,ml,13,15",
  ].join("\n"),
  inventory: [
    "Ingredient,Opening Stock,Purchases,Transfer In,Transfer Out,Closing Stock,Waste,Unit Cost,Unit",
    "Minced Beef,210,160,0,0,55.76,13,33,kg",
    "Chicken Breast,250,180,0,0,193.92,11,16,kg",
    "Olive Oil,52,45,0,0,54.664,2,13,L",
    "Mozzarella,88,80,0,0,15.04,3,13,kg",
    "Tomatoes,110,120,0,0,72.64,5,2.1,kg",
  ].join("\n"),
};

function matrixToTable(matrix: unknown[][]): ParsedTable {
  const clean = matrix.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  const first = clean.shift() || [];
  const headers = first.map((cell, index) => String(cell ?? "").trim() || "Column " + (index + 1));

  return {
    headers,
    delimiter: "excel",
    rows: clean.map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, String(values[index] ?? "").trim()])),
    ),
  };
}

async function readFile(file: File): Promise<ParsedTable> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];

    if (!firstSheet) throw new Error("Excel file has no worksheet.");

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[firstSheet], {
      header: 1,
      raw: false,
      defval: "",
    });

    return matrixToTable(matrix);
  }

  return parseDelimited(await file.text());
}

function SourceCard({
  kind,
  source,
  onFile,
  onMapping,
  onDemo,
  locale,
}: {
  kind: SourceKind;
  source: SourceState;
  onFile: (file: File) => void;
  onMapping: (field: string, header: string) => void;
  onDemo: () => void;
  locale: AppLocale;
}) {
  const tr = locale === "tr";
  const t = (en: string, turkish: string) => tr ? turkish : en;
  const sourceLabel = kind === "pos" ? t("POS / Sales","POS / Satış") : kind === "recipes" ? t("Recipes / BOM","Reçeteler / BOM") : t("Inventory / Purchases","Stok / Satın Alma");
  const schema = schemas[kind];
  const required = new Set<string>(schema.required);
  const missing = schema.required.filter((field) => !source.mapping[field]);

  return (
    <article className={"import-source-card " + (source.table ? "ready" : "")}>
      <div className="import-source-head">
        <div className="import-source-number">
          {kind === "pos" ? "01" : kind === "recipes" ? "02" : "03"}
        </div>
        <div>
          <span>{source.table ? t("DATA LOADED","VERİ YÜKLENDİ") : t("REQUIRED SOURCE","GEREKLİ KAYNAK")}</span>
          <h3>{sourceLabel}</h3>
        </div>
        <b className={source.table && missing.length === 0 ? "ok" : ""}>
          {source.table ? (missing.length ? missing.length + " " + t("mapping missing","eşleştirme eksik") : t("Ready","Hazır")) : t("Waiting","Bekliyor")}
        </b>
      </div>

      <label className="import-dropzone">
        <input
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        <i>{kind === "pos" ? "▤" : kind === "recipes" ? "≋" : "▣"}</i>
        <strong>{source.fileName || t("Choose CSV or Excel file","CSV veya Excel dosyası seç")}</strong>
        <span>{source.table ? source.table.rows.length + " " + t("data rows detected","veri satırı bulundu") : "CSV, TXT, XLSX or XLS"}</span>
      </label>

      <button type="button" className="import-demo-button" onClick={onDemo}>
        {t("Load demo file","Demo dosyasını yükle")}
      </button>

      {source.error && <div className="import-error">{source.error}</div>}

      {source.table && (
        <>
          <div className="import-detected">
            <span>{source.table.headers.length} {t("columns","kolon")}</span>
            <span>{source.table.rows.length} {t("rows","satır")}</span>
            <span>{source.table.delimiter === "excel" ? "Excel" : t("CSV detected","CSV algılandı")}</span>
          </div>

          <div className="import-mapping">
            <div className="import-mapping-title">
              <strong>{t("Column mapping","Kolon eşleştirme")}</strong>
              <span>{t("Auto-detected · change anything that is wrong","Otomatik algılandı · yanlış olanı değiştir")}</span>
            </div>

            {schema.fields.map(([field, label]) => (
              <label key={field}>
                <span>
                  {label}
                  {required.has(field) && <b>*</b>}
                </span>
                <select
                  value={source.mapping[field] || ""}
                  onChange={(event) => onMapping(field, event.target.value)}
                >
                  <option value="">{t("Not mapped","Eşleşmedi")}</option>
                  {source.table?.headers.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="import-preview">
            <strong>{t("Preview","Önizleme")}</strong>
            <div>
              {source.table.headers.slice(0, 4).map((header) => <span key={header}>{header}</span>)}
            </div>
            {source.table.rows.slice(0, 2).map((row, index) => (
              <div key={index}>
                {source.table!.headers.slice(0, 4).map((header) => <span key={header}>{row[header]}</span>)}
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

export function DataImporter({ locale = "en" }: { locale?: AppLocale }) {
  const tr = locale === "tr";
  const t = (en: string, turkish: string) => tr ? turkish : en;
  const [sources, setSources] = useState<Record<SourceKind, SourceState>>({
    pos: blankSource(),
    recipes: blankSource(),
    inventory: blankSource(),
  });
  const [target, setTarget] = useState("25");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CosteraAnalysis | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [runError, setRunError] = useState("");

  const sourceKinds: SourceKind[] = ["pos", "recipes", "inventory"];

  const readiness = useMemo(() => {
    return sourceKinds.map((kind) => {
      const source = sources[kind];
      const missing = schemas[kind].required.filter((field) => !source.mapping[field]);
      return { kind, ready: Boolean(source.table) && missing.length === 0, missing };
    });
  }, [sources]);

  const allReady = readiness.every((item) => item.ready);

  const setParsed = (kind: SourceKind, fileName: string, table: ParsedTable) => {
    const auto = inferMapping(kind, table.headers);

    setSources((current) => ({
      ...current,
      [kind]: {
        fileName,
        table,
        mapping: auto,
        error: "",
      },
    }));
  };

  const handleFile = async (kind: SourceKind, file: File) => {
    try {
      const table = await readFile(file);
      if (!table.headers.length || !table.rows.length) throw new Error("No usable rows found.");
      setParsed(kind, file.name, table);
    } catch (error) {
      setSources((current) => ({
        ...current,
        [kind]: {
          ...current[kind],
          error: error instanceof Error ? error.message : "File could not be read.",
        },
      }));
    }
  };

  const loadDemo = (kind: SourceKind) => {
    setParsed(kind, "demo-" + kind + ".csv", parseDelimited(demoCsv[kind]));
  };

  const loadAllDemo = () => {
    sourceKinds.forEach((kind) => loadDemo(kind));
  };

  const setMapping = (kind: SourceKind, field: string, header: string) => {
    setSources((current) => ({
      ...current,
      [kind]: {
        ...current[kind],
        mapping: {
          ...current[kind].mapping,
          [field]: header,
        },
      },
    }));
  };

  const runAnalysis = async () => {
    if (!allReady) return;

    setRunning(true);
    setRunError("");
    setResult(null);

    try {
      const built = buildCosteraInput({
        pos: sources.pos.table!,
        recipes: sources.recipes.table!,
        inventory: sources.inventory.table!,
        mappings: {
          pos: sources.pos.mapping,
          recipes: sources.recipes.mapping,
          inventory: sources.inventory.mapping,
        },
        targetFoodCostPct: Number(target) || 25,
        locationId: "import-test",
      });

      setWarnings(built.warnings);

      const response = await fetch("/api/engine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(built.input),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Engine rejected the data.");

      setResult(payload.analysis as CosteraAnalysis);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setRunning(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "costera-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="import-studio">
      <section className="import-intro">
        <div>
          <span>{t("UNIVERSAL INGESTION ADAPTER","UNIVERSAL VERİ ADAPTERI")}</span>
          <h2>{t("Upload the restaurant’s own files.","Restoranın kendi dosyalarını yükle.")}</h2>
          <p>
            {t("COSTERA detects the columns, converts different restaurant formats into one operating model, then sends the normalized data to the live cost and leakage engine.","COSTERA kolonları algılar, farklı restoran formatlarını tek operasyon modeline dönüştürür ve normalize veriyi canlı maliyet ve kaçak motoruna gönderir.")}
          </p>
        </div>

        <div className="import-intro-actions">
          <label>
            {t("Target Food Cost","Hedef Food Cost")}
            <div><input value={target} onChange={(e) => setTarget(e.target.value)} /><span>%</span></div>
          </label>
          <button type="button" onClick={loadAllDemo}>{t("Load complete demo","Tüm demoyu yükle")}</button>
        </div>
      </section>

      <div className="import-progress">
        {readiness.map((item, index) => (
          <div className={item.ready ? "ready" : ""} key={item.kind}>
            <i>{item.ready ? "✓" : index + 1}</i>
            <span>{schemas[item.kind].label}</span>
          </div>
        ))}
        <div className={result ? "ready" : ""}><i>{result ? "✓" : "4"}</i><span>{t("Analysis","Analiz")}</span></div>
      </div>

      <section className="import-source-grid">
        {sourceKinds.map((kind) => (
          <SourceCard
            key={kind}
            kind={kind}
            source={sources[kind]}
            onFile={(file) => handleFile(kind, file)}
            onDemo={() => loadDemo(kind)}
            onMapping={(field, header) => setMapping(kind, field, header)}
            locale={locale}
          />
        ))}
      </section>

      <section className="import-run-panel">
        <div>
          <span>{t("ENGINE STATUS","MOTOR DURUMU")}</span>
          <strong>{allReady ? t("Ready to calculate","Hesaplamaya hazır") : t("Complete the 3 source mappings","3 kaynak eşleştirmesini tamamla")}</strong>
          <small>
            {allReady
              ? t("Files will be normalized in your browser and sent to the COSTERA analysis API.","Dosyalar tarayıcıda normalize edilip COSTERA analiz API'sine gönderilecek.")
              : readiness.filter((x) => !x.ready).map((x) => schemas[x.kind].label).join(", ") + " " + t("needs attention.","kontrol edilmeli.")}
          </small>
        </div>
        <button type="button" disabled={!allReady || running} onClick={runAnalysis}>
          {running ? t("Calculating…","Hesaplanıyor…") : t("Run COSTERA Analysis →","COSTERA Analizini Çalıştır →")}
        </button>
      </section>

      {runError && <div className="import-run-error">{runError}</div>}

      {result && (
        <section className="import-result">
          <div className="import-result-head">
            <div>
              <span>{t("CALCULATION COMPLETE","HESAPLAMA TAMAMLANDI")}</span>
              <h2>{t("Restaurant cost control result","Restoran maliyet kontrol sonucu")}</h2>
            </div>
            <button type="button" onClick={downloadResult}>{t("Download JSON","JSON İndir")}</button>
          </div>

          <div className="import-result-metrics">
            <article><span>{t("Net Sales","Net Satış")}</span><strong>{"$"}{result.totals.netSales.toLocaleString()}</strong><small>{result.dataQuality.mappedSalesCount}/{result.dataQuality.salesCount} sales rows mapped</small></article>
            <article><span>{t("Target Food Cost","Hedef Food Cost")}</span><strong>{result.totals.targetFoodCostPct}%</strong><small>Configured target</small></article>
            <article className="bad"><span>{t("Actual Food Cost","Gerçek Food Cost")}</span><strong>{result.totals.actualFoodCostPct}%</strong><small>{result.totals.targetGapPp > 0 ? "+" : ""}{result.totals.targetGapPp} pp vs target</small></article>
            <article className="bad"><span>{t("Unexplained Cost","Açıklanamayan Maliyet")}</span><strong>{"$"}{result.totals.unexplainedCost.toLocaleString()}</strong><small>Requires root-cause review</small></article>
          </div>

          <div className="import-result-grid">
            <div className="import-result-table">
              <div className="head"><span>{t("Ingredient","Malzeme")}</span><span>{t("Actual","Gerçek")}</span><span>{t("Theoretical","Teorik")}</span><span>{t("Gap","Fark")}</span><span>{t("Impact","Etki")}</span></div>
              {result.ingredientVariance.slice(0, 8).map((row) => (
                <div key={row.ingredientId}>
                  <span><b>{row.ingredient}</b><small>{row.risk} risk</small></span>
                  <span>{row.actualUsageQty} {row.unit}</span>
                  <span>{row.theoreticalQty} {row.unit}</span>
                  <span className={row.unexplainedQty > 0 ? "bad" : "good"}>{row.unexplainedQty > 0 ? "+" : ""}{row.unexplainedQty} {row.unit}</span>
                  <span className={row.unexplainedValue > 0 ? "bad" : "good"}>{"$"}{row.unexplainedValue.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <aside className="import-result-side">
              <strong>{t("Data quality","Veri kalitesi")}</strong>
              <div><span>{t("Missing POS menu items","Eksik POS menü ürünleri")}</span><b>{result.dataQuality.missingMenuItems.length}</b></div>
              <div><span>{t("Missing recipe ingredients","Eksik reçete malzemeleri")}</span><b>{result.dataQuality.missingIngredients.length}</b></div>
              <div><span>{t("Known waste cost","Bilinen fire maliyeti")}</span><b>{"$"}{result.totals.knownWasteCost.toLocaleString()}</b></div>
              <div><span>{t("Theoretical cost","Teorik maliyet")}</span><b>{"$"}{result.totals.theoreticalCost.toLocaleString()}</b></div>
            </aside>
          </div>

          {warnings.length > 0 && (
            <div className="import-warnings">
              <strong>{t("Importer warnings","Aktarım uyarıları")}</strong>
              {warnings.slice(0, 10).map((warning) => <span key={warning}>• {warning}</span>)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
