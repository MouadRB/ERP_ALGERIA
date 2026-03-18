import type { Role } from '@ferza/shared';

export interface FerzaSession {
  userId: string;
  nameFr: string;
  nameAr: string;
  role: Role;
  locale: 'fr' | 'ar';
}

const MOCK_SESSION: FerzaSession = {
  userId: process.env.NEXT_PUBLIC_MOCK_USER_ID ?? 'usr-dev-001',
  nameFr: process.env.NEXT_PUBLIC_MOCK_USER_NAME_FR ?? 'Haroun ',
  nameAr: process.env.NEXT_PUBLIC_MOCK_USER_NAME_AR ?? 'هارون ر',
  role: (process.env.NEXT_PUBLIC_MOCK_USER_ROLE as Role) ?? 'SUPERADMIN',
  locale: 'fr',
};

export const getMockSession = (): FerzaSession => MOCK_SESSION;

export const isMockMode = (): boolean =>
  process.env.NEXT_PUBLIC_USE_MOCK === 'true';