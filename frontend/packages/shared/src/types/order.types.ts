import type { OrderState } from '../constants/orderStates';

export interface OrderItem {
  productId:    string;
  sku:          string;
  nameFr:       string;
  nameAr:       string;
  quantity:     number;
  unitPriceHT:  number;
  unitPriceTTC: number;
  tvaRate:      'standard' | 'reduced' | 'exempt';
}

export interface Order {
  id:                   string;
  reference:            string;
  customerPhone:        string;
  customerNameFr:       string;
  customerNameAr:       string;
  wilayaCode:           string;
  address:              string;
  commune?:             string;
  source?:              string;
  trackingNumber?:      string;
  items:                OrderItem[];
  totalHT:              number;
  totalTVA:             number;
  totalTTC:             number;
  codAmount:            number;
  status:               OrderState;
  carrier:              string | null;
  deliveryAttempts:     number;
  autoCancelAt:         string | null;
  riskLevel:            'LOW' | 'MEDIUM' | 'HIGH';
  fraudScore:           number | null;
  createdBy:            string;
  createdAt:            string;
  updatedAt:            string;
  revenueRecognizedAt:  string | null;
  returnOutcome?:       'resalable' | 'resent' | 'destroyed';
}