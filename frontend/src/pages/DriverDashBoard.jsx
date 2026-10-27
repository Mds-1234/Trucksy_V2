import { useState, useEffect } from "react";
import RouteForm from "../components/RouteForm";
import { getUserBookings, getMatchSummary } from "../services/bookingService";
import { getUserRoutes } from "../services/routeService";
import { Link } from "react-router-dom";
import Card, { CardHeader, CardBody, CardFooter } from "../components/Card";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";

const DriverDashboard = () => {
  const [matchCount, setMatchCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      setError("");
      try {
        const [summaryRes, bookingsRes, routesRes] = await Promise.all([
          getMatchSummary(),
          getUserBookings(),
          getUserRoutes()
        ]);
        if (isMounted) {
          setMatchCount(summaryRes?.count || 0);
          const pending = (bookingsRes || []).filter(
            (b) => b.status === "pending" && b.route?.status !== "completed" && b.shipment?.status !== "delivered"
          );
          setPendingCount(pending.length);

          const active = (routesRes || []).find(
            (r) => (r.status === "open" || r.status === "in_progress") && r.status !== "completed"
          );
          setActiveRoute(active || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  if (loading) {
    return <div className="py-20 text-center text-sm font-medium text-slate-500">Loading driver dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Dashboard"
        subtitle="Manage your active trips, check incoming requests, and post new route capacity."
      />

      {error && (
        <Alert
          type="error"
          title="Dashboard Error"
          onRetry={() => {
            setLoading(true);
            setRefreshCount((c) => c + 1);
          }}
        >
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Trip Status</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {activeRoute ? (
              <Badge status={activeRoute.status} />
            ) : (
              <span className="text-xl font-bold text-slate-800">Available</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {activeRoute ? `${activeRoute.from} ➔ ${activeRoute.to}` : "No trip currently in progress"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {pendingCount === 1 ? "1 booking request awaiting approval" : `${pendingCount} booking requests awaiting approval`}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Matching Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{matchCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cargo matching your registered routes
          </p>
        </Card>
      </div>

      {pendingCount > 0 && (
        <Alert type="warning" title="Action Required">
          You have <span className="font-semibold">{pendingCount}</span> pending booking request{pendingCount > 1 ? "s" : ""}.{" "}
          <Link to="/bookings" className="font-semibold underline hover:text-amber-900">
            Go to Bookings
          </Link>{" "}
          to review and accept deliveries.
        </Alert>
      )}

      {matchCount > 0 && pendingCount === 0 && (
        <Alert type="info" title="Matches Available">
          There {matchCount > 1 ? "are" : "is"} <span className="font-semibold">{matchCount}</span> matching shipment{matchCount > 1 ? "s" : ""} for your routes in the system. Businesses can book you directly!
        </Alert>
      )}

      {activeRoute && (
        <Card className="border-indigo-200 ring-1 ring-indigo-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeRoute.from} ➔ {activeRoute.to}
                </h3>
                <p className="text-xs text-slate-500">Currently active scheduled journey</p>
              </div>
            </div>
            <Badge status={activeRoute.status} />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Departure Date</span>
                <span className="font-semibold text-slate-800">{activeRoute.date || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Estimated Arrival</span>
                <span className="font-semibold text-emerald-700">{activeRoute.endDate || activeRoute.date || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Available Payload</span>
                <span className="font-semibold text-slate-800">{activeRoute.capacity} kg</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Available Space</span>
                <span className="font-semibold text-slate-800">{activeRoute.space} m³</span>
              </div>
            </div>

            {activeRoute.stops?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-2 font-medium">Route Path & Stops</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                    {activeRoute.from}
                  </span>
                  {activeRoute.stops.map((stop, sIdx) => (
                    <span key={sIdx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">➔</span>
                      <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-700">
                        {stop}
                      </span>
                    </span>
                  ))}
                  <span className="text-slate-400 text-xs">➔</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                    {activeRoute.to}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
          <CardFooter className="flex justify-end">
            <Link
              to="/bookings"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Manage Deliveries & Stops in Bookings ➔
            </Link>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Post a New Route</h2>
          <p className="text-xs text-slate-500">Provide freight capacity along your planned driving schedule.</p>
        </CardHeader>
        <CardBody className="p-6">
          <RouteForm
            onRouteAdded={() => setRefreshCount((c) => c + 1)}
            disabled={!!activeRoute}
            activeTripNotice={
              activeRoute
                ? `You currently have an active trip (${activeRoute.from} ➔ ${activeRoute.to}) scheduled to complete on ${activeRoute.endDate || activeRoute.date}. Drivers can only do one trip at a time.`
                : ""
            }
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default DriverDashboard;
