import { normaliseCity } from "./normalise.js";

export const checkRouteShipmentMatch = (route, shipment) => {
  if (route.status && route.status !== "open") {
    return { isMatch: false, reason: "Route not open" };
  }
  if (shipment.status && shipment.status !== "open") {
    return { isMatch: false, reason: "Shipment not open" };
  }
  if (route.date !== shipment.date) {
    return { isMatch: false, reason: "Date mismatch" };
  }

  const pathKeys = Array.isArray(route.pathKeys) && route.pathKeys.length > 0
    ? route.pathKeys
    : [route.from, ...(route.stops || []), route.to].map(normaliseCity);

  const fromKey = shipment.fromKey || normaliseCity(shipment.from);
  const toKey = shipment.toKey || normaliseCity(shipment.to);

  const fromIdx = pathKeys.indexOf(fromKey);
  const toIdx = pathKeys.indexOf(toKey);

  if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) {
    return { isMatch: false, reason: "Invalid path order" };
  }

  const segments = route.segmentRemaining || [];
  for (let i = fromIdx; i < toIdx; i++) {
    const seg = segments[i];
    if (!seg) {
      return { isMatch: false, reason: "Missing segment" };
    }
    if (seg.weight < shipment.weight) {
      return { isMatch: false, reason: "Insufficient segment weight" };
    }
    if (seg.space < shipment.space) {
      return { isMatch: false, reason: "Insufficient segment space" };
    }
  }

  return {
    isMatch: true,
    fromIdx,
    toIdx
  };
};

export const hasActiveBooking = (routeId, shipmentId, existingBookings = []) => {
  const rId = String(routeId);
  const sId = String(shipmentId);

  return existingBookings.some((booking) => {
    const bookingRouteId = String(booking.route?._id || booking.route?.id || booking.route);
    const bookingShipmentId = String(booking.shipment?._id || booking.shipment?.id || booking.shipment);
    const isActive = booking.status === "pending" || booking.status === "accepted";
    return bookingRouteId === rId && bookingShipmentId === sId && isActive;
  });
};

export const findMatches = (shipments, routes, existingBookings = []) => {
  const matches = [];

  for (const shipment of shipments) {
    for (const route of routes) {
      const routeId = route.id || route._id;
      const shipmentId = shipment.id || shipment._id;

      if (hasActiveBooking(routeId, shipmentId, existingBookings)) {
        continue;
      }

      const matchResult = checkRouteShipmentMatch(route, shipment);
      if (matchResult.isMatch) {
        matches.push({
          fromIdx: matchResult.fromIdx,
          toIdx: matchResult.toIdx,
          shipment,
          route,
          driver: {
            name: route.driver?.name || "",
            contact: route.driver?.contact || ""
          }
        });
      }
    }
  }

  return matches;
};

export const countMatchesForRoutes = (routes, shipments, existingBookings = []) => {
  let count = 0;

  for (const route of routes) {
    for (const shipment of shipments) {
      const routeId = route.id || route._id;
      const shipmentId = shipment.id || shipment._id;

      if (hasActiveBooking(routeId, shipmentId, existingBookings)) {
        continue;
      }

      const matchResult = checkRouteShipmentMatch(route, shipment);
      if (matchResult.isMatch) {
        count++;
      }
    }
  }

  return count;
};
