const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-sm disabled:bg-indigo-300",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-indigo-500 shadow-sm disabled:bg-slate-100 disabled:text-slate-400",
  danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm disabled:bg-red-300",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm disabled:bg-emerald-300",
  outlineDanger: "bg-transparent hover:bg-red-50 text-red-600 border border-red-300 focus:ring-red-500 disabled:text-red-300 disabled:border-red-200"
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg",
  md: "px-4 py-2 text-sm font-medium rounded-lg",
  lg: "px-5 py-2.5 text-base font-medium rounded-xl"
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  const isBlocked = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isBlocked}
      aria-disabled={isBlocked}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
