export const carriers = ["DHL", "UPS", "Yalidine", "ZrExpress"] as const;

export type Carrier = (typeof carriers)[number];
