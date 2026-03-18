/**
 * Algerian TVA (VAT) rates:
 *  - Standard : 19%
 *  - Reduced  :  9%
 *  - Exempt   :  0%
 */

export type TVARate = 'standard' | 'reduced' | 'exempt';

const TVA_RATES: Record<TVARate, number> = {
  standard: 0.19,
  reduced: 0.09,
  exempt: 0,
};

export interface TVAResult {
  htAmount: number;    // Amount before tax
  tvaAmount: number;   // Tax amount
  ttcAmount: number;   // Amount after tax (TTC = Toutes Taxes Comprises)
  rate: TVARate;
  rateValue: number;   // e.g. 0.19
}

/**
 * Applies TVA to a HT (before tax) amount.
 * All amounts are in DZD, rounded to nearest integer (1 DZD tolerance).
 */
export const applyTVA = (htAmount: number, rate: TVARate = 'standard'): TVAResult => {
  const rateValue = TVA_RATES[rate];
  const tvaAmount = Math.round(htAmount * rateValue);
  const ttcAmount = htAmount + tvaAmount;

  return {
    htAmount,
    tvaAmount,
    ttcAmount,
    rate,
    rateValue,
  };
};

/**
 * Extracts HT amount from a TTC amount (reverse TVA calculation).
 */
export const extractHT = (ttcAmount: number, rate: TVARate = 'standard'): TVAResult => {
  const rateValue = TVA_RATES[rate];
  const htAmount = Math.round(ttcAmount / (1 + rateValue));
  const tvaAmount = ttcAmount - htAmount;

  return {
    htAmount,
    tvaAmount,
    ttcAmount,
    rate,
    rateValue,
  };
};