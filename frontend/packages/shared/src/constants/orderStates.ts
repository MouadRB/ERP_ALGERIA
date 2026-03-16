export const orderStates = ["pending", "confirmed", "shipped", "delivered"] as const;

export type OrderState = (typeof orderStates)[number];
