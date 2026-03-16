export const bcStates = ["draft", "approved", "rejected", "received"] as const;

export type BCState = (typeof bcStates)[number];
