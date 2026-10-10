import type { Opportunity } from './types';

export interface ProfitResult {
  finalSaleGross: number;
  finalPurchaseGross: number;
  saleNet: number;
  purchaseNetCost: number;
  saleVat: number;
  purchaseInputVat: number;
  commissionGross: number;
  commissionNet: number;
  commissionInputVat: number;
  serviceNet: number;
  shippingNet: number;
  packagingNet: number;
  vatBalance: number;
  withholding: number;
  grossSpread: number;
  operatingProfit: number;
  afterWithholding: number;
  marginPercent: number;
  breakEvenSaleGross: number | null;
  hasOpportunity: boolean;
}

const clampNonnegative = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);
const netOfVat = (gross: number, percent: number) => gross / (1 + percent / 100);

export function calculateProfit(item: Opportunity, minProfit = 0): ProfitResult {
  const saleVatPercent = clampNonnegative(item.saleVatPercent);
  const purchaseVatPercent = clampNonnegative(item.purchaseVatPercent);
  const saleGross = clampNonnegative(item.saleGross);
  const sellerDiscount = clampNonnegative(item.sellerDiscountGross);
  const finalSaleGross = Math.max(0, saleGross - sellerDiscount);
  const cardDiscount = item.cardDiscountConfirmed ? clampNonnegative(item.cardDiscountGross) : 0;
  const finalPurchaseGross = Math.max(0, clampNonnegative(item.purchaseGross) - cardDiscount);
  const saleNet = netOfVat(finalSaleGross, saleVatPercent);
  const purchaseNet = netOfVat(finalPurchaseGross, purchaseVatPercent);
  const purchaseInputVat = item.inputVatDeductible ? finalPurchaseGross - purchaseNet : 0;
  const purchaseNetCost = finalPurchaseGross - purchaseInputVat;

  // Trendyol's published commission table states that the rate includes VAT.
  // The alternative mode is retained for contracts that quote a fee before VAT.
  const commissionBase = finalSaleGross * clampNonnegative(item.commissionPercent) / 100;
  const commissionGross = item.commissionVatIncluded ? commissionBase : commissionBase * 1.2;
  const commissionNet = netOfVat(commissionGross, 20);
  const commissionInputVat = commissionGross - commissionNet;

  const serviceGross = clampNonnegative(item.serviceGross);
  const shippingGross = clampNonnegative(item.shippingGross);
  const packagingGross = clampNonnegative(item.packagingGross);
  const serviceNet = netOfVat(serviceGross, 20);
  const shippingNet = netOfVat(shippingGross, 20);
  const packagingNet = netOfVat(packagingGross, 20);
  const saleVat = finalSaleGross - saleNet;
  const vatBalance = saleVat - purchaseInputVat - commissionInputVat
    - (serviceGross - serviceNet) - (shippingGross - shippingNet) - (packagingGross - packagingNet);
  const withholding = saleNet * 0.01;
  const grossSpread = finalSaleGross - finalPurchaseGross;
  const operatingProfit = saleNet - purchaseNetCost - commissionNet - serviceNet - shippingNet - packagingNet;
  const afterWithholding = operatingProfit - withholding;
  const marginPercent = saleNet > 0 ? operatingProfit / saleNet * 100 : 0;

  const feeRateGross = clampNonnegative(item.commissionPercent) / 100 * (item.commissionVatIncluded ? 1 : 1.2);
  const saleCoefficient = 1 / (1 + saleVatPercent / 100) - feeRateGross / 1.2;
  const fixedNetCost = purchaseNetCost + serviceNet + shippingNet + packagingNet;
  const breakEvenSaleGross = saleCoefficient > 0
    ? Math.max(0, fixedNetCost / saleCoefficient + sellerDiscount)
    : null;

  return {
    finalSaleGross,
    finalPurchaseGross,
    saleNet,
    purchaseNetCost,
    saleVat,
    purchaseInputVat,
    commissionGross,
    commissionNet,
    commissionInputVat,
    serviceNet,
    shippingNet,
    packagingNet,
    vatBalance,
    withholding,
    grossSpread,
    operatingProfit,
    afterWithholding,
    marginPercent,
    breakEvenSaleGross,
    hasOpportunity: operatingProfit >= minProfit && item.matchStatus === 'verified'
      && item.commissionSource !== 'reference' && item.watchStatus === 'active',
  };
}
