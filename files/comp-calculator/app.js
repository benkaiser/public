import { calculateOffer } from "./calculator.js";

const form = document.querySelector("#offer-form");
const storageKey = "comp-calculator.settings";
const storageStatus = document.getElementById("storage-status");
const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const money = (value) => currency.format(value);
const signedMoney = (value) => `${value < 0 ? "-" : "+"}${money(Math.abs(value))}`;

function getSettings() {
  const values = new FormData(form);
  return {
    days: Number(values.get("days")),
    premium: Number(values.get("premium")),
    match: Number(values.get("match")),
    benefits: Number(values.get("benefits")),
    inOffice: values.has("inOffice"),
  };
}

function showStorageError(message) {
  storageStatus.textContent = message;
  storageStatus.hidden = false;
}

function restoreSettings() {
  let saved;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) return;
    saved = JSON.parse(stored);
  } catch {
    showStorageError("Saved settings could not be loaded. Using defaults.");
    return;
  }

  const sliders = [...form.querySelectorAll('input[type="range"]')];
  const days = [...form.querySelectorAll('input[name="days"]')];
  const valid = saved !== null && typeof saved === "object" &&
    typeof saved.inOffice === "boolean" &&
    days.some(input => Number(input.value) === saved.days) &&
    sliders.every(input => {
      const value = saved[input.name];
      return Number.isFinite(value) && value >= Number(input.min) &&
        value <= Number(input.max) && (value - Number(input.min)) % Number(input.step) === 0;
    });
  if (!valid) {
    showStorageError("Saved settings were invalid. Using defaults.");
    return;
  }

  for (const input of sliders) input.value = saved[input.name];
  for (const input of days) input.checked = Number(input.value) === saved.days;
  document.getElementById("inOffice").checked = saved.inOffice;
}

function saveSettings() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(getSettings()));
    storageStatus.hidden = true;
  } catch {
    showStorageError("Settings could not be saved in this browser.");
  }
}

function render() {
  const { days, premium, match, benefits, inOffice } = getSettings();
  const result = calculateOffer({ days, premium, match, benefits, inOffice });
  const text = {
    "premium-value": `${premium}%`,
    "match-value": money(match),
    "benefits-value": money(benefits),
    "offer-pay": money(result.pay),
    "offer-context": `${days} days / week · ${inOffice ? "Strict in-office" : "Remote or hybrid"}`,
    "prorated-label": `Current pay × ${days}/4 days`,
    "prorated-pay": money(result.proratedPay),
    "premium-label": `Switching premium (${premium}%)`,
    "premium-pay": signedMoney(result.switchingPremium),
    "office-pay": signedMoney(result.officeLoading),
    "benefits-adjustment": signedMoney(result.benefitsAdjustment),
    "match-adjustment": signedMoney(result.matchAdjustment),
    "giving-funding": signedMoney(result.extraGivingFunding),
    "package-total": money(result.totalPackage),
    "package-benefits": money(benefits),
    "package-match": money(result.actualMatch),
    "actual-match": money(result.actualMatch),
    "personal-donations": money(result.personalDonations),
    "giving-total": money(result.totalGiving),
  };
  for (const [id, value] of Object.entries(text)) {
    document.getElementById(id).textContent = value;
  }
  document.getElementById("extra-giving-note").hidden = result.extraGivingFunding === 0;
  for (const slider of form.querySelectorAll('input[type="range"]')) {
    slider.style.setProperty("--progress", `${(slider.value - slider.min) / (slider.max - slider.min) * 100}%`);
    slider.setAttribute("aria-valuetext", slider.name === "premium" ? `${slider.value}%` : money(Number(slider.value)));
  }
}

function update() {
  render();
  saveSettings();
}

document.getElementById("salary-minimum").addEventListener("click", () => {
  const { salaryMinimumMatch } = calculateOffer(getSettings());
  const slider = document.getElementById("match");
  slider.value = Math.min(Number(slider.max), Math.max(Number(slider.min), salaryMinimumMatch));
  update();
});
form.addEventListener("input", update);
form.addEventListener("reset", () => requestAnimationFrame(update));
restoreSettings();
render();
