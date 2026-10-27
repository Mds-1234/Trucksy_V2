import { useState, useEffect } from "react";
import ShipmentForm from "../components/ShipmentForm";
import { getMatches } from "../services/bookingService";
import { Link } from "react-router-dom";

const BusinessDashboard = () => {
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matches = await getMatches();
        const activeMatches = (matches || []).filter(
          (m) =>
            m.shipment?.status === "open" &&
            m.route?.status === "open" &&
            m.shipment?.status !== "delivered" &&
            m.route?.status !== "completed"
        );
        setMatchCount(activeMatches.length);
      } catch (err) {
        console.error("Failed to load match count", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="dashboard-container">
      {!loading && matchCount > 0 && (
        <div className="alert" style={{ backgroundColor: "rgba(33, 150, 243, 0.1)", border: "1px solid #2196f3", color: "var(--text-primary)" }}>
          <strong>Match Found!</strong> You have {matchCount} unbooked match{matchCount > 1 ? "es" : ""} for your shipments. <Link to="/bookings" style={{ color: "#2196f3", textDecoration: "underline" }}>Go to Bookings</Link> to book the driver.
        </div>
      )}
      <div className="dashboard-panel">
        <h2>Business Dashboard</h2>
        <p className="auth-subtitle">Add shipments and monitor your logistics.</p>
        <ShipmentForm />
      </div>
    </div>
  );
};

export default BusinessDashboard;
