import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getStock({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.inventory}/stock`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getSku({ token, sku } = {}) {
  const { data } = await axios.get(`${config.services.inventory}/stock/${sku}`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function getAlerts({ token } = {}) {
  const { data } = await axios.get(`${config.services.inventory}/alerts`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function getFifoCosts({ token } = {}) {
  const { data } = await axios.get(`${config.services.inventory}/fifo-costs`, {
    headers: authHeaders(token),
  });
  return data;
}
