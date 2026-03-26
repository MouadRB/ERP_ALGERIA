export const ORDER_STATES = [
  'Draft',
  'AwaitingValidation',
  'Confirmed',
  'AwaitingPickup',
  'HandedToCarrier',
  'OutForDelivery',
  'DeliveredCOD_Confirmed',
  'COD_Remitted',
  'DeliveryFailed_Absent',
  'ReturnInTransit_Refused',
  'LostInTransit',
  'Returned',
  'Cancelled',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export const TERMINAL_STATES: OrderState[] = [
  'DeliveredCOD_Confirmed',
  'COD_Remitted',
  'Returned',
  'Cancelled',
  'LostInTransit',
];

export const REVENUE_RECOGNIZED_STATE: OrderState = 'DeliveredCOD_Confirmed';

export const MAX_DELIVERY_ATTEMPTS = 3;

export const LOST_IN_TRANSIT_THRESHOLD_DAYS = 15;

// Keep backward compat alias — other modules may use the old name
export const orderStates = ORDER_STATES;