export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function monthLabel(month, year) {
  return `${MONTHS[(Number(month) || 1) - 1] ?? "Unknown"} ${year}`;
}

export function asPaged(value) {
  if (Array.isArray(value)) return { items: value, totalCount: value.length, page: 1, pageSize: value.length };
  return value ?? { items: [], totalCount: 0, page: 1, pageSize: 20 };
}

export function compactList(items, limit = 3) {
  const values = items.filter(Boolean);
  if (values.length <= limit) return values.join(", ");
  return `${values.slice(0, limit).join(", ")} +${values.length - limit}`;
}

export function getNextMonthTarget() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { targetMonth: target.getMonth() + 1, targetYear: target.getFullYear() };
}
