import api from "./api";

export const addShipment = async (shipmentData) => {
  const res = await api.post("/shipments", shipmentData);
  return res.data;
};

export const getUserShipments = async (scope) => {
  const params = scope ? { scope } : {};
  const res = await api.get("/shipments/mine", { params });
  return res.data;
};

export const deleteShipment = async (id) => {
  const res = await api.delete(`/shipments/${id}`);
  return res.data;
};
