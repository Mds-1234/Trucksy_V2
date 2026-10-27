import { useState, useEffect } from "react";
import { getUserRoutes, deleteRoute } from "../services/routeService";

const MyRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRoutes = async () => {
      try {
        const data = await getUserRoutes();
        if (isMounted) {
          setRoutes(data);
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
  }, []);

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
    <div className="dashboard-container">
      <div className="dashboard-panel">
        <h2>My Routes</h2>
        <p className="auth-subtitle">Manage your posted routes and review their status.</p>

        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {actionError}
          </div>
        )}

        {loading ? (
          <p>Loading routes...</p>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : routes.length === 0 ? (
          <p>You have not created any routes yet.</p>
        ) : (
          <div className="matches-grid">
            {routes.map((r) => (
              <div key={r.id} className="card booking-card">
                <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>
                    Status:{" "}
                    <span
                      className="status-badge"
                      style={{
                        fontSize: "0.85rem",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        background:
                          r.status === "completed"
                            ? "rgba(76, 175, 80, 0.2)"
                            : r.status === "in_progress"
                            ? "rgba(33, 150, 243, 0.2)"
                            : "rgba(79, 70, 229, 0.2)",
                        color:
                          r.status === "completed"
                            ? "#4caf50"
                            : r.status === "in_progress"
                            ? "#2196f3"
                            : "var(--primary-color)"
                      }}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </h4>
                </div>
                <div className="card-body" style={{ marginTop: "10px" }}>
                  <p><strong>From:</strong> {r.from}</p>
                  <p><strong>To:</strong> {r.to}</p>
                  <p><strong>Departure Date:</strong> {r.date || "N/A"}</p>
                  <p style={{ color: "#4caf50" }}><strong>Trip End Date:</strong> {r.endDate || r.date || "N/A"}</p>
                  {r.stops?.length > 0 && (
                    <p><strong>Stops:</strong> {r.stops.join(" ➔ ")}</p>
                  )}
                  <p><strong>Capacity:</strong> {r.capacity} kg</p>
                  <p><strong>Space:</strong> {r.space} m³</p>
                </div>
                {r.status === "open" && (
                  <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <button
                      className="btn"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      style={{ background: "#f44336", borderColor: "#f44336", width: "100%" }}
                    >
                      {deletingId === r.id ? "Deleting..." : "Delete Route"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoutes;
