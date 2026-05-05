"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconBase: IconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Icon = {
  Dashboard: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Box: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  ),
  ArrowDown: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M12 4v12" />
      <path d="m6 11 6 6 6-6" />
      <path d="M5 20h14" />
    </svg>
  ),
  ArrowUp: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M5 4h14" />
      <path d="M12 8v12" />
      <path d="m6 13 6-6 6 6" />
    </svg>
  ),
  Building: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      <path d="M10 21v-3h4v3" />
    </svg>
  ),
  Truck: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="7.5" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  ),
  Target: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  Spark: (p: IconProps) => (
    <svg {...iconBase} {...p} strokeWidth={1.8}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  Menu: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Close: (p: IconProps) => (
    <svg {...iconBase} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
};

const links = [
  { href: "/", label: "ภาพรวม", Icon: Icon.Dashboard },
  { href: "/products", label: "สินค้า", Icon: Icon.Box },
  { href: "/purchases", label: "ซื้อเข้า", Icon: Icon.ArrowDown },
  { href: "/sales", label: "ขายออก", Icon: Icon.ArrowUp },
  { href: "/fixed-costs", label: "ต้นทุนคงที่", Icon: Icon.Building },
  { href: "/variable-costs", label: "ต้นทุนแปรผัน", Icon: Icon.Truck },
  { href: "/break-even", label: "จุดคุ้มทุน", Icon: Icon.Target },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = links.map(({ href, label, Icon: ItemIcon }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active
            ? "bg-red-600 text-white font-semibold shadow-sm"
            : "text-slate-700 hover:bg-red-50 hover:text-red-700"
        }`}
      >
        <span
          className={`shrink-0 ${
            active ? "text-white" : "text-red-600"
          }`}
        >
          <ItemIcon />
        </span>
        <span>{label}</span>
      </Link>
    );
  });

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-md bg-red-600 text-white">
              <Icon.Spark width={16} height={16} />
            </span>
            <span className="text-slate-900">ระบบซื้อมาขายไป</span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="เปิดเมนู"
            className="grid place-items-center w-9 h-9 rounded-md border border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
          >
            {open ? <Icon.Close /> : <Icon.Menu />}
          </button>
        </div>
      </header>

      {/* Backdrop on mobile when open */}
      {open && (
        <button
          aria-label="ปิดเมนู"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 shrink-0 bg-white border-r border-slate-200 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-5 py-5 whitespace-nowrap border-b border-slate-100"
          >
            <span className="grid place-items-center w-9 h-9 rounded-md bg-red-600 text-white">
              <Icon.Spark width={18} height={18} />
            </span>
            <span className="font-bold text-slate-900">ระบบซื้อมาขายไป</span>
          </Link>
          <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
            {items}
          </nav>
          <div className="px-5 py-4 text-[11px] text-slate-400 border-t border-slate-100">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1.5 align-middle" />
            บริหารธุรกิจซื้อมาขายไป
          </div>
        </div>
      </aside>
    </>
  );
}
