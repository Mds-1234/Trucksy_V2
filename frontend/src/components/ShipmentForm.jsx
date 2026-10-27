import { useState } from "react";
import { addShipment } from "../services/shipmentService";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert";

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
      setSuccess("Shipment added successfully! Matching routes will appear in Bookings.");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <Alert type="success" title="Success">
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Pickup City (Origin)"
          placeholder="e.g. Delhi"
          required
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
        />

        <Input
          label="Dropoff City (Destination)"
          placeholder="e.g. Jaipur"
          required
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Desired Shipping Date"
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <Input
          label="Cargo Weight (kg)"
          type="number"
          placeholder="e.g. 500"
          helperText="Total weight of goods"
          required
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />

        <Input
          label="Required Space (m³)"
          type="number"
          placeholder="e.g. 5"
          helperText="Cargo volume needed"
          required
          value={form.space}
          onChange={(e) => setForm({ ...form, space: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Adding Shipment..." : "Add Shipment"}
        </Button>
      </div>
    </form>
  );
};

export default ShipmentForm;
