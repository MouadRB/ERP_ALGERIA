import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getProducts({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.pim}/products`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getProduct({ token, id } = {}) {
  const { data } = await axios.get(`${config.services.pim}/products/${id}`, {
    headers: authHeaders(token),
  });
  return data;
}
