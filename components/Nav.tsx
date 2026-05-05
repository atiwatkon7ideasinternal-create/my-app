"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ภาพรวม", icon: "📊" },
  { href: "/products", label: "สินค้า", icon: "📦" },
  { href: "/purchases", label: "ซื้อเข้า", icon: "📥" },
  { href: "/sales", label: "ขายออก", icon: "💰" },
  { href: "/fixed-costs", label: "ต้นทุนคงที่", icon: "🏢" },
  { href: "/variable-costs", label: "ต้นทุนแปรผัน", icon: "🚚" },
  { href: "/break-even", label: "จุดคุ้มทุน", icon: "🎯" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg whitespace-nowrap"
          >
            <span className="bg-white/20 backdrop-blur rounded-lg px-2 py-1 text-sm">
              ⚡
            </span>
            ระบบซื้อมาขายไป
          </Link>

          <div className="flex flex-wrap items-center gap-1">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-white text-indigo-700 shadow-md font-semibold"
                      : "text-white/90 hover:bg-white/15"
                  }`}
                >
                  <span className="text-base">{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
