import type { OrderState } from "../constants/orderStates";

export interface Order {
  id: string;
  customer: string;
  status: OrderState;
  total: number;
  createdAt: string;
}
