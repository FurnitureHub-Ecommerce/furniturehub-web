import api from "../api.js";

export async function getUsers(params = {}) {
  const response = await api.get("/api/users", { params });
  return response.data;
}

export async function createAdminUser(payload) {
  const response = await api.post("/api/users", payload);
  return response.data;
}