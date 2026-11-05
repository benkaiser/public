export const CURRENT = Object.freeze({
  pay: 400000,
  match: 23350,
  benefits: 5000,
  donations: 300000,
  days: 4,
});

export function calculateOffer({ days, premium, inOffice, match, benefits }) {
  const proratedPay = CURRENT.pay * days / CURRENT.days;
  const switchingPremium = proratedPay * premium / 100;
  const officeLoading = inOffice ? proratedPay * 0.1 : 0;
  const benefitsAdjustment = CURRENT.benefits - benefits;
  const payBeforeMatching = proratedPay + switchingPremium + officeLoading + benefitsAdjustment;
  const givingTarget = CURRENT.donations + (payBeforeMatching - CURRENT.pay) + CURRENT.match;
  // Fully use the match, adding personal giving once the original target is met.
  const extraGivingFunding = Math.max(0, 2 * match - givingTarget);
  const personalDonations = givingTarget - match + extraGivingFunding;
  const matchAdjustment = CURRENT.match - match;
  const pay = payBeforeMatching + matchAdjustment + extraGivingFunding;

  return {
    proratedPay,
    switchingPremium,
    officeLoading,
    benefitsAdjustment,
    matchAdjustment,
    extraGivingFunding,
    pay,
    totalPackage: pay + benefits + match,
    actualMatch: match,
    personalDonations,
    totalGiving: personalDonations + match,
    salaryMinimumMatch: givingTarget / 2,
  };
}
