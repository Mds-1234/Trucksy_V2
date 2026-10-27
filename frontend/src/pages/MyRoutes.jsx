import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserRoutes, deleteRoute } from "../services/routeService";
import Card, { CardHeader, CardBody, CardFooter } from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

const MyRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchRoutes = async () => {
      try {
        const data = await getUserRoutes();
        if (isMounted) {
          setRoutes(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || "Failed to load routes");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoutes();
    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  const handleDelete = async (id) => {
    setActionError("");
    setDeletingId(id);
    try {
      await deleteRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message || "Failed to delete route";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMessage}: ${details}` : serverMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Routes"
        subtitle="Manage your posted routes, track capacity availability, and check travel dates."
        action={
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Route
          </Link>
        }
      />

      {actionError && (
        <Alert type="error" title="Action Failed">
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Spinner message="Loading your routes..." className="py-20" />
      ) : error ? (
        <Alert
          type="error"
          title="Error"
          onRetry={() => {
            setLoading(true);
            setRefreshCount((c) => c + 1);
          }}
        >
          {error}
        </Alert>
      ) : routes.length === 0 ? (
        <EmptyState
          title="No active routes found"
          text="You have not created any routes yet or your completed trips have been archived to History."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Post a Route Now
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((r) => (
            <Card key={r.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <CardHeader className="flex items-center justify-between gap-2 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Route
                  </span>
                  <Badge status={r.status} />
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <span>{r.from}</span>
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span>{r.to}</span>
                    </div>
                  </div>

                  {r.stops?.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1.5 font-medium">Stops:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {r.stops.map((stop, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Departure</span>
                      <span className="font-semibold text-slate-800">{r.date || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estimated Arrival</span>
                      <span className="font-semibold text-emerald-700">{r.endDate || r.date || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Capacity</span>
                      <span className="font-semibold text-slate-800">{r.capacity} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Space</span>
                      <span className="font-semibold text-slate-800">{r.space} m³</span>
                    </div>
                  </div>
                </CardBody>
              </div>

              {r.status === "open" && (
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outlineDanger"
                    size="sm"
                    loading={deletingId === r.id}
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="w-full"
                  >
                    {deletingId === r.id ? "Deleting..." : "Delete Route"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRoutes;
