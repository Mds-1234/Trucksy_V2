import api from "./api";

export const createBooking = async (routeId, shipmentId) => {
  const res = await api.post("/bookings", { routeId, shipmentId });
  return res.data;
};

export const getUserBookings = async () => {
  const res = await api.get("/bookings/mine");
  return res.data;
};

export const acceptBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/accept`);
  return res.data;
};

export const rejectBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/reject`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return res.data;
};

export const getMatches = async () => {
  const res = await api.get("/matches");
  return res.data;
};

export const getMatchSummary = async () => {
  const res = await api.get("/matches/summary");
  return res.data;
};
