import { useState, useEffect } from "react";
import RouteForm from "../components/RouteForm";
import { getUserBookings, getMatchSummary } from "../services/bookingService";
import { getUserRoutes } from "../services/routeService";
import { Link } from "react-router-dom";

const DriverDashboard = () => {
  const [matchCount, setMatchCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const [summaryRes, bookingsRes, routesRes] = await Promise.all([
          getMatchSummary(),
          getUserBookings(),
          getUserRoutes()
        ]);
        if (isMounted) {
          setMatchCount(summaryRes?.count || 0);
          const pending = (bookingsRes || []).filter((b) => b.status === "pending");
          setPendingCount(pending.length);

          const active = (routesRes || []).find(
            (r) => r.status === "open" || r.status === "in_progress"
          );
          setActiveRoute(active || null);
        }
      } catch (err) {
        console.error("Failed to load driver dashboard data", err);
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

  return (
    <div className="dashboard-container">
      {!loading && pendingCount > 0 && (
        <div className="alert" style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid #4caf50", color: "var(--text-primary)" }}>
          <strong>Action Required!</strong> You have {pendingCount} pending booking request{pendingCount > 1 ? "s" : ""}. <Link to="/bookings" style={{ color: "#4caf50", textDecoration: "underline" }}>Go to Bookings</Link> to accept.
        </div>
      )}

      {!loading && matchCount > 0 && pendingCount === 0 && (
        <div className="alert" style={{ backgroundColor: "rgba(33, 150, 243, 0.1)", border: "1px solid #2196f3", color: "var(--text-primary)" }}>
          <strong>Match Found!</strong> There {matchCount > 1 ? "are" : "is"} {matchCount} matching shipment{matchCount > 1 ? "s" : ""} for your routes in the system. A business may book you soon!
        </div>
      )}

      {!loading && activeRoute && (
        <div className="card booking-card" style={{ border: "1px solid #2196f3", marginBottom: "1.5rem" }}>
          <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Active Trip: <span style={{ color: "#2196f3" }}>{activeRoute.from} ➔ {activeRoute.to}</span></h4>
            <span style={{ fontSize: "0.85rem", padding: "4px 8px", borderRadius: "4px", background: "rgba(33, 150, 243, 0.2)", color: "#2196f3" }}>
              {activeRoute.status.toUpperCase()}
            </span>
          </div>
          <div className="card-body" style={{ marginTop: "10px" }}>
            <p><strong>Departure Date:</strong> {activeRoute.date || "N/A"}</p>
            <p style={{ color: "#4caf50", fontSize: "1.05rem" }}>
              <strong>Trip End Date (Estimated Arrival):</strong> {activeRoute.endDate || activeRoute.date || "N/A"}
            </p>
            {activeRoute.stops?.length > 0 && (
              <p><strong>Intermediate Stops:</strong> {activeRoute.stops.join(" ➔ ")}</p>
            )}
            <p><strong>Available Capacity:</strong> {activeRoute.capacity} kg | <strong>Space:</strong> {activeRoute.space} m³</p>
          </div>
          <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Link to="/bookings" className="btn btn-primary" style={{ background: "#2196f3", borderColor: "#2196f3", textDecoration: "none", display: "inline-block" }}>
              Manage Deliveries & Stops in Bookings
            </Link>
          </div>
        </div>
      )}

      <div className="dashboard-panel">
        <h2>Driver Dashboard</h2>
        <p className="auth-subtitle">Add routes and manage your schedule.</p>
        <RouteForm
          onRouteAdded={() => setRefreshCount((c) => c + 1)}
          disabled={!!activeRoute}
          activeTripNotice={
            activeRoute
              ? `You currently have an active trip (${activeRoute.from} ➔ ${activeRoute.to}) scheduled to complete on ${activeRoute.endDate || activeRoute.date}. Drivers can only do one trip at a time.`
              : ""
          }
        />
      </div>
    </div>
  );
};

export default DriverDashboard;
