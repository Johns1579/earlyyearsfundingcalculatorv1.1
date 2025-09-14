
import React, { useEffect, useMemo, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// The Button import is no longer needed if the button is removed
// import { Button } from "@/components/ui/button";

const ageBandLabels = { U2: '0-2 years', '2to3': '2-3 years', '3to4': '3-4 years' };
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const sessions = ['FD', 'AM', 'PM'];

const initSimplified = () => ({
  totalFullDaySessions: 0,
  totalMorningSessions: 0,
  totalAfternoonSessions: 0,
  fundedFDSessions: 0,
  fundedAMSessions: 0,
  fundedPMSessions: 0
});

// --- helpers for caps display (3–4s only) ---
const weeklyCapFromCounts = (mode, counts) => {
  if (!counts) return 0;
  const m = mode || 'STRETCHED';
  const c = counts || {};
  const st15 = (Number(c.fifteen_stretched) || 0) * 11.176470588235293;
  const st30 = Math.max(0, (Number(c.thirty_stretched) || 0) - (Number(c.thirty_stretched_twoday) || 0)) * 22.352941176470587;
  const st30_2d = (Number(c.thirty_stretched_twoday) || 0) * 20;
  const tt15 = (Number(c.fifteen_term) || 0) * 15;
  const tt30 = (Number(c.thirty_term) || 0) * 30;

  let out = 0;
  if (m === 'STRETCHED' || m === 'MIXED') out += st15 + st30 + st30_2d;
  if (m === 'TERMTIME' || m === 'MIXED') out += tt15 + tt30;
  return out;
};

export default function SimplifiedInput({ formData, updateFormData }) {
  // Memoize ageBands to prevent re-renders
  const ageBands = useMemo(() => formData.ageBands || [], [formData.ageBands]);

  // Ensure consistent order: 0-2, 2-3, 3-4
  const orderedBands = ['U2', '2to3', '3to4'].filter((band) => (formData.ageBands || []).includes(band));

  // Ensure we have simplifiedData entries for selected bands
  useEffect(() => {
    let changed = false;
    const next = { ...(formData.simplifiedData || {}) };
    ageBands.forEach((b) => {if (!next[b]) {next[b] = initSimplified();changed = true;}});
    Object.keys(next).forEach((b) => {if (!ageBands.includes(b)) {delete next[b];changed = true;}});
    if (changed) updateFormData({ simplifiedData: next });
  }, [ageBands, formData.simplifiedData, updateFormData]);

  const updateSimplifiedData = (band, key, value) => {
    const parsedValue = parseInt(value, 10) || 0;
    const next = { ...(formData.simplifiedData?.[band] || initSimplified()) };
    next[key] = parsedValue;

    // When a total count changes, ensure the funded count is not higher
    if (key === 'totalFullDaySessions') {
      next.fundedFDSessions = Math.min(next.fundedFDSessions || 0, parsedValue);
    }
    if (key === 'totalMorningSessions') {
      next.fundedAMSessions = Math.min(next.fundedAMSessions || 0, parsedValue);
    }
    if (key === 'totalAfternoonSessions') {
      next.fundedPMSessions = Math.min(next.fundedPMSessions || 0, parsedValue);
    }

    // When a funded count changes, ensure it's not higher than the total
    if (key === 'fundedFDSessions') {
      next.fundedFDSessions = Math.min(parsedValue, next.totalFullDaySessions || 0);
    }
    if (key === 'fundedAMSessions') {
      next.fundedAMSessions = Math.min(parsedValue, next.totalMorningSessions || 0);
    }
    if (key === 'fundedPMSessions') {
      next.fundedPMSessions = Math.min(parsedValue, next.totalAfternoonSessions || 0);
    }

    updateFormData({
      simplifiedData: {
        ...(formData.simplifiedData || {}),
        [band]: next
      }
    });
  };

  // Export the generateGrids function to be used by parent component
  useImperativeHandle(formData.simplifiedInputRef, () => ({
    generateGrids: () => {
      const grid2425 = {};
      const grid2526 = {};

      ageBands.forEach((band) => {
        const sdata = formData.simplifiedData?.[band] || initSimplified();

        const totalFD = Math.max(0, parseInt(sdata.totalFullDaySessions, 10) || 0);
        const totalAM = Math.max(0, parseInt(sdata.totalMorningSessions, 10) || 0);
        const totalPM = Math.max(0, parseInt(sdata.totalAfternoonSessions, 10) || 0);

        const fundedWeeklyFD = Math.max(0, parseInt(sdata.fundedFDSessions, 10) || 0);
        const fundedWeeklyAM = Math.max(0, parseInt(sdata.fundedAMSessions, 10) || 0);
        const fundedWeeklyPM = Math.max(0, parseInt(sdata.fundedPMSessions, 10) || 0);

        grid2425[band] = {};
        grid2526[band] = {};

        days.forEach((day) => {
          grid2425[band][day] = {};
          grid2526[band][day] = {};

          // Divide weekly totals by 5 to get daily averages
          const dailyFD = Math.round(totalFD / 5);
          const dailyAM = Math.round(totalAM / 5);
          const dailyPM = Math.round(totalPM / 5);

          // Divide weekly funded totals by 5
          const dailyFundedFD = Math.round(fundedWeeklyFD / 5);
          const dailyFundedAM = Math.round(fundedWeeklyAM / 5);
          const dailyFundedPM = Math.round(fundedWeeklyPM / 5);

          // Ensure daily funded does not exceed daily total
          const fundedFD = Math.min(dailyFD, dailyFundedFD);
          const fundedAM = Math.min(dailyAM, dailyFundedAM);
          const fundedPM = Math.min(dailyPM, dailyFundedPM);

          grid2425[band][day]['FD'] = { total: dailyFD, funded: fundedFD };
          grid2425[band][day]['AM'] = { total: dailyAM, funded: fundedAM };
          grid2425[band][day]['PM'] = { total: dailyPM, funded: fundedPM };

          // Seed 25/26 equal to 24/25; users adjust funded in the next step
          grid2526[band][day]['FD'] = { total: dailyFD, funded: fundedFD };
          grid2526[band][day]['AM'] = { total: dailyAM, funded: fundedAM };
          grid2526[band][day]['PM'] = { total: dailyPM, funded: fundedPM };
        });
      });

      updateFormData({ grid2425, grid2526, _copied2425to2526: true, inputMode: 'detailed' });
    }
  }), [ageBands, formData.simplifiedData, updateFormData]);

  return (
    <div className="space-y-6">
      {orderedBands.map((band) => {
        const data = formData.simplifiedData?.[band] || initSimplified();
        const totalFD = data.totalFullDaySessions || 0;
        const totalAM = data.totalMorningSessions || 0;
        const totalPM = data.totalAfternoonSessions || 0;

        return (
          <Card key={band} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
              <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
                {ageBandLabels[band] || band}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Attendance (24/25 Baseline)</h3>
              
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Total Sessions (per week)</Label>
                  <div>
                    <Label>Total Full Day Sessions</Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.totalFullDaySessions || ''}
                      placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'totalFullDaySessions', e.target.value)}
                      className="mt-1" />

                  </div>
                  
                  <div>
                    <Label>Total Morning Sessions</Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.totalMorningSessions || ''}
                      placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'totalMorningSessions', e.target.value)}
                      className="mt-1" />

                  </div>
                  
                  <div>
                    <Label>Total Afternoon Sessions</Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.totalAfternoonSessions || ''}
                      placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'totalAfternoonSessions', e.target.value)}
                      className="mt-1" />

                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-base font-medium">24/25 Funded Sessions (per week)</Label>
                   <div>
                    <Label>Funded Full Day Sessions</Label>
                    <Input
                      type="number" min="0" max={totalFD}
                      value={data.fundedFDSessions || ''} placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'fundedFDSessions', e.target.value)}
                      className="mt-1" />

                   </div>
                   <div>
                    <Label>Funded Morning Sessions</Label>
                    <Input
                      type="number" min="0" max={totalAM}
                      value={data.fundedAMSessions || ''} placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'fundedAMSessions', e.target.value)}
                      className="mt-1" />

                   </div>
                   <div>
                    <Label>Funded Afternoon Sessions</Label>
                    <Input
                      type="number" min="0" max={totalPM}
                      value={data.fundedPMSessions || ''} placeholder="0"
                      onChange={(e) => updateSimplifiedData(band, 'fundedPMSessions', e.target.value)}
                      className="mt-1" />

                   </div>
                </div>
              </div>
            </CardContent>
          </Card>);

      })}

      {/* New explanatory paragraph */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm text-blue-800">
        <p className="font-semibold mb-2">What happens next?</p>
        <p className="text-sm">
          When you click "Next", the simplified information you've entered above will be automatically converted into a detailed 5-day weekly grid.
          You'll then use this detailed grid on the next page to apply the new 25/26 funding hours and sessions for your nursery.
        </p>
      </div>
    </div>);

}
