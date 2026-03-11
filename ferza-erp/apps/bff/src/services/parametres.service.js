import axios from "axios";
import { config } from "../config/env.js";

export async function getParametres({ token } = {}) {
  // If you have a dedicated settings service later, swap this URL.
  const url = `${config.services.order}/parametres`;
  const { data } = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

