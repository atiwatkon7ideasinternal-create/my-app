import { getProducts } from "@/services/productService";
import { getSales } from "@/services/saleService";
import { baht, num, formatDate } from "@/lib/format";
import { addSaleAction, deleteSaleAction } from "./actions";
import PageHeader from "@/components/PageHeader";

export default async function SalesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()]);

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalProfit = sales.reduce(
    (s, x) => s + (x.unit_price - x.unit_cost) * x.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon="💰"
        title="บันทึกการขาย"
        subtitle="เมื่อบันทึก สต็อกถูกตัดอัตโนมัติ พร้อมคำนวณกำไรต่อรายการ"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500">รายการขายทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{num(sales.length)}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <p className="text-xs text-slate-500">ยอดขายรวม</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">
            {baht(totalRevenue)}
          </p>
        </div>
        <div
          className={`card p-5 ${
            totalProfit >= 0
              ? "bg-gradient-to-br from-rose-50 to-red-100"
              : "bg-gradient-to-br from-slate-50 to-slate-100"
          }`}
        >
          <p className="text-xs text-slate-500">กำไรขั้นต้นรวม</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              totalProfit >= 0 ? "text-rose-700" : "text-slate-700"
            }`}
          >
            {baht(totalProfit)}
          </p>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="font-semibold mb-4">เพิ่มรายการขาย</h2>
        {products.length === 0 ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 text-sm">
            ยังไม่มีสินค้า — เพิ่มสินค้าก่อน
          </div>
        ) : (
          <form
            action={addSaleAction}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <div className="sm:col-span-2">
              <label className="label">เลือกสินค้า *</label>
              <select name="product_id" required defaultValue="" className="select">
                <option value="" disabled>
                  -- เลือกสินค้า --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} (คงเหลือ {num(p.stock)})
                    {p.stock <= 0 ? " - หมด" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">จำนวน *</label>
              <input
                type="number"
                name="quantity"
                min={1}
                required
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">ราคาขาย/หน่วย *</label>
              <input
                type="number"
                step="0.01"
                name="unit_price"
                required
                className="input"
                placeholder="0.00"
              />
            </div>
            <div className="sm:col-span-4">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                💰 บันทึกขาย
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold">ประวัติการขาย</h2>
        </div>
        {sales.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center">ยังไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>สินค้า</th>
                  <th className="text-right">จำนวน</th>
                  <th className="text-right">ราคาขาย</th>
                  <th className="text-right">ทุน/ชิ้น</th>
                  <th className="text-right">ยอดขาย</th>
                  <th className="text-right">กำไร</th>
                  <th>เมื่อ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const profit = (s.unit_price - s.unit_cost) * s.quantity;
                  return (
                    <tr key={s.id}>
                      <td className="text-slate-400">{s.id}</td>
                      <td className="font-medium">
                        {s.product_name || `#${s.product_id}`}
                      </td>
                      <td className="text-right">{num(s.quantity)}</td>
                      <td className="text-right">{baht(s.unit_price)}</td>
                      <td className="text-right text-slate-500">
                        {baht(s.unit_cost)}
                      </td>
                      <td className="text-right font-semibold">{baht(s.total)}</td>
                      <td className="text-right">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-xs ${
                            profit >= 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {baht(profit)}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">
                        {formatDate(s.sold_at)}
                      </td>
                      <td>
                        <form action={deleteSaleAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="btn-danger">
                            ลบ
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
