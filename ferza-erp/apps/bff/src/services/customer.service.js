import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getCustomers({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.customer}/customers`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getCustomer({ token, id } = {}) {
  const { data } = await axios.get(`${config.services.customer}/customers/${id}`, {
    headers: authHeaders(token),
  });
  return data;
}
