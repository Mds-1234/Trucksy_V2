const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10"
};

const Spinner = ({
  size = "md",
  message,
  className = ""
}) => {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}
    >
      <svg
        className={`animate-spin text-indigo-600 ${sizes[size] || sizes.md}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message ? (
        <p className="text-sm font-medium text-slate-500">{message}</p>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};

export default Spinner;
