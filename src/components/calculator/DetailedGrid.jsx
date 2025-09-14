
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DetailedGrid({ year, formData, updateFormData }) {
  const ageBandLabels = {
    U2: '0-2 years',
    '2to3': '2-3 years',
    '3to4': '3-4 years'
  };

  // Ensure consistent order: 0-2, 2-3, 3-4
  const orderedBands = ['U2', '2to3', '3to4'].filter((band) => (formData.ageBands || []).includes(band));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const sessions = ['FD', 'AM', 'PM'];

  const gridKey = `grid${year}`;
  const currentGrid = formData[gridKey] || {};
  const sessionHours = formData.sessionHours || { FD: 10, AM: 5, PM: 5 };

  // ---- Helpers ----

  // Weekly cap (hours) per band based on Term Settings (claimantCounts2526 + modeByBand)
  const getWeeklyCap = (band) => {
    if (year !== '2526' || !formData.enforceCaps) return null;
    const counts = formData.claimantCounts2526?.[band];
    if (!counts) return 0;

    const mode = formData.modeByBand?.[band] || 'STRETCHED';
    let cap = 0;

    // Stretched component (weekly equivalence)
    if (mode === 'STRETCHED' || mode === 'MIXED') {
      cap += (Number(counts.fifteen_stretched) || 0) * 11.176470588235293;

      const totalThirtyStretched = Number(counts.thirty_stretched) || 0;
      // Removed the 'band === 3to4' condition to extend the 2-day cap to all bands
      const twoDayThirtyStretched = Number(counts.thirty_stretched_twoday) || 0;
      const regularThirtyStretched = Math.max(0, totalThirtyStretched - twoDayThirtyStretched);

      cap += regularThirtyStretched * 22.352941176470587; // Standard 30h stretched cap
      cap += twoDayThirtyStretched * 20; // Special 2-day 30h stretched cap
    }
    // Term-time component (term weeks only)
    if (mode === 'TERMTIME' || mode === 'MIXED') {
      cap += (Number(counts.fifteen_term) || 0) * 15;
      cap += (Number(counts.thirty_term) || 0) * 30;
    }
    return cap;
  };

  // Sum of currently allocated funded hours across the band (this grid/year)
  const getAllocatedHours = (band) => {
    let total = 0;
    const gridData = formData[gridKey] || {};
    days.forEach((day) => {
      sessions.forEach((s) => {
        const fundedUnits = Number(gridData[band]?.[day]?.[s]?.funded) || 0;
        const h = Number(sessionHours[s]) || 0;
        total += fundedUnits * h;
      });
    });
    return total;
  };

  const isOverCap = (band) => {
    if (year !== '2526' || !formData.enforceCaps) return false;
    const cap = Number(getWeeklyCap(band)) || 0;
    const allocated = Number(getAllocatedHours(band)) || 0;
    return cap > 0 && allocated > cap + 1e-9;
  };

  const getPaid = (band, day, session) => {
    const cell = currentGrid[band]?.[day]?.[session];
    if (!cell) return 0;
    const total = Number(cell.total) || 0;
    const funded = Math.min(Number(cell.funded) || 0, total);
    return Math.max(0, total - funded);
  };

  // ---- Core updater with clamps (funded ≤ total, and cap on 25/26) ----
  const updateCell = (band, day, session, field, value) => {
    // Treat empty string input as 0 for parsing
    const raw = Math.max(0, parseInt(value, 10) || 0);
    const gridData = JSON.parse(JSON.stringify(formData[gridKey] || {}));

    if (!gridData[band]) gridData[band] = {};
    if (!gridData[band][day]) gridData[band][day] = {};
    if (!gridData[band][day][session]) gridData[band][day][session] = { total: 0, funded: 0 };

    const prevCell = gridData[band][day][session];
    const prevTotal = Number(prevCell.total) || 0;
    const prevFunded = Number(prevCell.funded) || 0;

    if (field === 'total') {
      const newTotal = raw;
      const clampedFunded = Math.min(prevFunded, newTotal);
      gridData[band][day][session].total = newTotal;
      gridData[band][day][session].funded = clampedFunded;
      updateFormData({ [gridKey]: gridData });
      return;
    }

    let newFunded = raw;
    newFunded = Math.min(newFunded, prevTotal);

    if (year === '2526' && formData.enforceCaps) {
      const capHours = Number(getWeeklyCap(band)) || 0;
      if (capHours > 0) {// Only apply cap logic if a cap is actually set.
        const h = Number(sessionHours[session]) || 0;
        if (h > 0) {
          const allocatedBefore = Number(getAllocatedHours(band)) || 0;
          const exclThisCellHours = allocatedBefore - prevFunded * h;
          const remainingHours = capHours - exclThisCellHours;
          const maxUnitsThisCell = Math.floor(remainingHours / h);
          newFunded = Math.min(newFunded, Math.max(0, maxUnitsThisCell));
        }
      }
    }

    gridData[band][day][session].funded = newFunded;
    updateFormData({ [gridKey]: gridData });
  };

  return (
    <div className="space-y-8">
      {orderedBands.map((band) => {
        const cap = Number(getWeeklyCap(band)) || 0;
        const allocated = Number(getAllocatedHours(band)) || 0;

        return (
          <Card key={band} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden ${isOverCap(band) ? 'border-2 border-red-300 bg-red-50' : ''}`}>
            <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-gray-800 text-xl">
                <span>{ageBandLabels[band] || band}</span>
                {year === '2526' && formData.enforceCaps && cap > 0 &&
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <span>Allocated: <span className="font-bold">{allocated.toFixed(1)}h</span></span>
                    <span className="text-gray-400">/</span>
                    <span>Cap: <span className="font-bold">{cap.toFixed(1)}h</span></span>
                    {isOverCap(band) &&
                  <Badge variant="destructive" className="ml-2 animate-pulse">Over Cap</Badge>
                  }
                  </div>
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th rowSpan="2" className="text-left py-3 px-2 font-semibold text-gray-800 align-bottom w-44">Day/Session</th>
                      {sessions.map((session) =>
                      <th
                        key={session}
                        colSpan="3"
                        className="text-center py-2 px-2 border-l font-bold">

                          {session}
                        </th>
                      )}
                    </tr>
                    <tr className="border-b">
                      {sessions.map((session) =>
                      <React.Fragment key={`${session}-labels`}>
                          <th className="text-center py-2 px-2 border-l text-xs text-gray-500 font-medium w-16">Total</th>
                          <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-16">Funded</th>
                          <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-24">Non-funded</th>
                        </React.Fragment>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => {
                      return (
                        <tr key={day} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-3 px-2 font-semibold text-gray-800 w-44">{day}</td>
                          {sessions.map((session) => {
                            // Values for display should show empty string if 0, otherwise the actual value
                            const totalVal = Number(currentGrid[band]?.[day]?.[session]?.total) || 0;
                            const fundedVal = Math.min(
                              Number(currentGrid[band]?.[day]?.[session]?.funded) || 0,
                              totalVal
                            );
                            const paidVal = Math.max(0, totalVal - fundedVal);

                            // Display empty string if value is 0, otherwise show the actual value
                            const displayTotal = totalVal === 0 ? '' : totalVal.toString();
                            const displayFunded = fundedVal === 0 ? '' : fundedVal.toString();

                            return (
                              <React.Fragment key={session}>
                                <td className="p-2 border-l">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={displayTotal}
                                    placeholder="0"
                                    onChange={(e) =>
                                    updateCell(band, day, session, 'total', e.target.value || '0')
                                    }
                                    className="w-16 h-10 text-center rounded-lg shadow-sm border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                                    disabled={year === '2526'} // Lock total places on projection screen
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={totalVal}
                                    value={displayFunded}
                                    placeholder="0"
                                    onChange={(e) =>
                                    updateCell(band, day, session, 'funded', e.target.value || '0')
                                    }
                                    className="w-16 h-10 text-center rounded-lg shadow-sm border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors" />

                                </td>
                                <td className="p-2 text-center font-bold text-gray-700 w-24">
                                  {paidVal > 0 ? paidVal : <span className="text-gray-400 font-normal">0</span>}
                                </td>
                              </React.Fragment>);

                          })}
                        </tr>);

                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>);

      })}
    </div>);

}
