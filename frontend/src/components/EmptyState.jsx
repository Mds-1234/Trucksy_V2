const EmptyState = ({
  icon,
  title,
  text,
  action,
  className = ""
}) => {
  return (
    <div
      className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      {title && <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>}
      {text && <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">{text}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
