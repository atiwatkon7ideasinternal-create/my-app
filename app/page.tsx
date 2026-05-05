import Link from "next/link";
import { getSummary } from "@/services/analyticsService";
import { getProducts } from "@/services/productService";
import { baht, num } from "@/lib/format";
import ExportPdfButton from "@/components/ExportPdfButton";

export default async function DashboardPage() {
  const [summary, products] = await Promise.all([getSummary(), getProducts()]);

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="inline-block w-1.5 h-6 bg-red-600 rounded-sm align-middle mr-2.5" />
            ภาพรวมธุรกิจ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปยอดขาย ต้นทุน กำไร และสถานะสต็อกสินค้าแบบเรียลไทม์
          </p>
        </div>
        <ExportPdfButton />
      </header>

      {!summary ? (
        <div className="card p-5 border-l-4 border-rose-500">
          <p className="font-semibold text-rose-700">⚠️ เชื่อมต่อ backend ไม่ได้</p>
          <p className="text-sm text-slate-600 mt-1">
            กรุณารัน <code className="bg-slate-100 px-1.5 py-0.5 rounded">node index.js</code>{" "}
            ใน <code className="bg-slate-100 px-1.5 py-0.5 rounded">/Users/atiwat/backend</code>{" "}
            (port 5001)
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="ยอดขายรวม"
              value={baht(summary.revenue)}
              icon="💰"
              gradient="from-emerald-500 to-teal-600"
            />
            <KpiCard
              title="ต้นทุนสินค้า"
              value={baht(summary.cogs)}
              icon="📦"
              gradient="from-amber-500 to-orange-600"
            />
            <KpiCard
              title="กำไรขั้นต้น"
              value={baht(summary.gross_profit)}
              icon="📈"
              gradient="from-sky-500 to-blue-600"
            />
            <KpiCard
              title={summary.status === "กำไร" ? "กำไรสุทธิ" : "ขาดทุนสุทธิ"}
              value={baht(summary.net_profit)}
              icon={summary.net_profit >= 0 ? "✨" : "📉"}
              gradient={
                summary.net_profit >= 0
                  ? "from-rose-500 to-red-700"
                  : "from-slate-600 to-slate-800"
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniStat label="ขายแล้ว (หน่วย)" value={num(summary.units_sold)} />
            <MiniStat label="ต้นทุนคงที่รวม" value={baht(summary.total_fixed_cost)} />
            <MiniStat
              label="ต้นทุนแปรผันที่ใช้จริง"
              value={baht(summary.total_extra_variable_cost)}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">สินค้าทั้งหมด</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {products.length} รายการ · สต็อกรวม {num(totalStock)} ชิ้น
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-rose-600 hover:text-rose-800 font-medium"
            >
              จัดการ →
            </Link>
          </div>
          {products.length === 0 ? (
            <EmptyState
              text="ยังไม่มีสินค้า"
              hint="เริ่มเพิ่มสินค้าได้ที่หน้า สินค้า"
            />
          ) : (
            <ul className="text-sm divide-y divide-slate-100">
              {products.slice(0, 6).map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      ขาย {baht(p.selling_price)} · ทุน {baht(p.cost_price)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.stock <= 5
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    คงเหลือ {num(p.stock)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">⚠️ สินค้าใกล้หมด</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สินค้าที่เหลือสต็อก ≤ 5 ชิ้น
              </p>
            </div>
            <Link
              href="/purchases"
              className="text-sm text-rose-600 hover:text-rose-800 font-medium"
            >
              ซื้อเข้า →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState text="✅ สต็อกปลอดภัย" hint="ไม่มีสินค้าที่ใกล้หมด" />
          ) : (
            <ul className="text-sm divide-y divide-slate-100">
              {lowStock.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    เหลือ {num(p.stock)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wider opacity-90">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-3">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

function EmptyState({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm font-medium text-slate-600">{text}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
