import { useState, useEffect, useContext, useMemo } from "react";
import {
  getUserBookings,
  getMatches,
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking
} from "../services/bookingService";
import { completeRouteStop, completeRoute } from "../services/routeService";
import { AuthContext } from "../context/AuthContext";

const getTruckLocation = (route, shipment, deliveryReached, status) => {
  if (status === "completed" || deliveryReached) {
    return shipment?.to || "Destination";
  }

  const nodes = [route?.from, ...(route?.stops || []), route?.to];
  const completedStops = route?.completedStops || [];
  if (completedStops.length === 0) {
    return nodes[0] || "N/A";
  }

  const maxCompletedIdx = Math.max(...completedStops);
  return nodes[maxCompletedIdx + 1] || nodes[nodes.length - 1] || "N/A";
};

const getStatusColor = (booking) => {
  if (booking.status === "completed" || booking.deliveryReached) return "#4caf50";
  if (booking.status === "accepted") return "#2196f3";
  if (booking.status === "rejected") return "#ff9800";
  return "var(--primary-color)";
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableMatches, setAvailableMatches] = useState([]);
  const [driverTab, setDriverTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [inFlight, setInFlight] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    const load = async (isPoll = false) => {
      if (isPoll && typeof document !== "undefined" && document.hidden) {
        return;
      }

      try {
        const userBookings = await getUserBookings();
        if (isMounted) {
          setBookings(userBookings || []);
        }

        if (user?.role === "business") {
          const matches = await getMatches();
          if (isMounted) {
            setAvailableMatches(matches || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err.response?.data?.error?.message || "Failed to load bookings");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load(false);
    const interval = setInterval(() => load(true), 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, refreshCount]);

  const handleBookNow = async (match) => {
    const key = `book-${match.route.id}-${match.shipment.id}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await createBooking(match.route.id, match.shipment.id);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to book";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAccept = async (bookingId) => {
    const key = `accept-${bookingId}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await acceptBooking(bookingId);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to accept booking";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleReject = async (bookingId) => {
    const key = `reject-${bookingId}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await rejectBooking(bookingId);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to reject booking";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCancel = async (bookingId) => {
    const key = `cancel-${bookingId}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await cancelBooking(bookingId);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to cancel booking";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCompleteStop = async (routeId, stopIndex) => {
    const key = `stop-${routeId}-${stopIndex}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await completeRouteStop(routeId, stopIndex);
      const updatedBookings = await getUserBookings();
      setBookings(updatedBookings || []);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to complete stop";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCompleteTrip = async (routeId) => {
    const key = `trip-${routeId}`;
    if (inFlight[key]) return;

    setActionError("");
    setInFlight((prev) => ({ ...prev, [key]: true }));

    try {
      await completeRoute(routeId);
      const updatedBookings = await getUserBookings();
      setBookings(updatedBookings || []);
      setRefreshCount((c) => c + 1);
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || "Failed to complete trip";
      const details = err.response?.data?.error?.details;
      setActionError(details ? `${serverMsg}: ${details}` : serverMsg);
      setRefreshCount((c) => c + 1);
    } finally {
      setInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "pending" &&
          b.route?.status !== "completed" &&
          b.shipment?.status !== "delivered"
      ),
    [bookings]
  );

  const acceptedBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "accepted" &&
          b.route?.status !== "completed" &&
          b.shipment?.status !== "delivered"
      ),
    [bookings]
  );

  const groupedActiveRoutes = useMemo(() => {
    const map = {};
    bookings
      .filter(
        (b) =>
          b.status === "accepted" &&
          b.route?.status !== "completed" &&
          b.shipment?.status !== "delivered"
      )
      .forEach((b) => {
        const routeId = b.route?.id || b.route?._id;
        if (!routeId) return;
        if (!map[routeId]) {
          map[routeId] = {
            route: b.route,
            bookings: []
          };
        }
        map[routeId].bookings.push(b);
      });
    return Object.values(map);
  }, [bookings]);

  const rejectedCount = useMemo(
    () => bookings.filter((b) => b.status === "rejected").length,
    [bookings]
  );

  const businessActiveBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.status === "pending" || b.status === "accepted") &&
          b.status !== "completed" &&
          b.route?.status !== "completed" &&
          b.shipment?.status !== "delivered"
      ),
    [bookings]
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-panel">
        <h2>{user?.role === "driver" ? "Trip Requests & Schedule" : "Bookings"}</h2>
        <p className="auth-subtitle">
          {user?.role === "driver"
            ? "Manage incoming booking requests and active trips."
            : "Find matches and track the status of your shipments."}
        </p>

        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {actionError}
          </div>
        )}

        {pageError && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {pageError}
          </div>
        )}

        {user?.role === "business" && rejectedCount > 0 && (
          <div className="alert" style={{ backgroundColor: "rgba(255, 152, 0, 0.1)", border: "1px solid #ff9800", color: "var(--text-primary)", marginBottom: "1rem" }}>
            <strong>Booking Notice:</strong> {rejectedCount} booking request{rejectedCount > 1 ? "s were" : " was"} not accepted or capacity was exhausted. Please book another available match.
          </div>
        )}

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <>
            {user?.role === "driver" && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button
                  className="btn"
                  onClick={() => setDriverTab("pending")}
                  style={{
                    background: driverTab === "pending" ? "var(--primary-color)" : "transparent",
                    border: "1px solid var(--primary-color)"
                  }}
                >
                  Pending ({pendingBookings.length})
                </button>
                <button
                  className="btn"
                  onClick={() => setDriverTab("active")}
                  style={{
                    background: driverTab === "active" ? "#2196f3" : "transparent",
                    border: "1px solid #2196f3"
                  }}
                >
                  Active Trips ({groupedActiveRoutes.length}) • {acceptedBookings.length} Bookings
                </button>
              </div>
            )}

            <div className="matches-grid">
              {user?.role === "business" && availableMatches.map((match, idx) => {
                const routeId = match.route.id || match.route._id;
                const shipmentId = match.shipment.id || match.shipment._id;
                const isBooking = !!inFlight[`book-${routeId}-${shipmentId}`];

                return (
                  <div key={`match-${idx}`} className="card booking-card" style={{ border: "1px solid var(--primary-color)" }}>
                    <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                      <h4>Status: <span style={{ color: "var(--text-secondary)" }}>AVAILABLE MATCH</span></h4>
                    </div>
                    <div className="card-body" style={{ marginTop: "10px" }}>
                      <p><strong>Route:</strong> {match.route.from} ➔ {match.route.to} (Capacity: {match.route.capacity}kg, Space: {match.route.space}m³)</p>
                      <p><strong>Departure Date:</strong> {match.route.date || "N/A"}</p>
                      <p style={{ color: "#4caf50", fontWeight: "500" }}>
                        <strong>Estimated Reach Date:</strong> {match.route.endDate || match.route.date || "N/A"}
                      </p>
                      {match.route.stops?.length > 0 && <p><strong>Stops:</strong> {match.route.stops.join(" ➔ ")}</p>}
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Shipment:</strong> {match.shipment.from} ➔ {match.shipment.to} (Weight: {match.shipment.weight}kg, Space: {match.shipment.space}m³)</p>
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Driver:</strong> {match.driver?.name || "Driver"} ({match.driver?.contact || "N/A"})</p>
                    </div>
                    <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleBookNow(match)}
                        disabled={isBooking}
                      >
                        {isBooking ? "Booking..." : "Book Now"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {user?.role === "driver" && driverTab === "pending" && pendingBookings.map((booking) => {
                const isProcessing = !!inFlight[`accept-${booking.id}`] || !!inFlight[`reject-${booking.id}`];

                return (
                  <div key={booking.id} className="card booking-card">
                    <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                      <h4>Status: <span style={{ color: "var(--primary-color)" }}>PENDING</span></h4>
                    </div>
                    <div className="card-body" style={{ marginTop: "10px" }}>
                      <p><strong>Route:</strong> {booking.route?.from} ➔ {booking.route?.to} (Space: {booking.route?.space}m³)</p>
                      <p><strong>Departure Date:</strong> {booking.route?.date || "N/A"}</p>
                      <p style={{ color: "#4caf50", fontWeight: "500" }}>
                        <strong>Expected Reach Date:</strong> {booking.route?.endDate || booking.route?.date || "N/A"}
                      </p>
                      {booking.route?.stops?.length > 0 && <p><strong>Stops:</strong> {booking.route.stops.join(" ➔ ")}</p>}
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Shipment:</strong> {booking.shipment?.from} ➔ {booking.shipment?.to} (Weight: {booking.weight}kg, Space: {booking.space}m³)</p>
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Business:</strong> {booking.business?.name} ({booking.business?.contact})</p>
                    </div>
                    <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "10px" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAccept(booking.id)}
                        disabled={isProcessing}
                        style={{ background: "#2196f3", borderColor: "#2196f3", flex: 1 }}
                      >
                        {inFlight[`accept-${booking.id}`] ? "Accepting..." : "Accept Booking"}
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleReject(booking.id)}
                        disabled={isProcessing}
                        style={{ background: "#f44336", borderColor: "#f44336", flex: 1 }}
                      >
                        {inFlight[`reject-${booking.id}`] ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {user?.role === "driver" && driverTab === "pending" && pendingBookings.length === 0 && (
                <p>No pending booking requests at this time.</p>
              )}

              {user?.role === "driver" && driverTab === "active" && groupedActiveRoutes.map(({ route, bookings: group }) => {
                const routeId = route.id || route._id;
                const completedStops = route.completedStops || [];
                const canCompleteTrip = (route.stops?.length || 0) === completedStops.length;
                const tripSegments = [...new Set(group.map((b) => `${b.shipment?.from} ➔ ${b.shipment?.to}`))];
                const businessNames = [...new Set(group.map((b) => b.business?.name).filter(Boolean))];
                const isTripCompleting = !!inFlight[`trip-${routeId}`];

                return (
                  <div key={routeId} className="card booking-card">
                    <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                      <h4>Status: <span style={{ color: "#2196f3" }}>ACTIVE TRIP ({route.status.toUpperCase()})</span></h4>
                    </div>
                    <div className="card-body" style={{ marginTop: "10px" }}>
                      <p><strong>Route:</strong> {route.from} ➔ {route.to} (Space: {route.space}m³)</p>
                      <p><strong>Departure Date:</strong> {route.date || "N/A"}</p>
                      <p style={{ color: "#4caf50", fontWeight: "500" }}>
                        <strong>Trip End Date (Estimated Arrival):</strong> {route.endDate || route.date || "N/A"}
                      </p>
                      {route.stops?.length > 0 && <p><strong>Stops:</strong> {route.stops.join(" ➔ ")}</p>}
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Trip Segments:</strong> {tripSegments.join(", ")}</p>
                      <p><strong>Businesses:</strong> {businessNames.join(", ")}</p>
                      <p><strong>Total Deliveries on Truck:</strong> {group.length}</p>

                      <div style={{ marginTop: "15px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <h4 style={{ marginBottom: "10px", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          Active Deliveries in this Trip ({group.length}):
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {group.map((b, bIdx) => (
                            <div
                              key={b.id || bIdx}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "6px",
                                padding: "10px 12px"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <strong style={{ color: "var(--text-primary)" }}>
                                  Delivery #{bIdx + 1}: {b.business?.name || "Business"}
                                </strong>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    background: b.deliveryReached ? "rgba(76, 175, 80, 0.2)" : "rgba(33, 150, 243, 0.2)",
                                    color: b.deliveryReached ? "#4caf50" : "#2196f3"
                                  }}
                                >
                                  {b.deliveryReached ? "DESTINATION REACHED" : "IN TRANSIT"}
                                </span>
                              </div>
                              <p style={{ margin: "3px 0", fontSize: "0.88rem" }}>
                                <strong>Shipment:</strong> {b.shipment?.from} ➔ {b.shipment?.to}
                              </p>
                              <p style={{ margin: "3px 0", fontSize: "0.88rem" }}>
                                <strong>Load:</strong> {b.weight} kg | {b.space} m³
                              </p>
                              <p style={{ margin: "3px 0", fontSize: "0.88rem" }}>
                                <strong>Contact:</strong> {b.business?.contact || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      {route.stops?.length > 0 && (
                        <div style={{ marginBottom: "15px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Shared Intermediate Stops Checklist:</p>
                          {route.stops.map((stop, idx) => {
                            const isCompleted = completedStops.includes(idx);
                            const isNextInOrder = idx === completedStops.length;
                            const isUpdatingStop = !!inFlight[`stop-${routeId}-${idx}`];

                            return (
                              <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  disabled={isCompleted || !isNextInOrder || isUpdatingStop}
                                  onChange={() => handleCompleteStop(routeId, idx)}
                                  style={{ marginRight: "10px", width: "16px", height: "16px", cursor: isCompleted || !isNextInOrder ? "not-allowed" : "pointer" }}
                                />
                                <span style={{ textDecoration: isCompleted ? "line-through" : "none", color: isCompleted ? "var(--text-secondary)" : "inherit" }}>
                                  {stop} {isCompleted ? "(Completed)" : isNextInOrder ? "(Next)" : "(Pending previous stops)"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleCompleteTrip(routeId)}
                        style={{ background: "#4caf50", borderColor: "#4caf50" }}
                        disabled={!canCompleteTrip || isTripCompleting}
                      >
                        {isTripCompleting ? "Completing Trip..." : canCompleteTrip ? "Complete Trip (All Deliveries)" : "Complete All Stops First"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {user?.role === "driver" && driverTab === "active" && groupedActiveRoutes.length === 0 && (
                <p>No active trips found.</p>
              )}

              {user?.role === "business" && businessActiveBookings.map((booking) => {
                const isCancelling = !!inFlight[`cancel-${booking.id}`];
                const truckLocation = getTruckLocation(booking.route, booking.shipment, booking.deliveryReached, booking.status);
                const progressText = booking.deliveryReached
                  ? "Delivered at Destination"
                  : `In Transit (destination: ${booking.shipment?.to || "N/A"})`;

                return (
                  <div key={booking.id} className="card booking-card">
                    <div className="card-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                      <h4>
                        Status:{" "}
                        <span style={{ color: getStatusColor(booking) }}>
                          {(booking.status === "accepted" && booking.deliveryReached)
                            ? "DELIVERY REACHED"
                            : booking.status.toUpperCase()}
                        </span>
                      </h4>
                    </div>
                    <div className="card-body" style={{ marginTop: "10px" }}>
                      <p><strong>Route:</strong> {booking.route?.from} ➔ {booking.route?.to} (Space: {booking.route?.space}m³)</p>
                      <p><strong>Departure Date:</strong> {booking.route?.date || "N/A"}</p>
                      <p style={{ color: "#4caf50", fontWeight: "500" }}>
                        <strong>Expected Reach Date:</strong> {booking.route?.endDate || booking.route?.date || "N/A"}
                      </p>
                      {booking.route?.stops?.length > 0 && <p><strong>Stops:</strong> {booking.route.stops.join(" ➔ ")}</p>}
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Shipment:</strong> {booking.shipment?.from} ➔ {booking.shipment?.to} (Weight: {booking.weight}kg, Space: {booking.space}m³)</p>
                      <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                      <p><strong>Driver:</strong> {booking.driver?.name || "Driver"} ({booking.driver?.contact || "N/A"})</p>
                      {booking.status === "accepted" && (
                        <>
                          <hr style={{ margin: "10px 0", borderColor: "rgba(255,255,255,0.1)" }} />
                          <p><strong>Truck Current Location:</strong> {truckLocation}</p>
                          <p><strong>Trip Progress:</strong> {progressText}</p>
                        </>
                      )}
                    </div>
                    {booking.status === "pending" && (
                      <div className="card-footer" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <button
                          className="btn"
                          onClick={() => handleCancel(booking.id)}
                          disabled={isCancelling}
                          style={{ background: "#f44336", borderColor: "#f44336", width: "100%" }}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Request"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {user?.role === "business" && businessActiveBookings.length === 0 && availableMatches.length === 0 && (
                <p>No active bookings or matches found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bookings;
