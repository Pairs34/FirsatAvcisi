export type CommissionSource = 'reference' | 'panel' | 'settlement';
export type MatchStatus = 'unverified' | 'verified' | 'mismatch';
export type WatchStatus = 'active' | 'paused';

export interface Opportunity {
  id: string;
  name: string;
  category: string;
  brand: string;
  barcode: string;
  trendyolUrl: string;
  hepsiburadaUrl: string;
  saleGross: number;
  purchaseGross: number;
  observedPurchaseGross?: number;
  observedAt: string;
  purchaseVatPercent: number;
  saleVatPercent: number;
  inputVatDeductible: boolean;
  commissionPercent: number;
  commissionSource: CommissionSource;
  commissionVatIncluded: boolean;
  shippingGross: number;
  serviceGross: number;
  packagingGross: number;
  sellerDiscountGross: number;
  cardDiscountGross: number;
  cardDiscountConfirmed: boolean;
  matchStatus: MatchStatus;
  watchStatus: WatchStatus;
  demand: string;
  note: string;
}

export interface WorkspaceData {
  version: 1;
  opportunities: Opportunity[];
  selectedId: string;
  minProfit: number;
}
