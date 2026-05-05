import { getFixedCosts } from "@/services/fixedCostService";
import { baht, formatDate } from "@/lib/format";
import { addFixedCostAction, deleteFixedCostAction } from "./actions";
import PageHeader from "@/components/PageHeader";

const periodLabel: Record<string, string> = {
  monthly: "รายเดือน",
  yearly: "รายปี",
  weekly: "รายสัปดาห์",
  "one-time": "ครั้งเดียว",
};

export default async function FixedCostsPage() {
  const costs = await getFixedCosts();
  const total = costs.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🏢"
        title="ต้นทุนคงที่"
        subtitle="Fixed Costs — ค่าใช้จ่ายที่จ่ายเท่าเดิมไม่ว่าขายได้กี่ชิ้น เช่น ค่าเช่า เงินเดือน"
      />

      <div className="card p-6 bg-gradient-to-br from-rose-500 via-red-600 to-red-800 text-white">
        <p className="text-sm opacity-90">ต้นทุนคงที่รวมทั้งหมด</p>
        <p className="text-4xl font-bold mt-2">{baht(total)}</p>
        <p className="text-xs opacity-80 mt-1">
          ค่านี้จะถูกใช้ในการคำนวณจุดคุ้มทุนของสินค้าทุกตัว
        </p>
      </div>

      <section className="card p-6">
        <h2 className="font-semibold mb-4">เพิ่มต้นทุนคงที่</h2>
        <form
          action={addFixedCostAction}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="label">ชื่อ *</label>
            <input
              name="name"
              required
              className="input"
              placeholder="เช่น ค่าเช่าร้าน"
            />
          </div>
          <div>
            <label className="label">จำนวนเงิน *</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              className="input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">รอบ</label>
            <select name="period" defaultValue="monthly" className="select">
              <option value="monthly">รายเดือน</option>
              <option value="yearly">รายปี</option>
              <option value="weekly">รายสัปดาห์</option>
              <option value="one-time">ครั้งเดียว</option>
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
          <h2 className="font-semibold">รายการต้นทุนคงที่</h2>
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
                  <th className="text-right">จำนวน</th>
                  <th>รอบ</th>
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
                    <td className="text-right font-medium">{baht(c.amount)}</td>
                    <td>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {periodLabel[c.period] || c.period}
                      </span>
                    </td>
                    <td data-testid="fc-note" className="text-slate-500">{c.note || "-"}</td>
                    <td className="text-slate-500 text-xs">
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <form action={deleteFixedCostAction}>
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
