import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getRiskProfile({ token, customerId } = {}) {
  const { data } = await axios.get(`${config.services.risk}/customers/${customerId}/risk`, {
    headers: authHeaders(token),
  });
  return data;
}
