import { useState } from "react";
import { addRoute } from "../services/routeService";

const RouteForm = () => {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    capacity: "",
    space: "",
    stops: []
  });
  const [stopInput, setStopInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      await addRoute({
        from: form.from,
        to: form.to,
        stops: form.stops,
        date: form.date,
        capacity: Number(form.capacity),
        space: Number(form.space)
      });
      setSuccess("Route added successfully!");
      setForm({ from: "", to: "", date: "", capacity: "", space: "", stops: [] });
      setStopInput("");
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message;
      const details = err.response?.data?.error?.details;
      let errorText = serverMessage || "Failed to add route";
      if (Array.isArray(details)) {
        errorText = details.map((d) => `${d.field ? d.field + ": " : ""}${d.message}`).join(", ");
      } else if (typeof details === "string") {
        errorText += `: ${details}`;
      }
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: "1rem" }}>
      {success && (
        <div className="alert" style={{ backgroundColor: "rgba(76, 175, 80, 0.15)", border: "1px solid #4caf50", color: "#4caf50", marginBottom: "1rem" }}>
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Origin</label>
        <input
          placeholder="From (e.g. Delhi)"
          required
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Intermediate Stops</label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            placeholder="Add a stop (e.g., Agra)"
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (stopInput.trim() !== "") {
                setForm({ ...form, stops: [...form.stops, stopInput.trim()] });
                setStopInput("");
              }
            }}
          >
            Add Stop
          </button>
        </div>
        {form.stops.length > 0 && (
          <ul style={{ listStyleType: "none", padding: 0, margin: "0 0 1rem 0" }}>
            {form.stops.map((stop, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 10px",
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: "5px",
                  borderRadius: "4px"
                }}
              >
                <span>{index + 1}. {stop}</span>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer" }}
                  onClick={() => {
                    const newStops = form.stops.filter((_, i) => i !== index);
                    setForm({ ...form, stops: newStops });
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label>Destination</label>
        <input
          placeholder="To (e.g. Jaipur)"
          required
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Trip Date</label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Capacity (kg)</label>
        <input
          placeholder="e.g. 5000"
          type="number"
          required
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Available Space (m³)</label>
        <input
          placeholder="e.g. 25"
          type="number"
          required
          value={form.space}
          onChange={(e) => setForm({ ...form, space: e.target.value })}
        />
      </div>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Route"}
      </button>
    </form>
  );
};

export default RouteForm;
