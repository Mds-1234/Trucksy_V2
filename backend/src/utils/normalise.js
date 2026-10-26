export const normaliseCity = (city) => {
  if (typeof city !== "string") return "";
  return city.trim().toLowerCase().replace(/\s+/g, " ");
};
