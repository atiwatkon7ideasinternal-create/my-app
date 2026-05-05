import { getVariableCosts } from "@/services/variableCostService";
import { getProducts } from "@/services/productService";
import { baht, formatDate } from "@/lib/format";
import {
  addVariableCostAction,
  deleteVariableCostAction,
} from "./actions";
import PageHeader from "@/components/PageHeader";

export default async function VariableCostsPage() {
  const [costs, products] = await Promise.all([
    getVariableCosts(),
    getProducts(),
  ]);

  const productName = (id: number | null) => {
    if (id == null) return "ทุกสินค้า";
    const p = products.find((x) => x.id === id);
    return p ? p.name : `#${id}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🚚"
        title="ต้นทุนแปรผัน"
        subtitle="Variable Costs — ต้นทุนต่อหน่วยที่เพิ่มตามจำนวนขาย เช่น ค่าขนส่ง ค่าบรรจุภัณฑ์"
      />

      <section className="card p-6">
        <h2 className="font-semibold mb-4">เพิ่มต้นทุนแปรผัน</h2>
        <form
          action={addVariableCostAction}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="label">ชื่อ *</label>
            <input
              name="name"
              required
              className="input"
              placeholder="เช่น ค่าส่งพัสดุ"
            />
          </div>
          <div>
            <label className="label">บาท/หน่วย *</label>
            <input
              type="number"
              step="0.01"
              name="amount_per_unit"
              required
              className="input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">ผูกกับสินค้า</label>
            <select name="product_id" defaultValue="" className="select">
              <option value="">ใช้กับทุกสินค้า</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="label">หมายเหตุ</label>
            <input name="note" className="input" placeholder="(ไม่บังคับ)" />
          </div>
          <div className="sm:col-span-4">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              💾 บันทึก
            </button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold">รายการต้นทุนแปรผัน</h2>
        </div>
        {costs.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center">ยังไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ชื่อ</th>
                  <th className="text-right">บาท/หน่วย</th>
                  <th>ผูกกับสินค้า</th>
                  <th>หมายเหตุ</th>
                  <th>บันทึกเมื่อ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr key={c.id}>
                    <td className="text-slate-400">{c.id}</td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-right font-medium">
                      {baht(c.amount_per_unit)}
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          c.product_id == null
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {productName(c.product_id)}
                      </span>
                    </td>
                    <td className="text-slate-500">{c.note || "-"}</td>
                    <td className="text-slate-500 text-xs">
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <form action={deleteVariableCostAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="btn-danger">
                          ลบ
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
