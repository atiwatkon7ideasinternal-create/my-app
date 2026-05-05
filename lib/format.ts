export const baht = (n: number | null | undefined) => {
  if (n == null || isNaN(Number(n))) return "-";
  return Number(n).toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  });
};

export const num = (n: number | null | undefined) => {
  if (n == null || isNaN(Number(n))) return "-";
  return Number(n).toLocaleString("th-TH");
};

export const formatDate = (s?: string) => {
  if (!s) return "-";
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("th-TH");
};
