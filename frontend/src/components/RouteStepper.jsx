const RouteStepper = ({
  route,
  deliveryNode,
  isCompleted = false,
  className = ""
}) => {
  const nodes = [route?.from, ...(route?.stops || []), route?.to].filter(Boolean);
  const completedStops = route?.completedStops || [];

  let currentIdx = 0;
  if (isCompleted) {
    currentIdx = Math.max(0, nodes.length - 1);
  } else if (completedStops.length > 0) {
    currentIdx = Math.min(Math.max(...completedStops) + 1, nodes.length - 1);
  }

  if (nodes.length === 0) return null;

  return (
    <div className={`py-3 ${className}`}>
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 sm:gap-0">
        {nodes.map((node, idx) => {
          const isReached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isTarget =
            deliveryNode &&
            node.trim().toLowerCase() === deliveryNode.trim().toLowerCase();
          const isLast = idx === nodes.length - 1;

          return (
            <div key={idx} className="flex items-center flex-1 min-w-[70px] last:flex-none">
              <div className="flex flex-col items-center relative text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : isReached
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCurrent ? (
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  ) : isReached ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-1.5 text-xs truncate max-w-[80px] sm:max-w-[100px] font-medium ${
                    isCurrent
                      ? "text-indigo-700 font-bold"
                      : isReached
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                  title={node}
                >
                  {node}
                </span>

                {isTarget && (
                  <span className="mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Dropoff
                  </span>
                )}
                {isCurrent && !isTarget && (
                  <span className="mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Current
                  </span>
                )}
              </div>

              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                    idx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteStepper;
