import axios from "axios";
import { config } from "../config/env.js";

export async function getDashboardOverview({ token } = {}) {
  const url = `${config.services.order}/dashboard/overview`;
  const { data } = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

