// ─────────────────────────────────────────────────────────────────────────────
// Engine-B CRM transformers.
//
// Engine-B is the SINGLE source of truth for CRM. Its DTOs use English
// PascalCase enums (Open, InProgress, Resolved, …) and ASP.NET-style field
// names (customerId, fullName, mobilePhone, …). The frontend speaks French
// labels ("Ouvert", "En cours", "Critique", "Fidèle", "A risque", …) and a
// stable PascalCase shape (id, nameFr, totalSpentTTC, …).
//
// This module owns the two-way bridge:
//   • inbound  : frontend body → Engine-B request DTO
//   • outbound : Engine-B response → frontend shape
//   • dictionaries: enum maps (status, priority, segment, risk-level)
// ─────────────────────────────────────────────────────────────────────────────

// ── Enum dictionaries ───────────────────────────────────────────────────────

const TICKET_STATUS_FROM_ENGINE = {
  Open:          'Ouvert',
  InProgress:    'En cours',
  WaitingClient: 'En attente client',
  Escalated:     'Escaladé',
  Resolved:      'Résolu',
  Closed:        'Fermé',
};
const TICKET_STATUS_TO_ENGINE = {
  Ouvert:              'Open',
  'En cours':          'InProgress',
  'En attente client': 'WaitingClient',
  Escaladé:            'Escalated',
  Résolu:              'Resolved',
  Fermé:               'Closed',
  // English passthrough so callers may already speak Engine-B vocabulary.
  Open:          'Open',
  InProgress:    'InProgress',
  WaitingClient: 'WaitingClient',
  Escalated:     'Escalated',
  Resolved:      'Resolved',
  Closed:        'Closed',
};

const TICKET_PRIORITY_FROM_ENGINE = {
  Critical: 'Critique',
  High:     'Haute',
  Normal:   'Normale',
  Low:      'Faible',
};
const TICKET_PRIORITY_TO_ENGINE = {
  Critique: 'Critical',
  Haute:    'High',
  Normale:  'Normal',
  Faible:   'Low',
  Critical: 'Critical',
  High:     'High',
  Normal:   'Normal',
  Low:      'Low',
};

const SEGMENT_FROM_ENGINE = {
  Nouveau:     'Nouveau',
  Fidele:      'Fidèle',
  VIP:         'VIP',
  ARisque:     'A risque',
  Inactif:     'Inactif',
  Blacklisted: 'Liste noire',
};
const SEGMENT_TO_ENGINE = {
  Nouveau:       'Nouveau',
  'Fidèle':      'Fidele',
  Fidele:        'Fidele',
  VIP:           'VIP',
  'A risque':    'ARisque',
  ARisque:       'ARisque',
  Inactif:       'Inactif',
  'Liste noire': 'Blacklisted',
  Blacklisted:   'Blacklisted',
};

const RISK_LEVEL_FROM_ENGINE = {
  Faible: 'LOW',
  Moyen:  'MEDIUM',
  Eleve:  'HIGH',
};
const RISK_LEVEL_TO_ENGINE = {
  LOW:      'Faible',
  MEDIUM:   'Moyen',
  HIGH:     'Eleve',
  CRITICAL: 'Eleve',
};

const numberOrZero = (v) => {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapTicketStatusFromEngine   = (s) => TICKET_STATUS_FROM_ENGINE[s]   ?? s ?? null;
const mapTicketStatusToEngine     = (s) => TICKET_STATUS_TO_ENGINE[s]     ?? s ?? undefined;
const mapTicketPriorityFromEngine = (p) => TICKET_PRIORITY_FROM_ENGINE[p] ?? p ?? null;
const mapTicketPriorityToEngine   = (p) => TICKET_PRIORITY_TO_ENGINE[p]   ?? p ?? undefined;
const mapSegmentFromEngine        = (s) => SEGMENT_FROM_ENGINE[s]         ?? s ?? null;
const mapSegmentToEngine          = (s) => SEGMENT_TO_ENGINE[s]           ?? s ?? undefined;
const mapRiskLevelFromEngine      = (r) => RISK_LEVEL_FROM_ENGINE[r]      ?? r ?? 'LOW';
const mapRiskLevelToEngine        = (r) => RISK_LEVEL_TO_ENGINE[r]        ?? r ?? undefined;

// ── Outbound: Engine-B → frontend ───────────────────────────────────────────

const transformCustomer = (raw) => {
  if (!raw) return null;
  const wilayaRaw = raw.wilayaCode ?? raw.wilaya ?? null;
  return {
    id:               raw.id ?? raw.customerId,
    phone:            raw.phone ?? raw.mobilePhone ?? raw.phoneNumber ?? null,
    phoneSec:         raw.phoneSec ?? raw.secondaryPhone ?? null,
    nameFr:           raw.nameFr ?? raw.fullNameFr ?? raw.fullName ?? raw.name ?? null,
    nameAr:           raw.nameAr ?? raw.fullNameAr ?? '',
    email:            raw.email ?? null,
    wilayaCode:       wilayaRaw === null || wilayaRaw === undefined ? null : String(wilayaRaw),
    commune:          raw.commune ?? raw.city ?? null,
    address:          raw.address ?? raw.deliveryAddress ?? '',
    segment:          mapSegmentFromEngine(raw.segment) ?? 'Nouveau',
    rawSegment:       raw.segment ?? null,
    blacklisted:      raw.blacklisted ?? raw.isBlacklisted ?? false,
    blacklistMotif:   raw.blacklistMotif ?? raw.blacklistReason ?? null,
    blacklistReason:  raw.blacklistReasonDetail ?? raw.blacklistNotes ?? raw.blacklistReason ?? null,
    blacklistedAt:    raw.blacklistedAt ?? null,
    blacklistedBy:    raw.blacklistedBy ?? null,
    riskLevel:        mapRiskLevelFromEngine(raw.riskLevel),
    rawRiskLevel:     raw.riskLevel ?? null,
    fraudScore:       raw.fraudScore ?? raw.riskScore ?? null,
    preferredChannel: raw.preferredChannel ?? null,
    preferredLanguage: raw.preferredLanguage ?? null,
    totalOrders:      numberOrZero(raw.totalOrders),
    totalSpentTTC:    numberOrZero(raw.totalSpentTTC ?? raw.totalSpent ?? raw.totalRevenue),
    panierMoyen:      raw.panierMoyen ?? raw.averageOrderValue ?? null,
    tauxRetour:       raw.tauxRetour ?? raw.returnRate ?? null,
    tauxAnnulation:   raw.tauxAnnulation ?? raw.cancellationRate ?? null,
    deliveredCount:   numberOrZero(raw.deliveredCount),
    cancelledCount:   numberOrZero(raw.cancelledCount),
    returnedCount:    numberOrZero(raw.returnedCount),
    lastOrderDate:    raw.lastOrderDate ?? null,
    lastOrderRef:     raw.lastOrderRef ?? raw.lastOrderReference ?? null,
    lastOrderStatus:  raw.lastOrderStatus ?? null,
    ticketCount:      raw.ticketCount ?? null,
    openTicketCount:  raw.openTicketCount ?? null,
    interactionCount: raw.interactionCount ?? null,
    isVip:            raw.isVip ?? null,
    createdAt:        raw.createdAt ?? null,
    updatedAt:        raw.updatedAt ?? raw.createdAt ?? null,
  };
};

const transformCustomerList = (rawList = []) => (rawList || []).map(transformCustomer);

const transformInteraction = (raw) => {
  if (!raw) return null;
  return {
    id:         raw.id ?? raw.interactionId,
    customerId: raw.customerId ?? null,
    type:       raw.type ?? raw.channel ?? 'Note',
    direction:  raw.direction ?? null,
    subject:    raw.subject ?? null,
    content:    raw.content ?? raw.note ?? raw.body ?? '',
    agentId:    raw.agentId ?? null,
    agentName:  raw.agentName ?? raw.createdBy ?? null,
    createdAt:  raw.createdAt ?? raw.timestamp ?? null,
  };
};
const transformInteractionList = (rawList = []) => (rawList || []).map(transformInteraction);

const transformTicketNote = (raw = {}) => ({
  content:   raw.content ?? raw.note ?? '',
  author:    raw.author ?? raw.agentName ?? null,
  createdAt: raw.createdAt ?? null,
});

const transformTicket = (raw) => {
  if (!raw) return null;
  return {
    id:                 raw.id ?? raw.ticketId,
    ticketNumber:       raw.ticketNumber ?? null,
    customerId:         raw.customerId,
    customerNameFr:     raw.customerNameFr ?? raw.customerName ?? null,
    customerPhone:      raw.customerPhone ?? null,
    customerWilayaCode: raw.customerWilayaCode ?? null,
    orderId:            raw.orderId ?? raw.relatedOrderId ?? null,
    category:           raw.category ?? raw.type ?? null,
    rawCategory:        raw.type ?? raw.category ?? null,
    status:             mapTicketStatusFromEngine(raw.status) ?? 'Ouvert',
    rawStatus:          raw.status ?? null,
    priority:           mapTicketPriorityFromEngine(raw.priority) ?? 'Normale',
    rawPriority:        raw.priority ?? null,
    subject:            raw.subject ?? null,
    description:        raw.description ?? '',
    agentId:            raw.agentId ?? raw.assignedAgentId ?? null,
    agentName:          raw.agentName ?? raw.assignedAgentName ?? null,
    escalated:          raw.escalated ?? raw.isEscalated ?? raw.status === 'Escalated',
    escalatedAt:        raw.escalatedAt ?? null,
    closedAt:           raw.closedAt ?? null,
    resolvedAt:         raw.resolvedAt ?? null,
    lastAction:         raw.lastAction ?? raw.lastActionAt ?? null,
    notes:              (raw.notes ?? []).map(transformTicketNote),
    createdAt:          raw.createdAt ?? null,
    updatedAt:          raw.updatedAt ?? raw.lastActionAt ?? raw.createdAt ?? null,
  };
};
const transformTicketList = (rawList = []) => (rawList || []).map(transformTicket);

// Pagination — Engine-B uses 1-based pagination; we tolerate both shapes
// (pagination block at the envelope level OR alongside the data array).
const transformPagination = (raw, fallback = { page: 1, pageSize: 20 }) => {
  if (!raw) {
    return { total: 0, page: fallback.page, pageSize: fallback.pageSize, totalPages: 0 };
  }
  const page       = numberOrZero(raw.page ?? raw.pageNumber);
  const pageSize   = numberOrZero(raw.pageSize ?? raw.size) || fallback.pageSize;
  const total      = numberOrZero(raw.total ?? raw.totalCount ?? raw.totalElements ?? raw.totalItems);
  const totalPages = numberOrZero(raw.totalPages ?? Math.ceil(total / Math.max(pageSize, 1)));
  return {
    total,
    page:       page <= 0 ? fallback.page : page,
    pageSize,
    totalPages,
  };
};

const extractRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items))   return data.items;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const transformPagedCustomers = ({ data, pagination } = {}, fallback) => ({
  data: transformCustomerList(extractRows(data)),
  meta: transformPagination(pagination ?? data, fallback),
});

const transformPagedTickets = ({ data, pagination } = {}, fallback) => ({
  data: transformTicketList(extractRows(data)),
  meta: transformPagination(pagination ?? data, fallback),
});

const transformPagedInteractions = ({ data, pagination } = {}, fallback) => {
  const rows = extractRows(data);
  // Engine-B GET /customers/{id}/interactions returns a bare array — no
  // pagination envelope. Synthesize a total from the row count so the meta
  // surface stays consistent with /customers and /tickets.
  let meta;
  if (pagination) {
    meta = transformPagination(pagination, fallback);
  } else if (Array.isArray(data)) {
    meta = transformPagination(
      { total: rows.length, page: fallback?.page ?? 1, pageSize: fallback?.pageSize ?? rows.length ?? 20 },
      fallback,
    );
  } else {
    meta = transformPagination(data, fallback);
  }
  return { data: transformInteractionList(rows), meta };
};

// ── Inbound: frontend → Engine-B ────────────────────────────────────────────

// Engine-B Wilaya is an int 1–48. Frontend may send the code as a string
// ("16") or as the prefixed form ("DZ-16"). Coerce defensively.
const toWilayaInt = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const m = String(v).match(/\d+/);
  if (!m) return undefined;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : undefined;
};

// Engine-B CreateCustomerRequest(FullName, Phone, Wilaya:int, City, Email?).
const buildCreateCustomerRequest = (payload = {}) => ({
  fullName: payload.nameFr ?? payload.fullName ?? payload.nomComplet ?? payload.name,
  phone:    payload.phone,
  wilaya:   toWilayaInt(payload.wilayaCode ?? payload.wilaya),
  city:     payload.commune ?? payload.city ?? '',
  email:    payload.email ?? null,
});

// Engine-B UpdateCustomerRequest(FullName?, Phone?, Wilaya?:int, City?, Email?,
// SecondaryPhone?, PreferredChannel?, PreferredLanguage?, DeliveryAddress?).
// Forward only fields the caller explicitly sent (preserve PATCH semantics).
const buildUpdateCustomerRequest = (payload = {}) => {
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(payload, k);
  if (has('nameFr'))            out.fullName         = payload.nameFr;
  if (has('phone'))             out.phone            = payload.phone;
  if (has('wilayaCode'))        out.wilaya           = toWilayaInt(payload.wilayaCode);
  if (has('commune'))           out.city             = payload.commune;
  if (has('email'))             out.email            = payload.email;
  if (has('phoneSec'))          out.secondaryPhone   = payload.phoneSec;
  if (has('preferredChannel'))  out.preferredChannel = payload.preferredChannel;
  if (has('preferredLanguage')) out.preferredLanguage = payload.preferredLanguage;
  if (has('address'))           out.deliveryAddress  = payload.address;
  return out;
};

// Engine-B BlacklistRequest(Reason, Notes?).
const buildBlacklistRequest = (payload = {}) => ({
  reason: payload.motif ?? payload.reason ?? null,
  notes:  payload.reason && payload.motif && payload.reason !== payload.motif
            ? payload.reason
            : (payload.notes ?? null),
});

// Engine-B CreateInteractionRequest(CustomerId, Content, Type?, CreatedBy?).
const buildInteractionRequest = (customerId, payload = {}, agent = {}) => ({
  customerId,
  content:   payload.content ?? payload.note ?? payload.body ?? '',
  type:      payload.type ?? 'Note',
  createdBy: payload.agentName ?? agent.nameFr ?? agent.id ?? null,
});

// Engine-B CreateTicketRequest(CustomerId, Subject, Description?, Type?,
// Priority?, RelatedOrderId?, AssignedAgentName?).
const buildCreateTicketRequest = (payload = {}, agent = {}) => ({
  customerId:        payload.customerId,
  subject:           payload.subject ?? payload.category ?? '',
  description:       payload.description ?? '',
  type:              payload.category ?? payload.type ?? null,
  priority:          mapTicketPriorityToEngine(payload.priority) ?? 'Normal',
  relatedOrderId:    payload.orderId ?? payload.relatedOrderId ?? null,
  assignedAgentName: payload.agentName ?? agent.nameFr ?? null,
});

// Engine-B UpdateTicketRequest(Subject?, Status?, Type?, Priority?,
// RelatedOrderId?, AssignedAgentName?).
const buildUpdateTicketRequest = (payload = {}) => {
  const out = {};
  if (payload.subject   !== undefined) out.subject  = payload.subject;
  if (payload.status    !== undefined) out.status   = mapTicketStatusToEngine(payload.status);
  if (payload.category  !== undefined) out.type     = payload.category;
  if (payload.type      !== undefined) out.type     = payload.type;
  if (payload.priority  !== undefined) out.priority = mapTicketPriorityToEngine(payload.priority);
  if (payload.orderId   !== undefined) out.relatedOrderId    = payload.orderId;
  if (payload.agentName !== undefined) out.assignedAgentName = payload.agentName;
  return out;
};

// Engine-B AssignTicketRequest(AgentName). Fall back to agentId so callers
// that only have the agent's identifier (no display name) still produce a
// valid payload — the value is opaque to engine-b.
const buildAssignTicketRequest = (payload = {}) => ({
  agentName: payload.agentName ?? payload.agentId ?? null,
});

// Engine-B escalate/close take no body — keep helpers as no-op stubs so the
// service layer can stay generic.
const buildEscalateTicketRequest = () => ({});
const buildCloseTicketRequest    = () => ({});

// Engine-B MergeCustomerRequest(TargetCustomerId:Guid).
const buildMergeRequest = (payload = {}) => ({
  targetCustomerId: payload.targetCustomerId
    ?? payload.duplicateCustomerId
    ?? (Array.isArray(payload.duplicateCustomerIds) ? payload.duplicateCustomerIds[0] : null),
});

// Engine-B CustomerQueryParams: Search, Segment(enum), Risk(enum), Wilaya(int),
// IsBlacklisted, Page, PageSize, SortBy, SortDesc.
const SORT_KEY_TO_ENGINE = {
  last_order:     { sortBy: 'LastOrderDate', sortDesc: true  },
  ca_desc:        { sortBy: 'TotalRevenue',  sortDesc: true  },
  commandes_desc: { sortBy: 'TotalOrders',   sortDesc: true  },
  retour_desc:    { sortBy: 'ReturnRate',    sortDesc: true  },
  risque_desc:    { sortBy: 'RiskScore',     sortDesc: true  },
  nom:            { sortBy: 'FullName',      sortDesc: false },
};

const buildCustomerListQuery = (q = {}) => {
  const out = {};
  if (q.page)     out.page     = q.page;
  if (q.pageSize) out.pageSize = q.pageSize;
  if (q.search)   out.search   = q.search;
  if (q.segment && q.segment !== 'Tous') {
    out.segment = mapSegmentToEngine(q.segment) ?? q.segment;
  }
  if (q.wilayaCode && q.wilayaCode !== 'Toutes') {
    const w = toWilayaInt(q.wilayaCode);
    if (w !== undefined) out.wilaya = w;
  }
  if (q.blacklisted !== undefined) out.isBlacklisted = q.blacklisted;
  if (q.riskLevel)  out.risk = mapRiskLevelToEngine(q.riskLevel) ?? q.riskLevel;
  if (q.sort && SORT_KEY_TO_ENGINE[q.sort]) {
    Object.assign(out, SORT_KEY_TO_ENGINE[q.sort]);
  }
  return out;
};

// Engine-B TicketQueryParams: CustomerId, Status(enum), Priority(enum),
// Type(enum), Search, Page, PageSize, SortBy, SortDesc.
const buildTicketListQuery = (q = {}) => {
  const out = {};
  if (q.page)       out.page       = q.page;
  if (q.pageSize)   out.pageSize   = q.pageSize;
  if (q.customerId) out.customerId = q.customerId;
  if (q.status)     out.status     = mapTicketStatusToEngine(q.status)   ?? q.status;
  if (q.category)   out.type       = q.category;
  if (q.priority)   out.priority   = mapTicketPriorityToEngine(q.priority) ?? q.priority;
  if (q.search)     out.search     = q.search;
  return out;
};

// ── Error normalization (Engine-B → BFF surface) ───────────────────────────
//
// Engine-B error envelope: { success:false, errors:{ field: msg }, message }
// BFF surface format:      { error: { code, message, field } }
//
// engine-b.client already throws AppError on non-2xx — this helper is for any
// code path that needs to project the envelope manually (logging, fallback).
const transformEngineError = (raw = {}) => {
  if (!raw || raw.success !== false) return null;
  const fieldErrors = raw.errors || {};
  const firstField  = Object.keys(fieldErrors)[0];
  return {
    error: {
      code:    raw.code || 'ENGINE_B_ERROR',
      message: raw.message || (firstField ? fieldErrors[firstField] : 'Erreur Engine-B.'),
      field:   firstField,
    },
  };
};

// ── Standard envelope helper ───────────────────────────────────────────────

const buildEnvelope = (data, meta = undefined) =>
  meta === undefined ? { data } : { data, meta };

module.exports = {
  // dictionaries
  TICKET_STATUS_FROM_ENGINE,
  TICKET_STATUS_TO_ENGINE,
  TICKET_PRIORITY_FROM_ENGINE,
  TICKET_PRIORITY_TO_ENGINE,
  SEGMENT_FROM_ENGINE,
  SEGMENT_TO_ENGINE,
  RISK_LEVEL_FROM_ENGINE,
  RISK_LEVEL_TO_ENGINE,
  // mappers
  mapTicketStatusFromEngine,
  mapTicketStatusToEngine,
  mapTicketPriorityFromEngine,
  mapTicketPriorityToEngine,
  mapSegmentFromEngine,
  mapSegmentToEngine,
  mapRiskLevelFromEngine,
  mapRiskLevelToEngine,
  // outbound
  transformCustomer,
  transformCustomerList,
  transformInteraction,
  transformInteractionList,
  transformTicket,
  transformTicketList,
  transformPagination,
  transformPagedCustomers,
  transformPagedTickets,
  transformPagedInteractions,
  // inbound
  buildCreateCustomerRequest,
  buildUpdateCustomerRequest,
  buildBlacklistRequest,
  buildInteractionRequest,
  buildCreateTicketRequest,
  buildUpdateTicketRequest,
  buildAssignTicketRequest,
  buildEscalateTicketRequest,
  buildCloseTicketRequest,
  buildMergeRequest,
  buildCustomerListQuery,
  buildTicketListQuery,
  // errors / envelope
  transformEngineError,
  buildEnvelope,
};
