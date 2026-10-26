import { useState, useEffect } from "react";
import { getUserShipments, deleteShipment } from "../services/shipmentService";

const MyShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchShipments = async () => {
      try {
        const data = await getUserShipments();
        if (isMounted) {
          setShipments(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || "Failed to load shipments");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShipments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    setActionError("");
    setDeletingId(id);
    try {
      await deleteShipment(id);
      setShipments((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message || "Failed to delete shipment";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMessage}: ${details}` : serverMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-panel">
        <h2>My Shipments</h2>
        <p className="auth-subtitle">Manage your added shipments and monitor their status.</p>

        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {actionError}
          </div>
        )}

        {loading ? (
          <p>Loading shipments...</p>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : shipments.length === 0 ? (
          <p>You have not created any shipments yet.</p>
        ) : (
          <div className="matches-grid">
            {shipments.map((s) => (
              <div key={s.id} className="card booking-card">
                <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                  <h4>Status: <span style={{ color: s.status === "delivered" ? "#4caf50" : s.status === "booked" ? "#2196f3" : "var(--primary-color)" }}>{s.status.toUpperCase()}</span></h4>
                </div>
                <div className="card-body" style={{ marginTop: "10px" }}>
                  <p><strong>From:</strong> {s.from}</p>
                  <p><strong>To:</strong> {s.to}</p>
                  <p><strong>Date:</strong> {s.date || "N/A"}</p>
                  <p><strong>Weight:</strong> {s.weight} kg</p>
                  <p><strong>Space:</strong> {s.space} m³</p>
                </div>
                <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <button
                    className="btn"
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    style={{ background: "#f44336", borderColor: "#f44336", width: "100%" }}
                  >
                    {deletingId === s.id ? "Deleting..." : "Delete Shipment"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShipments;
