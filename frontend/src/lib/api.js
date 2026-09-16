import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("droxy_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatApiError = (e) => {
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((x) => (x?.msg ? x.msg : JSON.stringify(x))).join(", ");
  if (detail?.msg) return detail.msg;
  return "Une erreur est survenue. Réessaie.";
};
