import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getBCs({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.procurement}/bcs`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getBC({ token, id } = {}) {
  const { data } = await axios.get(`${config.services.procurement}/bcs/${id}`, {
    headers: authHeaders(token),
  });
  return data;
}
