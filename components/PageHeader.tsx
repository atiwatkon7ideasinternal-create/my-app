import ExportPdfButton from "./ExportPdfButton";

export default function PageHeader({
  title,
  subtitle,
  icon,
  showExport = true,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  showExport?: boolean;
}) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-white border border-red-200 text-red-600 grid place-items-center text-xl shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="inline-block w-1.5 h-6 bg-red-600 rounded-sm align-middle mr-2.5" />
            {title}
          </h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {showExport && <ExportPdfButton />}
    </header>
  );
}
