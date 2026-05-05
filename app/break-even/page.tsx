import { getProducts } from "@/services/productService";
import { getFixedCosts } from "@/services/fixedCostService";
import {
  calculateBreakEven,
  getBreakEvenForProduct,
} from "@/services/analyticsService";
import { baht, num } from "@/lib/format";
import { BreakEvenResult } from "@/models/analytics";
import PageHeader from "@/components/PageHeader";
import BreakEvenChart from "@/components/BreakEvenChart";

interface SearchParams {
  productId?: string;
  fixed_cost?: string;
  variable_cost_per_unit?: string;
  selling_price?: string;
  mode?: string;
}

export default async function BreakEvenPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [products, fixedCosts] = await Promise.all([
    getProducts(),
    getFixedCosts(),
  ]);
  const totalFixed = fixedCosts.reduce((s, c) => s + c.amount, 0);

  let productResult: BreakEvenResult | null = null;
  if (params.productId) {
    productResult = await getBreakEvenForProduct(Number(params.productId));
  }

  let customResult: BreakEvenResult | null = null;
  if (
    params.mode === "custom" &&
    params.fixed_cost &&
    params.variable_cost_per_unit &&
    params.selling_price
  ) {
    customResult = await calculateBreakEven({
      fixed_cost: Number(params.fixed_cost),
      variable_cost_per_unit: Number(params.variable_cost_per_unit),
      selling_price: Number(params.selling_price),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon="🎯"
        title="คำนวณจุดคุ้มทุน"
        subtitle="Break-Even Point — ขายให้ได้กี่ชิ้นถึงจะคุ้มทุน?"
      />

      <div className="card p-6 bg-gradient-to-r from-rose-700 via-red-700 to-red-900 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">สูตรคำนวณ</p>
            <p className="text-2xl font-bold mt-2">
              BEP = <span className="text-emerald-300">ต้นทุนคงที่</span> ÷
            </p>
            <p className="text-2xl font-bold">
              (<span className="text-sky-300">ราคาขาย</span> −{" "}
              <span className="text-amber-300">ต้นทุนแปรผัน/หน่วย</span>)
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-xs opacity-70">ต้นทุนคงที่รวมในระบบ</p>
            <p className="text-3xl font-bold mt-1">{baht(totalFixed)}</p>
          </div>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded">
            โหมดที่ 1
          </span>
          <h2 className="font-semibold text-lg">เลือกจากสินค้าจริงในระบบ</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          ระบบจะดึงราคาทุน + ราคาขาย + ต้นทุนแปรผันที่ผูกกับสินค้านั้น มาคำนวณอัตโนมัติ
        </p>

        <form className="flex flex-col sm:flex-row gap-3" action="/break-even">
          <select
            name="productId"
            defaultValue={params.productId || ""}
            className="select flex-1"
            required
          >
            <option value="" disabled>
              -- เลือกสินค้า --
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ขาย {baht(p.selling_price)})
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            🔍 คำนวณ
          </button>
        </form>

        {productResult && <BreakEvenResultView r={productResult} />}
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded">
            โหมดที่ 2
          </span>
          <h2 className="font-semibold text-lg">กำหนดค่าเอง</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          ใช้สำหรับลอง "ถ้าตั้งราคาเท่านี้ ต้องขายกี่ชิ้นถึงคุ้ม?"
        </p>

        <form
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          action="/break-even"
        >
          <input type="hidden" name="mode" value="custom" />
          <div>
            <label className="label">ต้นทุนคงที่ (บาท)</label>
            <input
              type="number"
              step="0.01"
              name="fixed_cost"
              defaultValue={params.fixed_cost || totalFixed}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">ต้นทุนแปรผัน/หน่วย (บาท)</label>
            <input
              type="number"
              step="0.01"
              name="variable_cost_per_unit"
              defaultValue={params.variable_cost_per_unit || ""}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">ราคาขาย/หน่วย (บาท)</label>
            <input
              type="number"
              step="0.01"
              name="selling_price"
              defaultValue={params.selling_price || ""}
              required
              className="input"
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              🔍 คำนวณ
            </button>
          </div>
        </form>

        {customResult && <BreakEvenResultView r={customResult} />}
      </section>
    </div>
  );
}

function BreakEvenResultView({ r }: { r: BreakEvenResult }) {
  const fixed = r.total_fixed_cost ?? r.fixed_cost ?? 0;

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
      {r.product && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">สินค้า:</span>
          <span className="font-bold text-lg">{r.product.name}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoBox label="ต้นทุนคงที่" value={baht(fixed)} color="emerald" />
        <InfoBox
          label="ต้นทุนแปรผัน/หน่วย"
          value={baht(r.variable_cost_per_unit)}
          color="amber"
        />
        <InfoBox label="ราคาขาย/หน่วย" value={baht(r.selling_price)} color="sky" />
        <InfoBox
          label="Contribution Margin"
          value={baht(r.contribution_margin_per_unit)}
          color="rose"
        />
      </div>

      {r.warning ? (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded p-4 text-sm">
          ⚠️ {r.warning}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
              <p className="text-xs uppercase tracking-widest opacity-80">
                ต้องขายให้ได้
              </p>
              <p className="text-4xl font-bold mt-2">
                {num(r.break_even_units)}
                <span className="text-lg font-normal opacity-80 ml-1">หน่วย</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
              <p className="text-xs uppercase tracking-widest opacity-80">
                เพื่อให้ได้ยอดขาย
              </p>
              <p className="text-4xl font-bold mt-2">{baht(r.break_even_revenue)}</p>
            </div>
          </div>

          <BreakEvenChart
            fixedCost={fixed}
            variableCostPerUnit={r.variable_cost_per_unit}
            sellingPrice={r.selling_price}
            breakEvenUnits={r.break_even_units}
            breakEvenRevenue={r.break_even_revenue}
          />

          {r.contribution_margin_ratio != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-1">
                Contribution Margin Ratio:{" "}
                <span className="text-rose-700">
                  {(r.contribution_margin_ratio * 100).toFixed(2)}%
                </span>
              </p>
              <p className="text-xs text-slate-600">
                ทุก 100 บาทของยอดขาย จะเหลือไปจ่ายต้นทุนคงที่{" "}
                <strong>{(r.contribution_margin_ratio * 100).toFixed(2)} บาท</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const colorMap: Record<string, string> = {
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  sky: "border-sky-200 bg-sky-50",
  rose: "border-rose-200 bg-rose-50",
};

function InfoBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`border rounded-xl p-3 ${colorMap[color]}`}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className="font-bold mt-1">{value}</p>
    </div>
  );
}
