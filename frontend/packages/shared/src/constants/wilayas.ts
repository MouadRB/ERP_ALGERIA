export const wilayas = [
  "Algiers",
  "Oran",
  "Constantine",
  "Blida"
] as const;

export type Wilaya = (typeof wilayas)[number];
