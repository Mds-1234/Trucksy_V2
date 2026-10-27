import { useId } from "react";

const Select = ({
  label,
  id,
  options = [],
  children,
  error,
  helperText,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full px-3.5 py-2 text-sm bg-white rounded-lg border transition-colors shadow-2xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
            : "border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-indigo-100"
        } ${className}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
