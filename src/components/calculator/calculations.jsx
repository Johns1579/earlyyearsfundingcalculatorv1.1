
// src/components/calculator/calculations.jsx
// @ts-nocheck

/**
 * Public API:
 *   export function calculateResults(formData)
 *
 * Returns:
 * {
 *   revenue2425: number,   // annual 24/25 (actual or scaled)
 *   revenue2526: number,   // annual 25/26 (projected)
 *   deltaAnnual: number,   // annual difference
 *   deltaWeekly: number,   // deltaAnnual / weeks
 *   byBand: {
 *     [band]: {
 *       // weekly breakdowns (for charts/tables)
 *       revenue2425: { funded: number, paid: number, hours: { funded: number, paid: 0 } },
 *       revenue2526: { funded: number, paid: number, hours: { funded: number, paid: 0 } }
 *     }
 *   }
 * }
 *
 * Notes:
 * - Weekly maths is session-based (FD/AM/PM).
 * - Extras apply ONLY to funded sessions.
 * - LA rate uses laRates[band].total_rate, with a safe fallback to base+supplement.
 * - Annualisation is snapshot-and-scale if 24/25 actual is provided; else weekly×weeks.
 * - Weeks are clamped to 38..52.
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SESSIONS = ['FD', 'AM', 'PM'];

const nz = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

/** Per-band, per-year weekly revenue (and funded hours). */
function calculateWeeklyRevenue(formData, band, year /* '2425' | '2526' */) {
  const gridKey = `grid${year}`;
  const grid = formData[gridKey] || {};
  const bandGrid = grid[band] || {};

  const sessionHours = formData.sessionHours || { FD: 10, AM: 5, PM: 5 };
  const privateFees = formData.privateFees || { FD: 0, AM: 0, PM: 0 };

  let fundedHours = 0;
  let paidRevenue = 0;
  let fundedHalfDayUnits = 0;
  let fundedFullDayUnits = 0;

  for (const day of DAYS) {
    const row = bandGrid[day] || {};
    for (const s of SESSIONS) {
      const cell = row[s];
      if (!cell) continue;

      const totalUnits = Math.max(0, nz(cell.total, 0));
      const fundedUnits = Math.min(Math.max(0, nz(cell.funded, 0)), totalUnits);

      const h = nz(sessionHours[s], 0);
      const fee = nz(privateFees[s], 0);

      fundedHours += fundedUnits * h;
      const paidUnits = Math.max(0, totalUnits - fundedUnits);
      paidRevenue += paidUnits * fee;

      if (s === 'FD') fundedFullDayUnits += fundedUnits;
      if (s === 'AM' || s === 'PM') fundedHalfDayUnits += fundedUnits;
    }
  }

  // CRITICAL FIX: Use the 'year' parameter to dynamically select the correct extras object.
  const extrasKey = `extras${year}`;
  const halfExtra = nz(formData[extrasKey]?.perFundedHalfDay, 0);
  const fullExtra = nz(formData[extrasKey]?.perFundedFullDay, 0);
  const extrasRevenue = fundedHalfDayUnits * halfExtra + fundedFullDayUnits * fullExtra;

  // CRITICAL FIX: Use the 'year' parameter to dynamically select the correct LA rates object.
  const laRatesKey = `laRates${year}`;
  const laRate = nz(formData[laRatesKey]?.[band]?.total_rate, 0);

  const fundedRevenue = fundedHours * laRate + extrasRevenue;

  return {
    funded: fundedRevenue,
    paid: paidRevenue,
    hours: {
      funded: fundedHours,
      paid: 0
    }
  };
}

/** Aggregates weekly → annual, applying snapshot-and-scale if available. */
export function calculateResults(formData) {
  const results = {
    revenue2425: 0,
    revenue2526: 0,
    deltaAnnual: 0,
    deltaWeekly: 0,
    byBand: {}
  };

  const bands = Array.isArray(formData.ageBands) ? formData.ageBands : [];

  // 1) Weekly by-band
  for (const band of bands) {
    const w24 = calculateWeeklyRevenue(formData, band, '2425');
    const w25 = calculateWeeklyRevenue(formData, band, '2526');
    results.byBand[band] = { revenue2425: w24, revenue2526: w25 };
  }

  // 2) Weekly totals
  let weekly24 = 0;
  let weekly25 = 0;
  for (const band of bands) {
    const b = results.byBand[band] || {};
    weekly24 += nz(b.revenue2425?.funded, 0) + nz(b.revenue2425?.paid, 0);
    weekly25 += nz(b.revenue2526?.funded, 0) + nz(b.revenue2526?.paid, 0);
  }

  // 3) Annualisation (clamp weeks and snapshot-scale if we can)
  const weeks = Math.min(52, Math.max(38, nz(formData.openWeeks, 51)));

  if (
    (formData.annualisationMethod === 'snapshot' || formData.annualisationMethod === 'estimated') &&
    nz(formData.annual2425Actual, 0) > 0 &&
    weekly24 > 0
  ) {
    // Snapshot-and-scale method (works for both actual and estimated revenue)
    const k = nz(formData.annual2425Actual, 0) / (weekly24 * weeks);
    results.revenue2425 = nz(formData.annual2425Actual, 0);
    results.revenue2526 = k * weekly25 * weeks;
  } else {
    // Fallback: simple multiplication
    results.revenue2425 = weekly24 * weeks;
    results.revenue2526 = weekly25 * weeks;
  }

  // 4) Deltas
  results.deltaAnnual = results.revenue2526 - results.revenue2425;
  results.deltaWeekly = weeks > 0 ? results.deltaAnnual / weeks : 0;

  return results;
}
