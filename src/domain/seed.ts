import type { Opportunity, WorkspaceData } from './types';

const huaweiUrl = 'https://www.hepsiburada.com/huawei-yeni-2025-matepad-11-5-papermatte-8gb-256gb-tablet-klavye-uzay-grisi-kalem-dahil-degildir-p-HBCV00009OHIZV?magaza=Hepsiburada';

export const seedOpportunity: Opportunity = {
  id: 'huawei-matepad-demo',
  name: 'Huawei MatePad 11.5” PaperMatte 8/256 GB + Klavye',
  category: 'Elektronik / Tablet',
  brand: 'Huawei',
  barcode: '',
  trendyolUrl: '',
  hepsiburadaUrl: huaweiUrl,
  saleGross: 16328,
  purchaseGross: 14499,
  observedPurchaseGross: 16999,
  observedAt: '2026-09-19',
  purchaseVatPercent: 20,
  saleVatPercent: 20,
  inputVatDeductible: true,
  commissionPercent: 8.5,
  commissionSource: 'reference',
  commissionVatIncluded: true,
  shippingGross: 0,
  serviceGross: 13.19,
  packagingGross: 0,
  sellerDiscountGross: 0,
  cardDiscountGross: 0,
  cardDiscountConfirmed: false,
  matchStatus: 'unverified',
  watchStatus: 'active',
  demand: 'Kullanıcı satış ilanı · talep verisi bekleniyor',
  note: '14.499 TL geçmiş alış; 16.999 TL 19 Eylül HB gözlemi. Satış henüz doğrulanmadı. %8,5, resmi görünümlü tablo kopyasındaki genel tablet oranıdır; hesabın Ticari Şartlar ekranından teyit edilmeli.',
};

export function newOpportunity(): Opportunity {
  return {
    ...seedOpportunity,
    id: crypto.randomUUID(),
    name: 'Yeni ürün',
    category: '',
    brand: '',
    barcode: '',
    trendyolUrl: '',
    hepsiburadaUrl: '',
    saleGross: 0,
    purchaseGross: 0,
    observedPurchaseGross: undefined,
    observedAt: new Date().toISOString().slice(0, 10),
    commissionPercent: 0,
    serviceGross: 13.19,
    demand: '',
    note: '',
  };
}

export const seedWorkspace: WorkspaceData = {
  version: 1,
  opportunities: [seedOpportunity],
  selectedId: seedOpportunity.id,
  minProfit: 250,
};
