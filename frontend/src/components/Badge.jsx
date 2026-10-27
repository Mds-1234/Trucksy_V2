const statusStyles = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  driver: "bg-indigo-50 text-indigo-700 border-indigo-200",
  business: "bg-purple-50 text-purple-700 border-purple-200"
};

const formatLabel = (status) => {
  if (!status) return "";
  if (status === "in_progress") return "IN PROGRESS";
  return status.toUpperCase();
};

const Badge = ({
  status,
  label,
  variant,
  className = ""
}) => {
  const key = (variant || status || "").toLowerCase();
  const colorClass = statusStyles[key] || "bg-slate-100 text-slate-700 border-slate-200";
  const displayLabel = label || formatLabel(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase ${colorClass} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;
