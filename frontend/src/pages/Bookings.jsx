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
import Card, { CardHeader, CardBody, CardFooter } from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import RouteStepper from "../components/RouteStepper";

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
    const fetchBookingsData = async (isPoll = false) => {
      if (isPoll && typeof document !== "undefined" && document.hidden) {
        return;
      }

      try {
        const userBookings = await getUserBookings();
        if (!isMounted) return;
        setBookings(userBookings || []);

        if (user?.role === "business") {
          const matches = await getMatches();
          if (!isMounted) return;
          setAvailableMatches(matches || []);
        }
      } catch (err) {
        if (!isMounted) return;
        setPageError(err.response?.data?.error?.message || "Failed to load bookings");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookingsData(false);
    const interval = setInterval(() => fetchBookingsData(true), 20000);
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
    <div className="space-y-6">
      <PageHeader
        title={user?.role === "driver" ? "Trip Requests & Schedule" : "Bookings & Matches"}
        subtitle={
          user?.role === "driver"
            ? "Review incoming booking requests, manage deliveries, and tick stops along your journey."
            : "Review matching freight routes, book available drivers, and track cargo in transit."
        }
      />

      {actionError && (
        <Alert type="error" title="Action Error">
          {actionError}
        </Alert>
      )}

      {pageError && (
        <Alert
          type="error"
          title="Loading Error"
          onRetry={() => {
            setLoading(true);
            setRefreshCount((c) => c + 1);
          }}
        >
          {pageError}
        </Alert>
      )}

      {user?.role === "business" && rejectedCount > 0 && (
        <Alert type="warning" title="Booking Update">
          {rejectedCount} booking request{rejectedCount > 1 ? "s were" : " was"} not accepted or capacity was exhausted. Please select another available route below.
        </Alert>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-slate-500">Loading bookings and route matches...</div>
      ) : (
        <>
          {user?.role === "driver" && (
            <div className="space-y-6">
              <div className="flex">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDriverTab("pending")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      driverTab === "pending"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pending Requests ({pendingBookings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverTab("active")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      driverTab === "active"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Active Trips ({groupedActiveRoutes.length}) • {acceptedBookings.length} Bookings
                  </button>
                </div>
              </div>

              {driverTab === "pending" && (
                <>
                  {pendingBookings.length === 0 ? (
                    <EmptyState
                      title="No pending requests"
                      text="You have no incoming booking requests awaiting response at this time."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {pendingBookings.map((booking) => {
                        const isProcessing =
                          !!inFlight[`accept-${booking.id}`] ||
                          !!inFlight[`reject-${booking.id}`];

                        return (
                          <Card key={booking.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                              <CardHeader className="flex items-center justify-between gap-2 bg-slate-50/50">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                  Booking Request
                                </span>
                                <Badge status="pending" />
                              </CardHeader>
                              <CardBody className="space-y-4">
                                <div>
                                  <span className="text-xs text-slate-500 block mb-0.5">Your Route</span>
                                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                    <span>{booking.route?.from}</span>
                                    <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                    <span>{booking.route?.to}</span>
                                  </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                                  <span className="font-semibold text-slate-700 block">Shipment Cargo</span>
                                  <p className="text-slate-800">
                                    <span className="font-medium">Journey:</span> {booking.shipment?.from} ➔ {booking.shipment?.to}
                                  </p>
                                  <p className="text-slate-800">
                                    <span className="font-medium">Cargo Load:</span> {booking.weight} kg • {booking.space} m³
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                                  <div>
                                    <span className="text-slate-500 block">Departure</span>
                                    <span className="font-semibold text-slate-800">{booking.route?.date || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">Expected Arrival</span>
                                    <span className="font-semibold text-emerald-700">{booking.route?.endDate || booking.route?.date || "N/A"}</span>
                                  </div>
                                  <div className="col-span-2 pt-1">
                                    <span className="text-slate-500 block">Business Client</span>
                                    <span className="font-medium text-slate-800">
                                      {booking.business?.name} ({booking.business?.contact})
                                    </span>
                                  </div>
                                </div>
                              </CardBody>
                            </div>

                            <CardFooter className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                loading={inFlight[`accept-${booking.id}`]}
                                disabled={isProcessing}
                                onClick={() => handleAccept(booking.id)}
                                className="flex-1"
                              >
                                Accept Booking
                              </Button>
                              <Button
                                variant="outlineDanger"
                                size="sm"
                                loading={inFlight[`reject-${booking.id}`]}
                                disabled={isProcessing}
                                onClick={() => handleReject(booking.id)}
                                className="flex-1"
                              >
                                Reject
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {driverTab === "active" && (
                <>
                  {groupedActiveRoutes.length === 0 ? (
                    <EmptyState
                      title="No active trips in transit"
                      text="You do not have any trips currently in progress. Accept pending booking requests or add a new route."
                    />
                  ) : (
                    <div className="space-y-6">
                      {groupedActiveRoutes.map(({ route, bookings: group }) => {
                        const routeId = route.id || route._id;
                        const completedStops = route.completedStops || [];
                        const canCompleteTrip = (route.stops?.length || 0) === completedStops.length;
                        const tripSegments = [...new Set(group.map((b) => `${b.shipment?.from} ➔ ${b.shipment?.to}`))];
                        const businessNames = [...new Set(group.map((b) => b.business?.name).filter(Boolean))];
                        const isTripCompleting = !!inFlight[`trip-${routeId}`];

                        return (
                          <Card key={routeId} className="border-indigo-200 shadow-md">
                            <CardHeader className="bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-slate-900">
                                    {route.from} ➔ {route.to}
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    {group.length} Deliveries on Truck • {businessNames.join(", ")}
                                  </p>
                                </div>
                              </div>
                              <Badge status="in_progress" label="Active Trip" />
                            </CardHeader>

                            <CardBody className="space-y-6">
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                                  Route Journey Progress
                                </span>
                                <RouteStepper route={route} />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
                                <div>
                                  <span className="text-slate-500 block">Departure</span>
                                  <span className="font-semibold text-slate-800">{route.date || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Estimated Arrival</span>
                                  <span className="font-semibold text-emerald-700">{route.endDate || route.date || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Capacity Space</span>
                                  <span className="font-semibold text-slate-800">{route.space} m³</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Segments</span>
                                  <span className="font-semibold text-slate-800">{tripSegments.length} active</span>
                                </div>
                              </div>

                              {route.stops?.length > 0 && (
                                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Intermediate Stops Checklist:
                                  </h4>
                                  <div className="space-y-2">
                                    {route.stops.map((stop, idx) => {
                                      const isCompleted = completedStops.includes(idx);
                                      const isNextInOrder = idx === completedStops.length;
                                      const isUpdatingStop = !!inFlight[`stop-${routeId}-${idx}`];

                                      return (
                                        <label
                                          key={idx}
                                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm transition-colors ${
                                            isCompleted
                                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                                              : isNextInOrder
                                              ? "bg-white border-indigo-300 ring-1 ring-indigo-200 text-slate-900 cursor-pointer"
                                              : "bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed"
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isCompleted}
                                            disabled={isCompleted || !isNextInOrder || isUpdatingStop}
                                            onChange={() => handleCompleteStop(routeId, idx)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                          />
                                          <span className="flex-1 font-medium">
                                            {stop}
                                          </span>
                                          <span className="text-xs font-semibold">
                                            {isCompleted
                                              ? "✓ Reached"
                                              : isNextInOrder
                                              ? (isUpdatingStop ? "Updating..." : "Next Stop")
                                              : "Pending prior stop"}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                  Deliveries on Board ({group.length}):
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {group.map((b, bIdx) => (
                                    <div
                                      key={b.id || bIdx}
                                      className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">
                                          Delivery #{bIdx + 1}: {b.business?.name || "Business"}
                                        </span>
                                        <Badge
                                          status={b.deliveryReached ? "completed" : "in_progress"}
                                          label={b.deliveryReached ? "Destination Reached" : "In Transit"}
                                        />
                                      </div>
                                      <p className="text-slate-600">
                                        <span className="font-semibold text-slate-700">Shipment:</span> {b.shipment?.from} ➔ {b.shipment?.to}
                                      </p>
                                      <p className="text-slate-600">
                                        <span className="font-semibold text-slate-700">Load:</span> {b.weight} kg • {b.space} m³
                                      </p>
                                      <p className="text-slate-500">
                                        Contact: {b.business?.contact || "N/A"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardBody>

                            <CardFooter className="flex justify-end">
                              <Button
                                variant="success"
                                size="md"
                                loading={isTripCompleting}
                                disabled={!canCompleteTrip || isTripCompleting}
                                onClick={() => handleCompleteTrip(routeId)}
                                className="w-full sm:w-auto"
                              >
                                {isTripCompleting
                                  ? "Completing Trip..."
                                  : canCompleteTrip
                                  ? "Complete Trip (All Deliveries Finalized)"
                                  : "Complete All Stops First"}
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {user?.role === "business" && (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Available Route Matches</h2>
                    <p className="text-xs text-slate-500">Matching drivers with capacity for your open shipments</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    {availableMatches.length} Matches Found
                  </span>
                </div>

                {availableMatches.length === 0 ? (
                  <EmptyState
                    title="No available matches right now"
                    text="When drivers post routes matching your shipments' origin, destination, and dates, they will appear here instantly."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {availableMatches.map((match, idx) => {
                      const routeId = match.route.id || match.route._id;
                      const shipmentId = match.shipment.id || match.shipment._id;
                      const isBooking = !!inFlight[`book-${routeId}-${shipmentId}`];

                      return (
                        <Card key={`match-${idx}`} className="flex flex-col justify-between hover:shadow-md transition-shadow border-indigo-200 ring-1 ring-indigo-50">
                          <div>
                            <CardHeader className="flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-50/60 to-white">
                              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Matching Route
                              </span>
                              <Badge status="open" label="Match Available" />
                            </CardHeader>
                            <CardBody className="space-y-4">
                              <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                                <div>
                                  <span className="text-slate-500 block">Departure Date</span>
                                  <span className="font-bold text-slate-900 text-sm">{match.route.date || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Estimated Arrival</span>
                                  <span className="font-bold text-emerald-700 text-sm">
                                    {match.route.endDate || match.route.date || "N/A"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-slate-500 block">Driver's Journey</span>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {match.route.from} ➔ {match.route.to}
                                  </p>
                                  {match.route.stops?.length > 0 && (
                                    <p className="text-slate-500 mt-0.5">
                                      Stops: {match.route.stops.join(" ➔ ")}
                                    </p>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                  <span className="text-slate-500 block">Your Shipment</span>
                                  <p className="font-semibold text-slate-800">
                                    {match.shipment.from} ➔ {match.shipment.to}
                                  </p>
                                  <p className="text-slate-500">
                                    Weight: {match.shipment.weight} kg • Space: {match.shipment.space} m³
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-500 block">Driver</span>
                                    <span className="font-medium text-slate-900">{match.driver?.name || "Driver"}</span>
                                  </div>
                                  <span className="text-slate-500">{match.driver?.contact || "N/A"}</span>
                                </div>
                              </div>
                            </CardBody>
                          </div>

                          <CardFooter>
                            <Button
                              variant="primary"
                              size="md"
                              loading={isBooking}
                              disabled={isBooking}
                              onClick={() => handleBookNow(match)}
                              className="w-full"
                            >
                              {isBooking ? "Booking Driver..." : "Book Now"}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Your Active Bookings</h2>
                    <p className="text-xs text-slate-500">Track shipments booked with drivers in transit</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    {businessActiveBookings.length} Active
                  </span>
                </div>

                {businessActiveBookings.length === 0 ? (
                  <EmptyState
                    title="No active bookings"
                    text="You do not have any pending or accepted bookings right now. Use the matches above to book a driver."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {businessActiveBookings.map((booking) => {
                      const isCancelling = !!inFlight[`cancel-${booking.id}`];
                      const truckLocation = getTruckLocation(
                        booking.route,
                        booking.shipment,
                        booking.deliveryReached,
                        booking.status
                      );
                      const progressText = booking.deliveryReached
                        ? "Delivered at Destination"
                        : `In Transit (destination: ${booking.shipment?.to || "N/A"})`;

                      return (
                        <Card key={booking.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                            <CardHeader className="flex items-center justify-between gap-2 bg-slate-50/50">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Booking #{booking.id.slice(-6).toUpperCase()}
                              </span>
                              <Badge
                                status={
                                  booking.status === "accepted" && booking.deliveryReached
                                    ? "completed"
                                    : booking.status
                                }
                                label={
                                  booking.status === "accepted" && booking.deliveryReached
                                    ? "Destination Reached"
                                    : booking.status
                                }
                              />
                            </CardHeader>
                            <CardBody className="space-y-4">
                              <div>
                                <span className="text-xs text-slate-500 block mb-1 font-medium">Trip Progress Stepper:</span>
                                <RouteStepper
                                  route={booking.route}
                                  deliveryNode={booking.shipment?.to}
                                  isCompleted={booking.status === "completed" || booking.deliveryReached}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                                <div>
                                  <span className="text-slate-500 block">Departure</span>
                                  <span className="font-semibold text-slate-800">{booking.route?.date || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Expected Arrival</span>
                                  <span className="font-semibold text-emerald-700">{booking.route?.endDate || booking.route?.date || "N/A"}</span>
                                </div>
                                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                                  <span className="text-slate-500 block">Current Location</span>
                                  <span className="font-bold text-indigo-700">{truckLocation}</span>
                                  <span className="text-slate-500 block mt-0.5">{progressText}</span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs pt-1">
                                <p className="text-slate-700">
                                  <span className="font-semibold">Cargo:</span> {booking.shipment?.from} ➔ {booking.shipment?.to} ({booking.weight}kg, {booking.space}m³)
                                </p>
                                <p className="text-slate-700">
                                  <span className="font-semibold">Driver:</span> {booking.driver?.name} ({booking.driver?.contact})
                                </p>
                              </div>
                            </CardBody>
                          </div>

                          {booking.status === "pending" && (
                            <CardFooter>
                              <Button
                                variant="outlineDanger"
                                size="sm"
                                loading={isCancelling}
                                disabled={isCancelling}
                                onClick={() => handleCancel(booking.id)}
                                className="w-full"
                              >
                                {isCancelling ? "Cancelling..." : "Cancel Booking Request"}
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bookings;
