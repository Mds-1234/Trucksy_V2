import { useState } from "react";
import { addShipment } from "../services/shipmentService";

const ShipmentForm = () => {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    weight: "",
    space: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      await addShipment({
        from: form.from,
        to: form.to,
        date: form.date,
        weight: Number(form.weight),
        space: Number(form.space)
      });
      setSuccess("Shipment added successfully!");
      setForm({ from: "", to: "", date: "", weight: "", space: "" });
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message;
      const details = err.response?.data?.error?.details;
      let errorText = serverMessage || "Failed to add shipment";
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
        <label>Weight (kg)</label>
        <input
          placeholder="e.g. 2000"
          type="number"
          required
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Space (m³)</label>
        <input
          placeholder="e.g. 15"
          type="number"
          required
          value={form.space}
          onChange={(e) => setForm({ ...form, space: e.target.value })}
        />
      </div>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Shipment"}
      </button>
    </form>
  );
};

export default ShipmentForm;
