import { useState, useEffect, useContext } from "react";
import { getUserBookings } from "../services/bookingService";
import { AuthContext } from "../context/AuthContext";
import Card, { CardHeader, CardBody } from "../components/Card";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const bookingsData = await getUserBookings();
        if (isMounted) {
          const completedTrips = (bookingsData || []).filter(
            (b) =>
              b.status === "completed" ||
              b.route?.status === "completed" ||
              b.shipment?.status === "delivered"
          );
          setHistory(completedTrips);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || "Failed to load history");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRefreshCount((c) => c + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip History"
        subtitle="Review records of all your completed freight deliveries and archived journeys."
      />

      {loading ? (
        <Spinner message="Loading your completed trips..." className="py-20" />
      ) : error ? (
        <Alert type="error" title="Error" onRetry={handleRetry}>
          {error}
        </Alert>
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed trips yet"
          text="When a route journey is finished and all deliveries are marked complete, they will appear here in your permanent archive."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex items-center justify-between gap-2 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Archived Delivery
                </span>
                <Badge status="completed" label="Completed" />
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Route</span>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span>{booking.route?.from}</span>
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{booking.route?.to}</span>
                  </div>
                </div>

                {booking.route?.stops?.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Passed Stops:</span>
                    <div className="flex flex-wrap gap-1">
                      {booking.route.stops.map((stop, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {stop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-500 block">Departure</span>
                    <span className="font-semibold text-slate-800">{booking.route?.date || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Delivered On</span>
                    <span className="font-semibold text-emerald-700">{booking.route?.endDate || booking.route?.date || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                  <p className="text-slate-700">
                    <span className="font-semibold">Shipment Cargo:</span> {booking.shipment?.from} ➔ {booking.shipment?.to}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Payload:</span> {booking.weight} kg • {booking.space} m³
                  </p>
                  <p className="text-slate-600 pt-1">
                    <span className="font-semibold">{user?.role === "business" ? "Driver:" : "Business:"}</span>{" "}
                    {user?.role === "business"
                      ? `${booking.driver?.name} (${booking.driver?.contact || "N/A"})`
                      : `${booking.business?.name} (${booking.business?.contact || "N/A"})`}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
