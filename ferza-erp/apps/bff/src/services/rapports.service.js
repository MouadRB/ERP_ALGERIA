import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

// Optional: if rapports becomes a dedicated service, centralize calls here.
export async function getRapportsOverview({ token } = {}) {
  const { data } = await axios.get(`${config.services.order}/rapports/overview`, {
    headers: authHeaders(token),
  });
  return data;
}

