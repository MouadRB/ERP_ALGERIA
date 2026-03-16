import type { BCState } from "../constants/bcStates";

export interface BonCommande {
  id: string;
  supplier: string;
  status: BCState;
  total: number;
}
