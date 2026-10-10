import { describe, expect, it } from 'vitest';
import { calculateProfit } from '../src/domain/profit';
import { seedOpportunity } from '../src/domain/seed';

describe('product profit model', () => {
  it('separates VAT-inclusive commission and withholding for the Huawei pilot', () => {
    const result = calculateProfit(seedOpportunity, 250);
    expect(result.grossSpread).toBe(1829);
    expect(result.commissionGross).toBeCloseTo(1387.88, 2);
    expect(result.operatingProfit).toBeCloseTo(356.61, 2);
    expect(result.withholding).toBeCloseTo(136.07, 2);
    expect(result.afterWithholding).toBeCloseTo(220.54, 2);
    expect(result.hasOpportunity).toBe(false); // reference rate and unmatched SKU
  });

  it('does not deduct purchase VAT without an eligible purchase invoice', () => {
    const withInvoice = calculateProfit(seedOpportunity);
    const withoutInvoice = calculateProfit({ ...seedOpportunity, inputVatDeductible: false });
    expect(withInvoice.operatingProfit - withoutInvoice.operatingProfit).toBeCloseTo(2416.5, 2);
    expect(withoutInvoice.operatingProfit).toBeLessThan(0);
  });

  it('applies card discounts only when confirmed at checkout', () => {
    const unconfirmed = calculateProfit({ ...seedOpportunity, cardDiscountGross: 500 });
    const confirmed = calculateProfit({ ...seedOpportunity, cardDiscountGross: 500, cardDiscountConfirmed: true });
    expect(unconfirmed.finalPurchaseGross).toBe(14499);
    expect(confirmed.finalPurchaseGross).toBe(13999);
    expect(confirmed.operatingProfit - unconfirmed.operatingProfit).toBeCloseTo(500 / 1.2, 2);
  });

  it('uses final seller-funded sale price as the commission base', () => {
    const result = calculateProfit({ ...seedOpportunity, sellerDiscountGross: 328 });
    expect(result.finalSaleGross).toBe(16000);
    expect(result.commissionGross).toBeCloseTo(1360, 2);
  });

  it('marks an opportunity only with verified match and panel or settlement rate', () => {
    const verified = { ...seedOpportunity, matchStatus: 'verified' as const, commissionSource: 'panel' as const };
    expect(calculateProfit(verified, 250).hasOpportunity).toBe(true);
    expect(calculateProfit(verified, 500).hasOpportunity).toBe(false);
  });
});
