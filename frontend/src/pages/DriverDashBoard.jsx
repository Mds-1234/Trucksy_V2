import { useState, useEffect } from "react";
import RouteForm from "../components/RouteForm";
import { getUserBookings, getMatchSummary } from "../services/bookingService";
import { Link } from "react-router-dom";

const DriverDashboard = () => {
  const [matchCount, setMatchCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [summaryRes, bookingsRes] = await Promise.all([
          getMatchSummary(),
          getUserBookings()
        ]);
        setMatchCount(summaryRes.count || 0);
        const pending = (bookingsRes || []).filter((b) => b.status === "pending");
        setPendingCount(pending.length);
      } catch (err) {
        console.error("Failed to load driver dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

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

      <div className="dashboard-panel">
        <h2>Driver Dashboard</h2>
        <p className="auth-subtitle">Add routes and manage your schedule.</p>
        <RouteForm />
      </div>
    </div>
  );
};

export default DriverDashboard;
