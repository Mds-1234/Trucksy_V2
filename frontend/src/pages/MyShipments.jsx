import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserShipments, deleteShipment } from "../services/shipmentService";
import Card, { CardHeader, CardBody, CardFooter } from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

const MyShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchShipments = async () => {
      try {
        const data = await getUserShipments();
        if (isMounted) {
          setShipments(data || []);
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
  }, [refreshCount]);

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
    <div className="space-y-6">
      <PageHeader
        title="My Shipments"
        subtitle="Manage your added shipments, check delivery status, and review active logistics."
        action={
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Shipment
          </Link>
        }
      />

      {actionError && (
        <Alert type="error" title="Action Failed">
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Spinner message="Loading your shipments..." className="py-20" />
      ) : error ? (
        <Alert
          type="error"
          title="Error"
          onRetry={() => {
            setLoading(true);
            setRefreshCount((c) => c + 1);
          }}
        >
          {error}
        </Alert>
      ) : shipments.length === 0 ? (
        <EmptyState
          title="No active shipments found"
          text="You have not created any shipments yet or your delivered shipments have moved to History."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add a Shipment Now
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shipments.map((s) => (
            <Card key={s.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <CardHeader className="flex items-center justify-between gap-2 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Shipment
                  </span>
                  <Badge status={s.status} />
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <span>{s.from}</span>
                    <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{s.to}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Date</span>
                      <span className="font-semibold text-slate-800">{s.date || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Weight</span>
                      <span className="font-semibold text-slate-800">{s.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Space</span>
                      <span className="font-semibold text-slate-800">{s.space} m³</span>
                    </div>
                  </div>
                </CardBody>
              </div>

              {s.status === "open" && (
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outlineDanger"
                    size="sm"
                    loading={deletingId === s.id}
                    disabled={deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                    className="w-full"
                  >
                    {deletingId === s.id ? "Deleting..." : "Delete Shipment"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShipments;
