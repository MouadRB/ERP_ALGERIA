import axios from "axios";
import { config } from "../config/env.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getCatalogue({ token, params } = {}) {
  const { data } = await axios.get(`${config.services.catalogue}/catalogue`, {
    params,
    headers: authHeaders(token),
  });
  return data;
}

export async function getCatalogueItem({ token, id } = {}) {
  const { data } = await axios.get(`${config.services.catalogue}/catalogue/${id}`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function publishItem({ token, id } = {}) {
  const { data } = await axios.put(
    `${config.services.catalogue}/catalogue/${id}/publish`,
    {},
    { headers: authHeaders(token) }
  );
  return data;
}

export async function unpublishItem({ token, id } = {}) {
  const { data } = await axios.put(
    `${config.services.catalogue}/catalogue/${id}/unpublish`,
    {},
    { headers: authHeaders(token) }
  );
  return data;
}

export async function getOpenSearchStatus({ token } = {}) {
  const { data } = await axios.get(`${config.services.catalogue}/catalogue/opensearch/status`, {
    headers: authHeaders(token),
  });
  return data;
}
