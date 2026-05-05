import { baht, num } from "@/lib/format";

interface Props {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPrice: number;
  breakEvenUnits: number | null;
  breakEvenRevenue: number | null;
}

export default function BreakEvenChart({
  fixedCost,
  variableCostPerUnit,
  sellingPrice,
  breakEvenUnits,
  breakEvenRevenue,
}: Props) {
  const cm = sellingPrice - variableCostPerUnit;
  const canCalc = cm > 0 && breakEvenUnits != null;

  const W = 720;
  const H = 380;
  const padL = 70;
  const padR = 24;
  const padT = 24;
  const padB = 48;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxUnits = canCalc ? Math.max(Math.ceil(breakEvenUnits! * 2), 10) : 100;
  const maxMoney = canCalc
    ? Math.max(sellingPrice * maxUnits, fixedCost + variableCostPerUnit * maxUnits) *
      1.05
    : Math.max(fixedCost * 2, 1000);

  const x = (units: number) => padL + (units / maxUnits) * innerW;
  const y = (money: number) => padT + innerH - (money / maxMoney) * innerH;

  const totalCostAtMax = fixedCost + variableCostPerUnit * maxUnits;
  const revenueAtMax = sellingPrice * maxUnits;

  const bepX = canCalc ? x(breakEvenUnits!) : 0;
  const bepY = canCalc ? y(breakEvenRevenue!) : 0;

  // Build profit area polygon (between BEP and right edge, between revenue and total cost)
  const profitPolygon = canCalc
    ? `${bepX},${bepY} ${x(maxUnits)},${y(revenueAtMax)} ${x(maxUnits)},${y(totalCostAtMax)}`
    : "";

  // Loss area polygon (between 0 and BEP, between total cost and revenue)
  const lossPolygon = canCalc
    ? `${x(0)},${y(fixedCost)} ${bepX},${bepY} ${x(0)},${y(0)}`
    : "";

  // Y-axis ticks: 5 evenly spaced
  const yTicks = Array.from({ length: 6 }, (_, i) => (maxMoney / 5) * i);
  const xTicks = Array.from({ length: 6 }, (_, i) => Math.round((maxUnits / 5) * i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-sm">📈 กราฟแสดงจุดคุ้มทุน</h3>
        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
          <Legend color="#0ea5e9" label="รายรับรวม (Revenue)" />
          <Legend color="#f59e0b" label="ต้นทุนรวม (Total Cost)" />
          <Legend color="#94a3b8" label="ต้นทุนคงที่ (Fixed)" dashed />
          {canCalc && <Legend color="#10b981" label="กำไร" filled />}
          {canCalc && <Legend color="#f43f5e" label="ขาดทุน" filled />}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[500px]"
          role="img"
          aria-label="Break-even chart"
        >
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid horizontal */}
          {yTicks.map((t, i) => (
            <line
              key={`gh-${i}`}
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Profit/Loss areas */}
          {canCalc && (
            <>
              <polygon points={lossPolygon} fill="url(#lossGrad)" />
              <polygon points={profitPolygon} fill="url(#profitGrad)" />
            </>
          )}

          {/* Y axis labels */}
          {yTicks.map((t, i) => (
            <text
              key={`yt-${i}`}
              x={padL - 8}
              y={y(t) + 4}
              fontSize="10"
              fill="#64748b"
              textAnchor="end"
            >
              {abbreviateBaht(t)}
            </text>
          ))}

          {/* X axis labels */}
          {xTicks.map((t, i) => (
            <text
              key={`xt-${i}`}
              x={x(t)}
              y={H - padB + 16}
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
            >
              {num(t)}
            </text>
          ))}

          {/* Axes */}
          <line
            x1={padL}
            x2={padL}
            y1={padT}
            y2={H - padB}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <line
            x1={padL}
            x2={W - padR}
            y1={H - padB}
            y2={H - padB}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Fixed cost line (horizontal dashed) */}
          <line
            x1={padL}
            x2={W - padR}
            y1={y(fixedCost)}
            y2={y(fixedCost)}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* Total cost line */}
          <line
            x1={x(0)}
            y1={y(fixedCost)}
            x2={x(maxUnits)}
            y2={y(totalCostAtMax)}
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* Revenue line */}
          <line
            x1={x(0)}
            y1={y(0)}
            x2={x(maxUnits)}
            y2={y(revenueAtMax)}
            stroke="#0ea5e9"
            strokeWidth="2.5"
          />

          {/* BEP marker */}
          {canCalc && (
            <>
              <line
                x1={bepX}
                x2={bepX}
                y1={bepY}
                y2={H - padB}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1={padL}
                x2={bepX}
                y1={bepY}
                y2={bepY}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle cx={bepX} cy={bepY} r="7" fill="#6366f1" />
              <circle cx={bepX} cy={bepY} r="3" fill="white" />

              <g
                transform={`translate(${Math.min(bepX + 12, W - padR - 150)}, ${Math.max(
                  bepY - 38,
                  padT + 4
                )})`}
              >
                <rect
                  width="155"
                  height="40"
                  rx="6"
                  fill="#4338ca"
                  opacity="0.95"
                />
                <text x="8" y="16" fontSize="10" fill="white" opacity="0.85">
                  จุดคุ้มทุน (BEP)
                </text>
                <text x="8" y="32" fontSize="11" fill="white" fontWeight="700">
                  {num(breakEvenUnits!)} หน่วย · {baht(breakEvenRevenue!)}
                </text>
              </g>
            </>
          )}

          {/* Axis titles */}
          <text
            x={W / 2}
            y={H - 6}
            fontSize="11"
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
          >
            จำนวนหน่วยที่ขาย
          </text>
          <text
            x={-H / 2}
            y={16}
            fontSize="11"
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
            transform="rotate(-90)"
          >
            มูลค่า (บาท)
          </text>
        </svg>
      </div>

      {!canCalc && (
        <p className="text-xs text-rose-600">
          ⚠️ ราคาขาย ≤ ต้นทุนแปรผัน — เส้นรายรับจะไม่ตัดเส้นต้นทุน คำนวณ BEP ไม่ได้
        </p>
      )}
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
  filled,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  filled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {filled ? (
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: color, opacity: 0.4 }}
        />
      ) : (
        <svg width="20" height="6">
          <line
            x1="0"
            y1="3"
            x2="20"
            y2="3"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={dashed ? "4 3" : undefined}
          />
        </svg>
      )}
      <span>{label}</span>
    </span>
  );
}

function abbreviateBaht(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}ล.`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toFixed(0);
}
