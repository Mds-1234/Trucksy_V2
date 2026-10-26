import { useState, useEffect, useContext } from "react";
import { getUserBookings } from "../services/bookingService";
import { AuthContext } from "../context/AuthContext";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const bookingsData = await getUserBookings();
        const completedTrips = (bookingsData || []).filter((b) => b.status === "completed");
        setHistory(completedTrips);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-panel">
        <h2>Trip History</h2>
        <p className="auth-subtitle">Review all of your completed trips and deliveries.</p>

        {loading ? (
          <p>Loading history...</p>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : history.length === 0 ? (
          <p>You have no completed trips yet.</p>
        ) : (
          <div className="matches-grid">
            {history.map((booking) => (
              <div key={booking.id} className="card booking-card" style={{ opacity: 0.9 }}>
                <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                  <h4>Status: <span style={{ color: "#4caf50" }}>{booking.status.toUpperCase()}</span></h4>
                </div>
                <div className="card-body" style={{ marginTop: "10px" }}>
                  <p><strong>Route:</strong> {booking.route?.from} ➔ {booking.route?.to}</p>
                  <p><strong>Departure Date:</strong> {booking.route?.date || "N/A"}</p>
                  <p><strong>Delivered Date:</strong> {booking.route?.endDate || booking.route?.date || "N/A"}</p>
                  {booking.route?.stops?.length > 0 && (
                    <p><strong>Stops:</strong> {booking.route.stops.join(" ➔ ")}</p>
                  )}
                  <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                  <p><strong>Shipment:</strong> {booking.shipment?.from} ➔ {booking.shipment?.to}</p>
                  <p><strong>Weight:</strong> {booking.weight} kg, <strong>Space:</strong> {booking.space} m³</p>
                  <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                  {user?.role === "business" ? (
                    <p><strong>Driver:</strong> {booking.driver?.name} ({booking.driver?.contact})</p>
                  ) : (
                    <p><strong>Business:</strong> {booking.business?.name} ({booking.business?.contact})</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
