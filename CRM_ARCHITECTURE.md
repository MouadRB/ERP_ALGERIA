# CRM Module — Complete Architecture Document
> **Purpose:** Full A-to-Z specification for implementing the CRM module.
> Hand this document to Claude and ask it to implement one subtask at a time.
> Generated from: OMS module analysis + user CRM spec (March 2026).

---

## 0. Current State Inventory

### What already EXISTS and WORKS (do not re-create)

**BFF — Partial implementation:**
| File | Status | What it does |
|---|---|---|
| `bff/src/routes/crm.routes.js` | Partial | GET `/` list, GET `/:id` detail only |
| `bff/src/services/customer.service.js` | Partial | `getCustomers`, `getCustomerById` only |
| `bff/src/mocks/crm.mock.js` | Partial | 5 customers, static metrics (not OMS-computed) |
| `bff/src/transformers/crm.transformer.js` | Complete | `transformCustomer`, `transformCustomerList` |

**Shared types — Complete:**
| File | Status |
|---|---|
| `packages/shared/src/types/customer.types.ts` | Complete — `Customer`, `CustomerSegment`, `RiskLevel` |
| `packages/shared/src/types/api.types.ts` | Complete — `ApiResponse`, `ApiError`, `PaginationParams` |

**Frontend hooks — Real implementations (already call BFF correctly):**
| Hook | Method | BFF endpoint |
|---|---|---|
| `useCRMCustomers` | GET | `/bff/crm` |
| `useCRMCustomer` | GET | `/bff/crm/:id` |
| `useBlacklist` | GET | `/bff/crm?blacklisted=true` |
| `useAddToBlacklist` | PATCH | `/bff/crm/:id/blacklist` |
| `useRemoveFromBlacklist` | DELETE | `/bff/crm/:id/blacklist` |
| `useCreateCustomer` | POST | `/bff/crm` |
| `useUpdateCustomer` | PATCH | `/bff/crm/:id` |
| `useRiskProfile` | GET | `/bff/crm/:id/risk` |
| `useCRMTickets` | GET | `/bff/crm/tickets?customerId=...` |
| `useCreateTicket` | POST | `/bff/crm/tickets` |
| `useUpdateTicket` | PATCH | `/bff/crm/tickets/:id` |

**Frontend pages — Placeholder stubs (need real content):**
- `app/[locale]/(app)/crm/page.tsx` — shows hardcoded DataGrid, no hooks used
- `app/[locale]/(app)/crm/[id]/page.tsx` — shows hardcoded DataGrid, no hooks used

**Frontend components — ALL are stubs:**
Every file in `modules/crm/components/` returns `<Card><Typography>ComponentName</Typography></Card>`.
All modals are empty Dialog skeletons.

### What is MISSING (needs to be built)

1. BFF routes for mutations (POST, PATCH, DELETE, tickets)
2. BFF customer service: mutations + dynamic OMS metric computation
3. BFF mock: more customers + ticket mock data + OMS order linkage by `customerId`
4. BFF ticket service + ticket mock
5. All frontend component implementations
6. Both pages wired to real hooks + components
7. `invalidateCRMQueries` helper (mirror of `invalidateOMSQueries`)
8. `Ticket` type in shared types

---

## 1. Architecture Principles (NON-NEGOTIABLE)

### 1.1 Ownership Boundaries
- **CRM = source of truth for customers** (identity, segment, blacklist, risk)
- **OMS = source of truth for orders** (all order data lives in OMS mock)
- `customerId` is the **only bridge** between the two modules
- CRM must NEVER store order data
- OMS must NEVER store full customer objects

### 1.2 Phone as Primary Key
- Phone number is the unique identifier for customers
- `findOrCreateCustomer(phone, name)` is the creation entrypoint
- No duplicate customers allowed (phone-deduped)

### 1.3 Dynamic Metrics (CRITICAL)
- `totalOrders` and `totalSpentTTC` are **NOT stored** in the CRM mock
- They are computed at query time by scanning OMS orders filtered by `customerId`
- `lastOrderDate` is similarly computed from OMS data
- This ensures CRM and OMS never drift out of sync

### 1.4 BFF Orchestration
- BFF simulates the real backend orchestration:
  - Reads customers from CRM mock
  - Reads orders from OMS mock (already in-memory via `require()` cache)
  - Joins them at the BFF service layer, never in the frontend

### 1.5 No Pattern Deviations
- Same `fetchBFF` utility as OMS
- Same `useQuery` / `useMutation` + `invalidateQueries` pattern
- Same Zod validation middleware on all routes
- Same `requireRole` RBAC on all routes
- Same `AppError` error class for 404/403 responses
- Same `env.useMock` guard in every service function

---

## 2. Complete Data Model

### 2.1 Customer (shared type — already exists, do not modify)
```typescript
// packages/shared/src/types/customer.types.ts
export type CustomerSegment = 'standard' | 'vip' | 'wholesale';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Customer {
  id: string;                        // 'CUST-001', 'CUST-002', ...
  phone: string;                     // Primary key — '0661234501'
  nameFr: string;
  nameAr: string;
  email: string | null;
  wilayaCode: string;
  address: string;
  segment: CustomerSegment;
  blacklisted: boolean;
  blacklistReason: string | null;
  riskLevel: RiskLevel;
  fraudScore: number | null;         // 0.0–1.0
  totalOrders: number;               // computed from OMS
  totalSpentTTC: number;             // computed from OMS (DZD)
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 Ticket (needs to be added to shared types)
```typescript
// packages/shared/src/types/ticket.types.ts  ← CREATE THIS FILE
export type TicketStatus   = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketCategory = 'livraison' | 'retour' | 'remboursement' | 'fraude' | 'autre';

export interface Ticket {
  id: string;                        // 'TKT-001', ...
  customerId: string;                // links to Customer.id
  orderId: string | null;            // links to Order.id (optional)
  subject: string;
  body: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  agentId: string | null;            // assigned agent
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
```

### 2.3 RiskProfile (BFF-computed, not stored)
```typescript
// Used in useRiskProfile hook — already typed there
interface RiskProfile {
  customerId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudScore: number;                // 0.0–1.0
  flags: string[];                   // e.g. ['multiple_failures', 'high_cancellations']
  totalFailedDeliveries: number;
  totalCancellations: number;
  totalOrders: number;
  failureRate: number;               // 0.0–1.0
}
```

### 2.4 CustomerWithMetrics (BFF response shape)
The BFF enriches `Customer` with dynamically computed OMS metrics:
```javascript
// What the BFF returns for getCustomerById (enriched)
{
  ...customer,               // all Customer fields
  totalOrders: 12,           // computed from OMS orders where customerId matches
  totalSpentTTC: 420000,     // sum of codAmount of delivered orders
  lastOrderDate: '2025-03-10T...', // max createdAt from customer's orders
}
```

---

## 3. BFF Layer — Complete Specification

### 3.1 Existing files structure
```
bff/src/
├── routes/
│   └── crm.routes.js          ← EXTEND (add missing routes)
├── services/
│   ├── customer.service.js    ← EXTEND (add mutations + metrics)
│   └── crm-tickets.service.js ← CREATE
├── mocks/
│   ├── crm.mock.js            ← EXTEND (add more customers, remove static metrics)
│   └── crm-tickets.mock.js    ← CREATE
└── transformers/
    └── crm.transformer.js     ← already complete
```

### 3.2 crm.mock.js — What to change
**Problem:** `totalOrders` and `totalSpentTTC` are hardcoded. This violates the dynamic-metrics rule.

**Fix:** Remove `totalOrders` and `totalSpentTTC` from the mock. The service computes them from OMS.

**Also add:** More customers so the list page is interesting. Add at least 10 total.
**Important:** Assign `customerId` values (`'CUST-001'` through `'CUST-010'`) that match `customerId` fields in OMS orders mock. This is the join key.

**Structure of each mock customer:**
```javascript
{
  id: 'CUST-001',
  phone: '0661234501',
  nameFr: 'Mohamed Ben Ali',
  nameAr: 'محمد بن علي',
  email: 'mbenali@gmail.com',
  wilayaCode: '16',
  address: '12 Rue Didouche Mourad, Alger Centre',
  segment: 'vip',                    // 'standard' | 'vip' | 'wholesale'
  blacklisted: false,
  blacklistReason: null,
  riskLevel: 'LOW',
  fraudScore: 0.08,
  // NO totalOrders, NO totalSpentTTC — computed dynamically
  createdAt: '2024-09-01T10:00:00.000Z',
  updatedAt: '2025-03-10T09:05:00.000Z',
}
```

**OMS mock linkage:** Add `customerId` field to OMS orders mock (`oms-orders.mock.js`).
Orders 1–15: `customerId: 'CUST-001'`
Orders 16–25: `customerId: 'CUST-002'`
etc. (distribute across customers)

### 3.3 crm-tickets.mock.js — CREATE
```javascript
module.exports = [
  {
    id: 'TKT-001',
    customerId: 'CUST-001',
    orderId: 'ORD-2025-00001',
    subject: 'Commande non reçue après 10 jours',
    body: 'Le client signale ne pas avoir reçu sa commande...',
    category: 'livraison',
    status: 'open',
    priority: 'high',
    agentId: null,
    createdAt: '2025-03-10T09:00:00.000Z',
    updatedAt: '2025-03-10T09:00:00.000Z',
    resolvedAt: null,
  },
  // ... 10+ tickets spread across CUST-001 to CUST-005
];
```

### 3.4 crm.routes.js — Complete route specification

```javascript
// All routes use:
// - requireRole(...CRM_ROLES, 'ANALYST') for reads
// - requireRole(...CRM_ROLES) for mutations
// CRM_ROLES = ['CRM_AGENT', 'SUPERADMIN']

GET    /              → getCustomers(query)          // list with pagination + filters
GET    /:id           → getCustomerById(id)          // single customer + OMS metrics
POST   /              → createCustomer(body)         // manual creation (idempotent by phone)
PATCH  /:id           → updateCustomer(id, body)     // edit address, segment, etc.
PATCH  /:id/blacklist → blacklistCustomer(id, reason)
DELETE /:id/blacklist → removeFromBlacklist(id)
GET    /:id/risk      → getRiskProfile(id)           // computed from OMS orders
GET    /tickets       → getTickets(query)            // ?customerId= filter
POST   /tickets       → createTicket(body)
PATCH  /tickets/:id   → updateTicket(id, body)
```

**Zod schemas for each route:**

```javascript
// POST /
const createCustomerSchema = z.object({
  phone:    z.string().min(9).max(13),
  nameFr:   z.string().min(2),
  nameAr:   z.string().optional(),
  email:    z.string().email().optional().nullable(),
  wilayaCode: z.string().min(2),
  address:  z.string().min(5),
  segment:  z.enum(['standard', 'vip', 'wholesale']).optional(),
});

// PATCH /:id
const updateCustomerSchema = z.object({
  nameFr:    z.string().min(2).optional(),
  nameAr:    z.string().optional(),
  email:     z.string().email().optional().nullable(),
  wilayaCode: z.string().min(2).optional(),
  address:   z.string().min(5).optional(),
  segment:   z.enum(['standard', 'vip', 'wholesale']).optional(),
});

// PATCH /:id/blacklist
const blacklistSchema = z.object({
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères.'),
});

// POST /tickets
const createTicketSchema = z.object({
  customerId: z.string().min(1),
  orderId:    z.string().optional().nullable(),
  subject:    z.string().min(5),
  body:       z.string().min(10),
  category:   z.enum(['livraison', 'retour', 'remboursement', 'fraude', 'autre']),
  priority:   z.enum(['low', 'medium', 'high']),
});

// PATCH /tickets/:id
const updateTicketSchema = z.object({
  status:   z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  agentId:  z.string().optional().nullable(),
  body:     z.string().optional(),
});

// GET / query
paginationSchema.extend({
  search:     z.string().optional(),
  segment:    z.enum(['standard', 'vip', 'wholesale']).optional(),
  blacklisted: booleanOptional,
  riskLevel:  z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  wilaya:     z.string().optional(),
  sort:       z.enum(['name', 'totalSpent_desc', 'totalOrders_desc', 'createdAt_desc', 'risk']).optional(),
})
```

### 3.5 customer.service.js — Complete function specification

```javascript
// Pattern: always check env.useMock first, then call real API

const mockCustomers = () => require('../mocks/crm.mock');
const mockOrders    = () => require('../mocks/oms-orders.mock');  // join key

// ─── Dynamic metric computation ─────────────────────────────────────────────
const computeCustomerMetrics = (customerId) => {
  const orders = mockOrders();
  const customerOrders = orders.filter((o) => o.customerId === customerId);
  const deliveredOrders = customerOrders.filter(
    (o) => o.status === 'DeliveredCOD_Confirmed' || o.status === 'COD_Remitted',
  );
  return {
    totalOrders:   customerOrders.length,
    totalSpentTTC: deliveredOrders.reduce((sum, o) => sum + (o.codAmount ?? 0), 0),
    lastOrderDate: customerOrders.length
      ? customerOrders.reduce((max, o) =>
          o.createdAt > max ? o.createdAt : max, customerOrders[0].createdAt)
      : null,
  };
};

// ─── Sorting ─────────────────────────────────────────────────────────────────
const sortCustomers = (customers, sort) => {
  // sort after metrics are computed — enriched array
  switch (sort) {
    case 'totalSpent_desc':    return [...customers].sort((a, b) => b.totalSpentTTC - a.totalSpentTTC);
    case 'totalOrders_desc':   return [...customers].sort((a, b) => b.totalOrders - a.totalOrders);
    case 'createdAt_desc':     return [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'risk':               return [...customers].sort((a, b) => b.fraudScore - a.fraudScore);
    case 'name':
    default:                   return [...customers].sort((a, b) => a.nameFr.localeCompare(b.nameFr));
  }
};

// ─── getCustomers ─────────────────────────────────────────────────────────────
// Enrich all customers with computed metrics, then filter + sort + paginate
const getCustomers = async ({ page = 1, pageSize = 20, search, segment, blacklisted, riskLevel, wilaya, sort } = {}) => {
  if (env.useMock) {
    let results = mockCustomers().map((c) => ({ ...c, ...computeCustomerMetrics(c.id) }));
    if (segment)    results = results.filter((c) => c.segment === segment);
    if (blacklisted !== undefined) results = results.filter((c) => c.blacklisted === blacklisted);
    if (riskLevel)  results = results.filter((c) => c.riskLevel === riskLevel);
    if (wilaya)     results = results.filter((c) => c.wilayaCode === wilaya);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) => c.phone.includes(q) || c.nameFr.toLowerCase().includes(q),
      );
    }
    results = sortCustomers(results, sort);
    const total = results.length;
    return { data: results.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
  // real API call...
};

// ─── getCustomerById ──────────────────────────────────────────────────────────
const getCustomerById = async (id) => {
  if (env.useMock) {
    const customer = mockCustomers().find((c) => c.id === id);
    if (!customer) return null;
    return { ...customer, ...computeCustomerMetrics(id) };
  }
  // real API call...
};

// ─── findOrCreateCustomer ─────────────────────────────────────────────────────
// Used by OMS order creation flow to link order → customer
const findOrCreateCustomer = (phone, nameFr) => {
  const customers = mockCustomers();
  const existing = customers.find((c) => c.phone === phone);
  if (existing) return existing;
  const newCustomer = {
    id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
    phone,
    nameFr,
    nameAr: '',
    email: null,
    wilayaCode: '16',
    address: '',
    segment: 'standard',
    blacklisted: false,
    blacklistReason: null,
    riskLevel: 'LOW',
    fraudScore: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  return newCustomer;
};

// ─── createCustomer ───────────────────────────────────────────────────────────
const createCustomer = async (body) => {
  if (env.useMock) {
    const customers = mockCustomers();
    const existing = customers.find((c) => c.phone === body.phone);
    if (existing) return existing;  // idempotent by phone
    const newCustomer = { id: `CUST-${String(customers.length + 1).padStart(3, '0')}`, ...body, segment: body.segment ?? 'standard', blacklisted: false, blacklistReason: null, riskLevel: 'LOW', fraudScore: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    customers.push(newCustomer);
    return newCustomer;
  }
};

// ─── updateCustomer ───────────────────────────────────────────────────────────
const updateCustomer = async (id, body) => {
  if (env.useMock) {
    const customers = mockCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], ...body, updatedAt: new Date().toISOString() };
    return { ...customers[idx], ...computeCustomerMetrics(id) };
  }
};

// ─── blacklistCustomer ────────────────────────────────────────────────────────
const blacklistCustomer = async (id, reason) => {
  if (env.useMock) {
    const customers = mockCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], blacklisted: true, blacklistReason: reason, updatedAt: new Date().toISOString() };
    return { ...customers[idx], ...computeCustomerMetrics(id) };
  }
};

// ─── removeFromBlacklist ──────────────────────────────────────────────────────
const removeFromBlacklist = async (id) => {
  if (env.useMock) {
    const customers = mockCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], blacklisted: false, blacklistReason: null, updatedAt: new Date().toISOString() };
    return { ...customers[idx], ...computeCustomerMetrics(id) };
  }
};

// ─── getRiskProfile ───────────────────────────────────────────────────────────
const getRiskProfile = async (id) => {
  if (env.useMock) {
    const customer = mockCustomers().find((c) => c.id === id);
    if (!customer) return null;
    const orders = mockOrders().filter((o) => o.customerId === id);
    const failed = orders.filter((o) => o.status === 'DeliveryFailed_Absent').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    const total = orders.length;
    const flags = [];
    if (failed > 2) flags.push('multiple_failed_deliveries');
    if (cancelled > 3) flags.push('high_cancellations');
    if (customer.fraudScore > 0.7) flags.push('high_fraud_score');
    if (customer.blacklisted) flags.push('blacklisted');
    return {
      customerId: id,
      riskLevel: customer.riskLevel,
      fraudScore: customer.fraudScore ?? 0,
      flags,
      totalFailedDeliveries: failed,
      totalCancellations: cancelled,
      totalOrders: total,
      failureRate: total > 0 ? failed / total : 0,
    };
  }
};

module.exports = { getCustomers, getCustomerById, findOrCreateCustomer, createCustomer, updateCustomer, blacklistCustomer, removeFromBlacklist, getRiskProfile };
```

### 3.6 crm-tickets.service.js — CREATE

```javascript
const env = require('../config/env');
const mockTickets = () => require('../mocks/crm-tickets.mock');

const getTickets = async ({ customerId, status, page = 1, pageSize = 20 } = {}) => {
  if (env.useMock) {
    let results = [...mockTickets()];
    if (customerId) results = results.filter((t) => t.customerId === customerId);
    if (status)     results = results.filter((t) => t.status === status);
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = results.length;
    return { data: results.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
};

const createTicket = async (body) => {
  if (env.useMock) {
    const tickets = mockTickets();
    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'open',
      agentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };
    tickets.push(newTicket);
    return newTicket;
  }
};

const updateTicket = async (id, body) => {
  if (env.useMock) {
    const tickets = mockTickets();
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const resolvedAt = body.status === 'resolved' ? new Date().toISOString() : tickets[idx].resolvedAt;
    tickets[idx] = { ...tickets[idx], ...body, resolvedAt, updatedAt: new Date().toISOString() };
    return tickets[idx];
  }
};

module.exports = { getTickets, createTicket, updateTicket };
```

---

## 4. Shared Package

### 4.1 Add ticket.types.ts
Create `packages/shared/src/types/ticket.types.ts` with the `Ticket` interface shown in section 2.2.

### 4.2 Update shared index
Add to `packages/shared/src/index.ts`:
```typescript
export type { Ticket, TicketStatus, TicketPriority, TicketCategory } from './types/ticket.types';
```

### 4.3 DO NOT MODIFY customer.types.ts
Already complete. The `Customer` interface is the source of truth.

---

## 5. Frontend Hooks

All hooks already exist and call the right BFF endpoints. **Do not recreate them.**
However, some need improvements:

### 5.1 invalidateCRMQueries — CREATE
Create `modules/crm/hooks/invalidateCRM.ts` (mirror of `invalidateOMS.ts`):

```typescript
import type { QueryClient } from '@tanstack/react-query';

const CRM_INVALIDATE_KEYS: Array<readonly unknown[]> = [
  ['crm', 'customers'],
  ['crm', 'blacklist'],
];

export const invalidateCRMQueries = (queryClient: QueryClient, customerId?: string) => {
  CRM_INVALIDATE_KEYS.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
  if (customerId) {
    queryClient.invalidateQueries({ queryKey: ['crm', 'customer', customerId] });
    queryClient.invalidateQueries({ queryKey: ['crm', 'risk', customerId] });
    queryClient.invalidateQueries({ queryKey: ['crm', 'tickets', customerId] });
  }
};
```

Then update mutation hooks to use `invalidateCRMQueries` instead of manual `invalidateQueries` calls.

### 5.2 useCRMCustomers — Extend params
Add `sort`, `riskLevel`, `wilaya`, `blacklisted` to `UseCRMCustomersParams` to match BFF query schema.

### 5.3 Query key conventions
```
['crm', 'customers', params]   → list
['crm', 'customer', id]        → single customer
['crm', 'blacklist']           → blacklisted customers
['crm', 'risk', customerId]    → risk profile
['crm', 'tickets', customerId] → tickets for a customer
['crm', 'tickets']             → all tickets
```

### 5.4 placeholderData pattern
For list hooks, add `placeholderData: (prev) => prev` to prevent layout flicker during refetch:
```typescript
useQuery({
  queryKey: ['crm', 'customers', params],
  queryFn: ...,
  placeholderData: (prev) => prev,
})
```

---

## 6. Frontend Components — Full Specification

### 6.1 Folder Structure
```
modules/crm/
├── index.ts
├── hooks/
│   ├── useCRMCustomers.ts       ✓ exists
│   ├── useCRMCustomer.ts        ✓ exists
│   ├── useCreateCustomer.ts     ✓ exists
│   ├── useUpdateCustomer.ts     ✓ exists
│   ├── useAddToBlacklist.ts     ✓ exists
│   ├── useRemoveFromBlacklist.ts ✓ exists
│   ├── useBlacklist.ts          ✓ exists
│   ├── useRiskProfile.ts        ✓ exists
│   ├── useCRMTickets.ts         ✓ exists
│   ├── useCreateTicket.ts       ✓ exists
│   ├── useUpdateTicket.ts       ✓ exists
│   └── invalidateCRM.ts         ← CREATE
├── components/
│   ├── list/
│   │   ├── CustomerTable.tsx    ← IMPLEMENT (stub)
│   │   ├── CustomerRow.tsx      ← IMPLEMENT (stub)
│   │   ├── CustomerFilters.tsx  ← IMPLEMENT (stub)
│   │   ├── SegmentFilter.tsx    ← IMPLEMENT (stub)
│   │   └── QuickLookupModal.tsx ← IMPLEMENT (stub)
│   ├── detail/
│   │   ├── tabs/
│   │   │   ├── ProfilContactTab.tsx     ← IMPLEMENT
│   │   │   ├── HistoriqueCommandesTab.tsx ← IMPLEMENT
│   │   │   ├── RisqueFraudeTab.tsx      ← IMPLEMENT
│   │   │   ├── TicketsSupportTab.tsx    ← IMPLEMENT
│   │   │   └── InteractionsNotesTab.tsx ← IMPLEMENT
│   │   └── sidebar/
│   │       ├── ProfilResumeCard.tsx     ← IMPLEMENT
│   │       ├── ActionsRapidesCard.tsx   ← IMPLEMENT
│   │       ├── AuditLogCard.tsx         ← IMPLEMENT
│   │       └── TicketsActifsCard.tsx    ← IMPLEMENT
│   └── modals/
│       ├── BlacklistModal.tsx    ← IMPLEMENT (stub)
│       ├── NewCustomerModal.tsx  ← IMPLEMENT (stub)
│       └── NewTicketModal.tsx    ← IMPLEMENT (stub)
```

### 6.2 CustomerFilters — Design spec
Mirrors `OrdersFilters.tsx` exactly. Uses the `FilterDropdown` helper pattern.

Props:
```typescript
interface CustomerFilters {
  search:     string;
  segment:    CustomerSegment | '';
  riskLevel:  RiskLevel | '';
  wilaya:     string;
  blacklisted: boolean | null;
  sort:        'name' | 'totalSpent_desc' | 'totalOrders_desc' | 'createdAt_desc' | 'risk';
}
```

Filter options:
- Search: phone, nameFr (placeholder: "Rechercher nom, téléphone...")
- Segment: Tous | Standard | VIP | Grossiste
- Risque: Tous | LOW | MEDIUM | HIGH
- Wilaya: Toutes | (unique wilayas from data)
- Blacklist toggle button (distinct visual when active)
- Sort: Nom | Dépenses desc | Commandes desc | Date créa. | Risque

### 6.3 CustomerTable — Design spec
Structure mirrors `OrdersTable.tsx`.

Columns:
| Column | Content |
|---|---|
| Client | Avatar + nameFr + phone |
| Segment | Chip: VIP (gold), Standard (grey), Grossiste (blue) |
| Wilaya | Wilaya name from `getWilayaByCode` |
| Commandes | `totalOrders` (from computed metrics) |
| Dépenses | `totalSpentTTC` formatted as DZD via `formatDZD` |
| Risque | `RiskBadge` component (already exists in `/components/ui/`) |
| Statut | "Blacklisté" chip if `blacklisted === true` |
| Actions | View button → `/crm/[id]` |

No selection checkboxes needed (CRM is read-heavy, no bulk actions initially).
Pagination: same MUI `TablePagination` as OMS, pageSize options [10, 20, 50].

### 6.4 CustomerRow — Design spec
One `<TableRow>` for each customer. Clickable → navigate to `/crm/[id]`.
Blacklisted rows: light red background `rgba(211,47,47,0.04)`.

### 6.5 Detail page — ProfilResumeCard (sidebar)
Shows: avatar, name, phone (formatted), wilaya, segment chip, created date.
If blacklisted: prominent red "BLACKLISTÉ" banner at top.

### 6.6 Detail page — ActionsRapidesCard (sidebar)
Buttons:
- "Nouveau ticket" → opens `NewTicketModal`
- "Modifier profil" → opens inline edit or `UpdateCustomerModal`
- "Blacklister" (if not blacklisted) → opens `BlacklistModal`
- "Lever le blacklist" (if blacklisted) → calls `useRemoveFromBlacklist` directly

### 6.7 Detail page — TicketsActifsCard (sidebar)
Shows last 3 open/pending tickets for this customer.
Badge count of open tickets.

### 6.8 Detail page — ProfilContactTab
Displays: phone, email, wilaya, address, date creation.
Inline edit button that calls `useUpdateCustomer`.

### 6.9 Detail page — HistoriqueCommandesTab
Fetches orders from OMS via `useOMSOrders({ search: customer.phone })`.
Renders a mini table: reference, date, status chip, codAmount.
Clicking a row navigates to `/oms/[orderId]`.
**IMPORTANT:** Does NOT call a CRM endpoint. Uses the OMS hook directly.

### 6.10 Detail page — RisqueFraudeTab
Uses `useRiskProfile(customerId)`.
Shows: fraudScore progress bar, riskLevel badge, flags list, failureRate.
Red section if blacklisted with reason.

### 6.11 Detail page — TicketsSupportTab
Uses `useCRMTickets(customerId)`.
Table: id, subject, category, status chip, priority, date.
"Nouveau ticket" button → opens `NewTicketModal`.
Row click → inline expand or dialog.

### 6.12 BlacklistModal — Design spec
```typescript
type BlacklistModalProps = {
  open:       boolean;
  onClose:    () => void;
  customerId: string;
  customerName: string;
};
```
- Warning text mentioning customer name
- Required `reason` TextField (min 10 chars)
- Submit calls `useAddToBlacklist`
- On success: close modal, invalidate queries (via `invalidateCRMQueries`)

### 6.13 NewTicketModal — Design spec
```typescript
type NewTicketModalProps = {
  open:       boolean;
  onClose:    () => void;
  customerId: string;
  orderId?:   string;   // pre-fill if opened from OMS detail
};
```
- Fields: subject, category Select, priority Select, body multiline
- Submit calls `useCreateTicket`

### 6.14 NewCustomerModal — Design spec
```typescript
type NewCustomerModalProps = {
  open:    boolean;
  onClose: () => void;
};
```
- Fields: phone (required), nameFr (required), email, wilayaCode Select, address
- Phone validation: Algerian format `0[5-7]\d{8}`
- Submit calls `useCreateCustomer`
- Idempotent: if phone already exists, BFF returns existing customer

---

## 7. Pages — Complete Specification

### 7.1 `/crm` — List page
```
CRMPage
├── PageHeader (title="CRM - Clients", action=<NewCustomerModal trigger>)
├── CRMKPIBar (optional subtask — see section 8)
└── CustomerListTab
    ├── CustomerFilters
    └── CustomerTable (pagination, sorting, filtering all server-side via BFF)
```

State management pattern (mirrors `ToutesCommandesTab`):
```typescript
const [filters, setFilters] = useState<CustomerFilters>({
  search: '', segment: '', riskLevel: '', wilaya: '',
  blacklisted: null, sort: 'name',
});
const [page, setPage]         = useState(0);
const [pageSize, setPageSize] = useState(20);
const [rawSearch, setRawSearch] = useState('');
const debouncedSearch = useDebounce(rawSearch, 350);

const { data, isLoading } = useCRMCustomers({
  page: page + 1, pageSize,
  search: debouncedSearch || undefined,
  segment: filters.segment || undefined,
  // ...
});
```

### 7.2 `/crm/[id]` — Detail page
Layout: 2-column (content + sidebar), mirrors OMS detail page.

```
CRMDetailPage
├── DetailHeader (nameFr, phone, segment chip, blacklist badge, back button)
├── LEFT (flex 1)
│   └── TabNav: Profil | Commandes | Risque & Fraude | Tickets | Notes
│       ├── ProfilContactTab
│       ├── HistoriqueCommandesTab
│       ├── RisqueFraudeTab
│       ├── TicketsSupportTab
│       └── InteractionsNotesTab
└── RIGHT (sidebar, width 320)
    ├── ProfilResumeCard
    ├── ActionsRapidesCard
    ├── TicketsActifsCard
    └── AuditLogCard
```

Tab nav state: `useState<CRMTab>('profil')` where:
```typescript
type CRMTab = 'profil' | 'commandes' | 'risque' | 'tickets' | 'notes';
```

---

## 8. Subtask Breakdown (for Claude — implement ONE at a time)

### SUBTASK 1 — BFF Foundation: Mock + Service + Routes
**Goal:** Complete the BFF layer so all 11 BFF endpoints work with mock data.

Files to create/modify:
1. Modify `bff/src/mocks/crm.mock.js` — remove static metrics, extend to 10 customers
2. Create `bff/src/mocks/crm-tickets.mock.js` — 10+ tickets
3. Create `bff/src/mocks/oms-orders.mock.js` PATCH — add `customerId` field to existing orders
4. Modify `bff/src/services/customer.service.js` — add all missing functions
5. Create `bff/src/services/crm-tickets.service.js` — complete implementation
6. Modify `bff/src/routes/crm.routes.js` — add all missing routes with Zod validation

**Test:** After this subtask, all these BFF calls should return correct data:
- `GET /bff/crm` → paginated customer list with computed metrics
- `GET /bff/crm/CUST-001` → customer with computed totalOrders, totalSpentTTC
- `PATCH /bff/crm/CUST-001/blacklist` with body `{reason: "..."}` → blacklisted
- `DELETE /bff/crm/CUST-001/blacklist` → unblacklisted
- `GET /bff/crm/CUST-001/risk` → risk profile
- `GET /bff/crm/tickets?customerId=CUST-001` → tickets
- `POST /bff/crm/tickets` → creates ticket

---

### SUBTASK 2 — Shared Types: Ticket
**Goal:** Add `Ticket` type to shared package.

Files to create/modify:
1. Create `packages/shared/src/types/ticket.types.ts`
2. Modify `packages/shared/src/index.ts` — export ticket types

**No hook changes needed** — `useCRMTickets` already uses a local `Ticket` interface that can be replaced with the shared one.

---

### SUBTASK 3 — List Page: CustomerFilters + CustomerTable + CustomerRow
**Goal:** Implement the `/crm` list page with working data.

Files to modify:
1. `modules/crm/components/list/CustomerFilters.tsx` — full implementation
2. `modules/crm/components/list/CustomerTable.tsx` — full implementation
3. `modules/crm/components/list/CustomerRow.tsx` — full implementation
4. `modules/crm/components/list/SegmentFilter.tsx` — implement as a chip-based segment selector
5. `app/[locale]/(app)/crm/page.tsx` — replace DataGrid stub with real components

Depends on: SUBTASK 1 (BFF must work to test)

**Pattern reference:** Copy the exact pattern from:
- `ToutesCommandesTab.tsx` → for filter + pagination state management
- `OrdersFilters.tsx` → for `FilterDropdown` component pattern
- `OrdersRow.tsx` → for table row with status chip approach

**Important hooks to use:**
- `useCRMCustomers(params)` — already correct, just add more params
- `useDebounce` from `@/hooks/shared/useDebounce`
- `getWilayaByCode` from `@ferza/shared` for wilaya display

---

### SUBTASK 4 — Detail Page: Header + Sidebar Cards
**Goal:** Implement the detail page structure and sidebar cards.

Files to modify:
1. `app/[locale]/(app)/crm/[id]/page.tsx` — 2-column layout with tab nav
2. `modules/crm/components/detail/sidebar/ProfilResumeCard.tsx` — customer summary card
3. `modules/crm/components/detail/sidebar/ActionsRapidesCard.tsx` — action buttons
4. `modules/crm/components/detail/sidebar/TicketsActifsCard.tsx` — last 3 open tickets
5. `modules/crm/components/detail/sidebar/AuditLogCard.tsx` — creation/update dates

The detail page must:
- Call `useCRMCustomer(id)` for customer data
- Pass customer down to sidebar cards as prop
- Render a tab nav that switches between tab components

---

### SUBTASK 5 — Detail Page: Tabs (Profil + Commandes + Risque)
**Goal:** Implement the 3 most important tabs.

Files to modify:
1. `modules/crm/components/detail/tabs/ProfilContactTab.tsx`
   - Display: phone, email, wilaya, address
   - Edit: inline form calling `useUpdateCustomer`
2. `modules/crm/components/detail/tabs/HistoriqueCommandesTab.tsx`
   - Use `useOMSOrders({ search: customer.phone })` (OMS hook!)
   - Mini table: reference, date, status chip (reuse `OrderStatusChip`), codAmount
   - Row click → `router.push('/oms/' + orderId)`
3. `modules/crm/components/detail/tabs/RisqueFraudeTab.tsx`
   - Use `useRiskProfile(customerId)`
   - fraudScore: MUI LinearProgress (0–100%)
   - Flags: chip list
   - Blacklist section with reason if blacklisted

---

### SUBTASK 6 — Detail Page: Tabs (Tickets + Notes)
**Goal:** Implement tickets tab and notes placeholder.

Files to modify:
1. `modules/crm/components/detail/tabs/TicketsSupportTab.tsx`
   - Use `useCRMTickets(customerId)`
   - Table: id, subject, category, status chip, priority badge, date
   - "Nouveau ticket" button → `NewTicketModal`
2. `modules/crm/components/detail/tabs/InteractionsNotesTab.tsx`
   - Static notes display (no backend yet)
   - Textarea to add note (local state, no persistence for now)

---

### SUBTASK 7 — Modals: Blacklist + NewCustomer + NewTicket
**Goal:** Implement all 3 modals.

Files to modify:
1. `modules/crm/components/modals/BlacklistModal.tsx` — full implementation
2. `modules/crm/components/modals/NewCustomerModal.tsx` — full implementation
3. `modules/crm/components/modals/NewTicketModal.tsx` — full implementation
4. Create `modules/crm/hooks/invalidateCRM.ts`
5. Update all mutation hooks to use `invalidateCRMQueries`

---

### SUBTASK 8 — invalidateCRM + Cache Consistency
**Goal:** Ensure all mutations correctly invalidate the right queries.

This is a cross-cutting subtask that refactors all mutation hooks to use `invalidateCRMQueries`.

Files to modify:
1. Create `modules/crm/hooks/invalidateCRM.ts`
2. Update `useAddToBlacklist.ts`
3. Update `useRemoveFromBlacklist.ts`
4. Update `useUpdateCustomer.ts`
5. Update `useCreateCustomer.ts`
6. Update `useCreateTicket.ts`
7. Update `useUpdateTicket.ts`

---

### SUBTASK 9 — CRM index.ts + barrel exports
**Goal:** Export all new components from the module barrel.

File to modify: `modules/crm/index.ts`

Add all component exports following the OMS pattern (one section per subtask):
```typescript
// ─── list/ — Subtask 3 ────────────────────────────────────────────────────────
export { default as CustomerTable }   from './components/list/CustomerTable';
export { default as CustomerRow }     from './components/list/CustomerRow';
export { default as CustomerFilters } from './components/list/CustomerFilters';
// ... etc
```

---

## 9. Data Flow — Full Example

### 9.1 Loading the CRM list page
```
User navigates to /crm
  → CRMPage renders
  → calls useCRMCustomers({ page: 1, pageSize: 20 })
    → fetchBFF('/bff/crm', { params })
      → GET /bff/crm?page=1&pageSize=20
        → crm.routes.js validates query with Zod
        → customer.service.getCustomers({ page, pageSize })
          → reads crm.mock.js
          → for each customer: computeCustomerMetrics(id)
            → reads oms-orders.mock.js
            → filters orders where customerId === id
            → computes totalOrders, totalSpentTTC, lastOrderDate
          → sorts by 'name'
          → paginates
          → returns { data: [...enriched customers], meta: { total, page, pageSize } }
        → BFF responds with 200 JSON
      → fetchBFF returns typed data
    → useQuery caches under ['crm', 'customers', { page: 1, pageSize: 20 }]
  → CustomerTable renders CustomerRow × 20
```

### 9.2 Blacklisting a customer
```
User clicks "Blacklister" in ActionsRapidesCard
  → BlacklistModal opens
  → User fills in reason, clicks Confirmer
    → useAddToBlacklist.mutate({ id: 'CUST-003', reason: '...' })
      → fetchBFF('/bff/crm/CUST-003/blacklist', { method: 'PATCH', body: { reason } })
        → PATCH /bff/crm/CUST-003/blacklist
          → Zod validates body.reason min 10 chars
          → customer.service.blacklistCustomer('CUST-003', reason)
            → mutates crm.mock.js[2].blacklisted = true (in-memory)
            → returns enriched customer
          → BFF responds 200
      → onSuccess: invalidateCRMQueries(queryClient, 'CUST-003')
        → invalidates ['crm', 'customers'], ['crm', 'blacklist']
        → invalidates ['crm', 'customer', 'CUST-003']
        → invalidates ['crm', 'risk', 'CUST-003']
      → React Query refetches
      → UI shows "BLACKLISTÉ" banner on customer detail
      → List row shows blacklist chip
```

### 9.3 OMS order creation with auto-customer linking
```
User creates new order via NewOrderModal in OMS
  → useCreateOrder.mutate(payload)
    → POST /bff/oms
      → order.service.createOrder(validated)
        → calls customer.service.findOrCreateCustomer(phone, nameFr)
          → checks crm.mock.js for existing phone
          → if not found: creates new CUST-NNN, pushes to mock array
          → returns customer
        → creates order with customerId = customer.id
        → pushes to oms-orders.mock.js
      → BFF responds with created order
    → onSuccess: invalidateOMSQueries(queryClient)
  → CRM list reloads → new customer appears automatically
```

---

## 10. Consistency Rules Checklist

Before closing any subtask, verify:

- [ ] No `async/await` in frontend hooks — only `useQuery`/`useMutation` with `queryFn`
- [ ] Every BFF mutation route uses `validate(schema)` middleware
- [ ] Every BFF read route uses `validateQuery(schema)` middleware
- [ ] Every BFF route uses `requireRole(...)` middleware
- [ ] Services always guard with `if (env.useMock) { ... }` before real API path
- [ ] Mock mutations use `require()` cache side-effects (mutate the array in-place via index)
- [ ] Query keys follow `['crm', 'entity', params]` convention
- [ ] `onSuccess` in mutations calls `invalidateCRMQueries`, never `queryClient.setQueryData`
- [ ] All components use `'use client'` directive
- [ ] Wilaya display uses `getWilayaByCode(code)?.name ?? code` from `@ferza/shared`
- [ ] Currency display uses `formatDZD` from `@ferza/shared`
- [ ] `AppError` class used for all non-200 responses from BFF
- [ ] `placeholderData: (prev) => prev` on list queries
- [ ] No orders stored in CRM mock, no customer objects stored in OMS mock

---

## 11. File Paths Reference

```
ERP_ALGERIA/
├── frontend/
│   ├── apps/
│   │   ├── bff/src/
│   │   │   ├── routes/
│   │   │   │   └── crm.routes.js
│   │   │   ├── services/
│   │   │   │   ├── customer.service.js
│   │   │   │   └── crm-tickets.service.js       ← CREATE
│   │   │   ├── mocks/
│   │   │   │   ├── crm.mock.js
│   │   │   │   ├── crm-tickets.mock.js          ← CREATE
│   │   │   │   └── oms-orders.mock.js           ← ADD customerId fields
│   │   │   └── transformers/
│   │   │       └── crm.transformer.js           ← already complete
│   │   └── web/
│   │       ├── app/[locale]/(app)/crm/
│   │       │   ├── page.tsx                     ← IMPLEMENT
│   │       │   └── [id]/page.tsx                ← IMPLEMENT
│   │       └── modules/crm/
│   │           ├── index.ts                     ← UPDATE exports
│   │           ├── hooks/
│   │           │   ├── invalidateCRM.ts         ← CREATE
│   │           │   └── [all other hooks]        ← use invalidateCRM
│   │           └── components/
│   │               ├── list/                    ← ALL IMPLEMENT
│   │               ├── detail/tabs/             ← ALL IMPLEMENT
│   │               ├── detail/sidebar/          ← ALL IMPLEMENT
│   │               └── modals/                  ← ALL IMPLEMENT
│   └── packages/shared/src/
│       ├── types/
│       │   ├── customer.types.ts               ← complete, do not modify
│       │   └── ticket.types.ts                 ← CREATE
│       └── index.ts                            ← ADD ticket exports
└── CRM_ARCHITECTURE.md                         ← this file
```

---

*End of CRM Architecture Document — v1.0 — 2026-03-25*
