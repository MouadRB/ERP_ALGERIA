import axios from "axios";
import { config } from "../config/env.js";

export async function getNotifications({ token } = {}) {
  // If you have a dedicated notifications service later, swap this URL.
  const url = `${config.services.order}/notifications`;
  const { data } = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

