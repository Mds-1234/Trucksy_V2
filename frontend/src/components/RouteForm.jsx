import { useState } from "react";
import { addRoute } from "../services/routeService";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert";

const RouteForm = ({ onRouteAdded, disabled, activeTripNotice }) => {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    endDate: "",
    capacity: "",
    space: "",
    stops: []
  });
  const [stopInput, setStopInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setForm((prev) => ({
      ...prev,
      date: newDate,
      endDate: !prev.endDate || prev.endDate < newDate ? newDate : prev.endDate
    }));
  };

  const handleAddStop = () => {
    if (stopInput.trim() !== "") {
      setForm((prev) => ({ ...prev, stops: [...prev.stops, stopInput.trim()] }));
      setStopInput("");
    }
  };

  const handleRemoveStop = (index) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      await addRoute({
        from: form.from,
        to: form.to,
        stops: form.stops,
        date: form.date,
        endDate: form.endDate || form.date,
        capacity: Number(form.capacity),
        space: Number(form.space)
      });
      setSuccess("Route created successfully! It is now open for matching.");
      setForm({ from: "", to: "", date: "", endDate: "", capacity: "", space: "", stops: [] });
      setStopInput("");
      if (onRouteAdded) {
        onRouteAdded();
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error?.message;
      const details = err.response?.data?.details || err.response?.data?.error?.details;
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

      {disabled && activeTripNotice && (
        <Alert type="warning" title="Active Trip In Progress">
          {activeTripNotice}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Origin City"
          placeholder="e.g. Delhi"
          required
          disabled={disabled}
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
        />

        <Input
          label="Destination City"
          placeholder="e.g. Jaipur"
          required
          disabled={disabled}
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 block">
          Intermediate Stops (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a stop along the journey (e.g. Gurgaon)"
            disabled={disabled}
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddStop();
              }
            }}
            className="flex-1 px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={disabled || !stopInput.trim()}
            onClick={handleAddStop}
          >
            Add Stop
          </Button>
        </div>

        {form.stops.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {form.stops.map((stop, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  {index + 1}
                </span>
                <span>{stop}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(index)}
                  disabled={disabled}
                  className="text-slate-400 hover:text-rose-600 focus:outline-none"
                  aria-label={`Remove stop ${stop}`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Trip Departure Date"
          type="date"
          required
          disabled={disabled}
          value={form.date}
          onChange={handleDateChange}
        />

        <Input
          label="Trip End Date (Estimated Arrival)"
          type="date"
          required
          disabled={disabled}
          min={form.date || undefined}
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Payload Capacity (kg)"
          type="number"
          placeholder="e.g. 2500"
          helperText="Maximum cargo weight the truck can carry"
          required
          disabled={disabled}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />

        <Input
          label="Available Space (m³)"
          type="number"
          placeholder="e.g. 20"
          helperText="Volume capacity in cubic meters"
          required
          disabled={disabled}
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
          disabled={disabled || loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Adding Route..." : disabled ? "Active Trip in Progress" : "Add Route"}
        </Button>
      </div>
    </form>
  );
};

export default RouteForm;
