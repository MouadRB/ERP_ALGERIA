import type { Role } from '../constants/roles';

export interface SessionData {
  userId: string;
  username: string;
  nameFr: string;
  nameAr: string;
  role: Role;                  // Locked to the 9 FERZA roles — not string
  locale: 'fr' | 'ar';
  accessToken: string;
  refreshToken: string;
  expiresAt: number;           // Unix timestamp ms
}