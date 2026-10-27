import { useState, useEffect } from "react";
import ShipmentForm from "../components/ShipmentForm";
import { getMatches, getUserBookings } from "../services/bookingService";
import { getUserShipments } from "../services/shipmentService";
import { Link } from "react-router-dom";
import Card, { CardHeader, CardBody } from "../components/Card";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";

const BusinessDashboard = () => {
  const [matchCount, setMatchCount] = useState(0);
  const [openShipmentsCount, setOpenShipmentsCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setError("");
      try {
        const [matchesRes, shipmentsRes, bookingsRes] = await Promise.all([
          getMatches(),
          getUserShipments(),
          getUserBookings()
        ]);
        if (isMounted) {
          const activeMatches = (matchesRes || []).filter(
            (m) =>
              m.shipment?.status === "open" &&
              m.route?.status === "open" &&
              m.shipment?.status !== "delivered" &&
              m.route?.status !== "completed"
          );
          setMatchCount(activeMatches.length);

          const openShipments = (shipmentsRes || []).filter(
            (s) => s.status === "open"
          );
          setOpenShipmentsCount(openShipments.length);

          const pendingBookings = (bookingsRes || []).filter(
            (b) =>
              b.status === "pending" &&
              b.shipment?.status !== "delivered" &&
              b.route?.status !== "completed"
          );
          setPendingBookingsCount(pendingBookings.length);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || "Failed to load business dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  if (loading) {
    return <div className="py-20 text-center text-sm font-medium text-slate-500">Loading business dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Dashboard"
        subtitle="Manage shipments, find active routes, and coordinate cargo transport."
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
            <span className="text-sm font-medium text-slate-500">Open Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{openShipmentsCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Shipments waiting for route booking
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Available Matches</span>
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
            Drivers available on your cargo routes
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{pendingBookingsCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Requests sent to drivers for confirmation
          </p>
        </Card>
      </div>

      {matchCount > 0 && (
        <Alert type="info" title="Match Found!">
          You have <span className="font-semibold">{matchCount}</span> unbooked match{matchCount > 1 ? "es" : ""} for your cargo.{" "}
          <Link to="/bookings" className="font-semibold underline hover:text-indigo-900">
            Go to Bookings
          </Link>{" "}
          to review route details and book the driver.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Add a New Shipment</h2>
          <p className="text-xs text-slate-500">Submit cargo specifications to discover available drivers along the route.</p>
        </CardHeader>
        <CardBody className="p-6">
          <ShipmentForm />
        </CardBody>
      </Card>
    </div>
  );
};

export default BusinessDashboard;
