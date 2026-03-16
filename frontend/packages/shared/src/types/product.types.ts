export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: "active" | "archived";
}
