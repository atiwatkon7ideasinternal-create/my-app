import { getProducts } from "@/services/productService";
import { baht, num, formatDate } from "@/lib/format";
import { addProductAction, deleteProductAction } from "./actions";
import PageHeader from "@/components/PageHeader";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📦"
        title="จัดการสินค้า"
        subtitle={`${products.length} รายการ — ตั้งราคาทุน ราคาขาย และจัดการสต็อก`}
      />

      <section className="card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-rose-600">+</span> เพิ่มสินค้าใหม่
        </h2>
        <form
          action={addProductAction}
          className="grid grid-cols-1 sm:grid-cols-6 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="label">ชื่อสินค้า *</label>
            <input name="name" required className="input" placeholder="เช่น เสื้อยืด" />
          </div>
          <div>
            <label className="label">SKU</label>
            <input name="sku" className="input" placeholder="SKU-001" />
          </div>
          <div>
            <label className="label">ราคาทุน</label>
            <input type="number" step="0.01" name="cost_price" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">ราคาขาย</label>
            <input type="number" step="0.01" name="selling_price" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">สต็อก</label>
            <input type="number" name="stock" className="input" placeholder="0" />
          </div>
          <div className="sm:col-span-6">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              💾 บันทึกสินค้า
            </button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold">รายการสินค้า</h2>
          <span className="text-xs text-slate-500">{products.length} รายการ</span>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center">
            ยังไม่มีสินค้า — เพิ่มรายการแรกด้านบน
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>สินค้า</th>
                  <th>SKU</th>
                  <th className="text-right">ทุน</th>
                  <th className="text-right">ขาย</th>
                  <th className="text-right">มาร์จิน</th>
                  <th className="text-right">สต็อก</th>
                  <th>เพิ่มเมื่อ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const margin = p.selling_price - p.cost_price;
                  const marginPct = p.selling_price
                    ? (margin / p.selling_price) * 100
                    : 0;
                  return (
                    <tr key={p.id}>
                      <td className="text-slate-400">{p.id}</td>
                      <td className="font-semibold">{p.name}</td>
                      <td className="text-slate-500">{p.sku || "-"}</td>
                      <td className="text-right">{baht(p.cost_price)}</td>
                      <td className="text-right">{baht(p.selling_price)}</td>
                      <td className="text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            margin > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {baht(margin)} ({marginPct.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {num(p.stock)}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">
                        {formatDate(p.created_at)}
                      </td>
                      <td>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={p.id} />
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
