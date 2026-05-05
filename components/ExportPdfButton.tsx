"use client";

export default function ExportPdfButton({
  label = "Export PDF",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 px-3 py-2 text-sm font-medium shadow-sm transition-colors"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9V3h12v6" />
        <rect x="6" y="14" width="12" height="7" rx="1" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      </svg>
      {label}
    </button>
  );
}
