import test from "node:test";
import assert from "node:assert/strict";
import { calculateOffer, CURRENT } from "../files/comp-calculator/calculator.js";

const defaults = { days: 4, premium: 15, inOffice: false, match: 23350, benefits: 5000 };

test("default offer applies a 15% switching premium", () => {
  const result = calculateOffer(defaults);
  assert.equal(result.pay, 460000);
  assert.equal(result.totalPackage, 488350);
  assert.equal(result.personalDonations, 360000);
  assert.equal(result.totalGiving, 383350);
});

test("every supported working week scales pay before premiums", () => {
  for (const [days, expected] of [[2, 230000], [3, 345000], [4, 460000], [5, 575000]]) {
    assert.equal(calculateOffer({ ...defaults, days }).pay, expected);
  }
});

test("in-office loading is additive, not compounded", () => {
  const result = calculateOffer({ ...defaults, days: 5, premium: 30, inOffice: true });
  assert.equal(result.pay, 700000);
  assert.equal(result.officeLoading, 50000);
});

test("the full match is used while pay falls then rises around the 1:1 point", () => {
  for (const match of [0, 23300, 23350, 23400, 100000, 191674, 191675, 191676, 200700, 300000]) {
    const result = calculateOffer({ ...defaults, match });
    assert.equal(result.actualMatch, match);
    assert.equal(result.actualMatch, Math.min(result.personalDonations, match));
    assert.equal(result.pay, Math.max(483350 - match, CURRENT.pay - CURRENT.donations + match));
    assert.equal(result.personalDonations + result.actualMatch, Math.max(383350, 2 * match));
    assert.equal(result.extraGivingFunding, Math.max(0, 2 * match - 383350));
    assert.equal(result.totalPackage, 488350 + result.extraGivingFunding);
  }
  assert.equal(calculateOffer({ ...defaults, match: 300000 }).personalDonations, 300000);
});

test("screenshot scenario uses only matching eligible for personal donations", () => {
  const result = calculateOffer({ ...defaults, match: 200700, inOffice: true });
  assert.equal(result.actualMatch, 200700);
  assert.equal(result.personalDonations, 222650);
  assert.equal(result.matchAdjustment, -177350);
  assert.equal(result.pay, 322650);
  assert.equal(result.totalPackage, 528350);
  assert.equal(result.extraGivingFunding, 0);
  assert.equal(result.totalGiving, 423350);
});

test("salary reverses continuously at the exact 1:1 turning point", () => {
  const before = calculateOffer({ ...defaults, match: 191674 });
  const atPoint = calculateOffer({ ...defaults, match: 191675 });
  const after = calculateOffer({ ...defaults, match: 191676 });
  assert.equal(before.pay, 291676);
  assert.equal(atPoint.pay, 291675);
  assert.equal(after.pay, 291676);
  assert.equal(atPoint.extraGivingFunding, 0);
  assert.equal(after.extraGivingFunding, 2);
  assert.equal(after.personalDonations, 191676);
  assert.equal(after.totalGiving, 383352);
});

test("salary minimum matching amount identifies the exact turning point", () => {
  assert.equal(calculateOffer(defaults).salaryMinimumMatch, 191675);
  const settings = { ...defaults, days: 5, premium: 30, inOffice: true };
  assert.equal(calculateOffer(settings).salaryMinimumMatch, 311675);
});

test("benefits replace pay without changing the total package", () => {
  for (const benefits of [0, 5000, 30000]) {
    const result = calculateOffer({ ...defaults, benefits });
    assert.equal(result.pay, 465000 - benefits);
    assert.equal(result.totalPackage, 488350);
  }
});

test("combined extremes retain donation and package invariants", () => {
  const result = calculateOffer({ days: 2, premium: 15, inOffice: false, match: 300000, benefits: 30000 });
  assert.equal(result.pay, 400000);
  assert.equal(result.totalPackage, 730000);
  assert.equal(result.personalDonations + result.actualMatch, result.totalGiving);
  assert.equal(result.actualMatch, result.personalDonations);
});

test("giving follows pay changes while retained pay remains unchanged across every control", () => {
  for (const days of [2, 3, 4, 5]) {
    for (const premium of [15, 30]) {
      for (const inOffice of [false, true]) {
        for (const benefits of [0, 5000, 30000]) {
          const settings = { days, premium, inOffice, benefits };
          const baseline = calculateOffer({ ...settings, match: CURRENT.match });
          const minimumMatch = Math.min(300000, baseline.salaryMinimumMatch);
          const minimumPay = calculateOffer({ ...settings, match: minimumMatch }).pay;
          assert.equal(minimumMatch % 25, 0);
          for (const match of [minimumMatch - 25, minimumMatch + 25].filter(value => value >= 0 && value <= 300000)) {
            assert.ok(calculateOffer({ ...settings, match }).pay > minimumPay);
          }
          for (const match of [0, 23350, 100000, 191650, 191700, 300000]) {
            const result = calculateOffer({ ...settings, match });
            assert.equal(result.pay - result.personalDonations, CURRENT.pay - CURRENT.donations);
            assert.equal(result.actualMatch, match);
            assert.ok(result.personalDonations >= match);
            assert.equal(result.personalDonations + result.actualMatch, result.totalGiving);
            assert.equal(result.totalGiving, Math.max(baseline.totalGiving, 2 * match));
            assert.equal(result.totalPackage, baseline.totalPackage + result.extraGivingFunding);
            assert.equal(result.pay, Math.max(baseline.pay + CURRENT.match - match, CURRENT.pay - CURRENT.donations + match));
            assert.equal(
              result.proratedPay + result.switchingPremium + result.officeLoading +
                result.benefitsAdjustment + result.matchAdjustment + result.extraGivingFunding,
              result.pay,
            );
          }
        }
      }
    }
  }
});
