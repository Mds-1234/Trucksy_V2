export const ACTIVE_ROUTE_STATUSES = ["open", "in_progress"];
export const ACTIVE_SHIPMENT_STATUSES = ["open", "booked"];

export const isRouteActive = (status) => ACTIVE_ROUTE_STATUSES.includes(status);
export const isShipmentActive = (status) => ACTIVE_SHIPMENT_STATUSES.includes(status);

export const getRouteMineFilter = (driverId, scope) => {
  if (scope === "all") {
    return { driver: driverId };
  }
  return { driver: driverId, status: { $in: ACTIVE_ROUTE_STATUSES } };
};

export const getShipmentMineFilter = (businessId, scope) => {
  if (scope === "all") {
    return { business: businessId };
  }
  return { business: businessId, status: { $in: ACTIVE_SHIPMENT_STATUSES } };
};

export const filterActiveRoutes = (routes) => {
  if (!Array.isArray(routes)) return [];
  return routes.filter((r) => isRouteActive(r?.status));
};

export const filterActiveShipments = (shipments) => {
  if (!Array.isArray(shipments)) return [];
  return shipments.filter((s) => isShipmentActive(s?.status));
};
