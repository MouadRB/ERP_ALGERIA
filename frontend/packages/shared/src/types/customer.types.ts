export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: "standard" | "vip";
}
