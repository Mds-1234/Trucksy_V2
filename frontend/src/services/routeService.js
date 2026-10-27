import api from "./api";

export const addRoute = async (routeData) => {
  const res = await api.post("/routes", routeData);
  return res.data;
};

export const getUserRoutes = async (scope) => {
  const params = scope ? { scope } : {};
  const res = await api.get("/routes/mine", { params });
  return res.data;
};

export const deleteRoute = async (id) => {
  const res = await api.delete(`/routes/${id}`);
  return res.data;
};

export const completeRouteStop = async (routeId, index) => {
  const res = await api.post(`/routes/${routeId}/stops/${index}/complete`);
  return res.data;
};

export const completeRoute = async (routeId) => {
  const res = await api.post(`/routes/${routeId}/complete`);
  return res.data;
};
