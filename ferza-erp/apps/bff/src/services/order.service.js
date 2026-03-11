import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getOmsQueue({ token } = {}) {
  const { data } = await axios.get(`${config.services.order}/oms/queue`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function getOrders({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.order}/oms/orders`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getOrder({ token, id } = {}) {
  const { data } = await axios.get(`${config.services.order}/oms/orders/${id}`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function confirmOrder({ token, id } = {}) {
  const { data } = await axios.post(
    `${config.services.order}/oms/orders/${id}/confirm`,
    {},
    { headers: authHeaders(token) }
  );
  return data;
}

export async function cancelOrder({ token, id } = {}) {
  const { data } = await axios.post(
    `${config.services.order}/oms/orders/${id}/cancel`,
    {},
    { headers: authHeaders(token) }
  );
  return data;
}
