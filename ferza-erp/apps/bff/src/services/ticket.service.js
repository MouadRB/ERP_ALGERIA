import axios from "axios";
import { config } from "../config/env.js";

export async function getTickets({ token, customerId } = {}) {
  const url = `${config.services.customer}/tickets`;
  const { data } = await axios.get(url, {
    params: customerId ? { customerId } : undefined,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

