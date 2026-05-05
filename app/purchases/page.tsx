import { getProducts } from "@/services/productService";
import { getPurchases } from "@/services/purchaseService";
import { baht, num, formatDate } from "@/lib/format";
import { addPurchaseAction, deletePurchaseAction } from "./actions";
import PageHeader from "@/components/PageHeader";

export default async function PurchasesPage() {
  const [purchases, products] = await Promise.all([
    getPurchases(),
    getProducts(),
  ]);

  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📥"
        title="บันทึกการซื้อสินค้าเข้า"
        subtitle="เมื่อบันทึก สต็อกจะเพิ่มอัตโนมัติ และอัปเดตราคาทุนล่าสุด"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500">รายการซื้อทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{num(purchases.length)}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50">
          <p className="text-xs text-slate-500">เงินที่ใช้ซื้อสินค้ารวม</p>
          <p className="text-2xl font-bold mt-1 text-amber-700">{baht(totalSpent)}</p>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="font-semibold mb-4">เพิ่มรายการซื้อ</h2>
        {products.length === 0 ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 text-sm">
            ยังไม่มีสินค้าในระบบ — เพิ่มสินค้าที่หน้า{" "}
            <a href="/products" className="underline font-medium">
              สินค้า
            </a>{" "}
            ก่อน
          </div>
        ) : (
          <form
            action={addPurchaseAction}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <div className="sm:col-span-2">
              <label className="label">เลือกสินค้า *</label>
              <select name="product_id" required defaultValue="" className="select">
                <option value="" disabled>
                  -- เลือกสินค้า --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (คงเหลือ {num(p.stock)})
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
              <label className="label">ราคาต่อหน่วย *</label>
              <input
                type="number"
                step="0.01"
                name="unit_cost"
                required
                className="input"
                placeholder="0.00"
              />
            </div>
            <div className="sm:col-span-4">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                📥 บันทึกซื้อเข้า
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold">ประวัติการซื้อ</h2>
        </div>
        {purchases.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center">ยังไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>สินค้า</th>
                  <th className="text-right">จำนวน</th>
                  <th className="text-right">ราคา/หน่วย</th>
                  <th className="text-right">รวม</th>
                  <th>เมื่อ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="text-slate-400">{p.id}</td>
                    <td className="font-medium">
                      {p.product_name || `#${p.product_id}`}
                    </td>
                    <td className="text-right">{num(p.quantity)}</td>
                    <td className="text-right">{baht(p.unit_cost)}</td>
                    <td className="text-right font-bold text-amber-700">
                      {baht(p.total)}
                    </td>
                    <td className="text-slate-500 text-xs">
                      {formatDate(p.purchased_at)}
                    </td>
                    <td>
                      <form action={deletePurchaseAction}>
                        <input type="hidden" name="id" value={p.id} />
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
