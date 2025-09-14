
// src/components/calculator/WeeklyProjected2526Screen.jsx
// @ts-nocheck
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, Eraser } from "lucide-react";
import DetailedGrid from "./DetailedGrid";

export default function WeeklyProjected2526Screen({ formData, updateFormData }) {
  const hasBaseline = useMemo(() => Object.keys(formData.grid2425 || {}).length > 0, [formData.grid2425]);

  const hasAnyCounts = useMemo(() => {
    const bands = formData.ageBands || [];
    return bands.some((b) => !!formData.claimantCounts2526?.[b]);
  }, [formData.claimantCounts2526, formData.ageBands]);

  const copyFromBaseline = () => {
    if (!hasBaseline) return;
    const copied = JSON.parse(JSON.stringify(formData.grid2425 || {}));
    updateFormData({
      grid2526: copied,
      _copied2425to2526: true
    });
  };

  const clearFundedOnly = () => {
    if (!formData.grid2526) return;
    const next = JSON.parse(JSON.stringify(formData.grid2526));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const sessions = ['FD', 'AM', 'PM'];
    (formData.ageBands || []).forEach((band) => {
      if (!next[band]) return;
      days.forEach((day) => {
        if (!next[band][day]) return;
        sessions.forEach((s) => {
          if (!next[band][day][s]) return;
          const cell = next[band][day][s];
          const total = Number(cell.total) || 0;
          cell.funded = Math.min(Number(cell.funded) || 0, total); // ensure valid
          // now zero funded
          cell.funded = 0;
        });
      });
    });

    updateFormData({ grid2526: next });
  };

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Weekly Projection — 25/26</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            We’ve locked the <strong>total places</strong> to match your 24/25 baseline. Adjust the <strong>funded</strong> column per session to reflect 25/26 entitlements and parent choices. If you completed <em>Term Settings</em>, funded hours are hard-capped per age band.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={copyFromBaseline}
              disabled={!hasBaseline}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white"
              title={hasBaseline ? "Copy your 24/25 week into 25/26" : "Enter 24/25 first"}>

              <Copy className="w-4 h-4" />
              Copy 24/25 → 25/26
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={clearFundedOnly}
              className="flex items-center gap-2"
              title="Set all funded cells to 0 (keeps totals as-is)">

              <Eraser className="w-4 h-4" />
              Clear funded (keep totals)
            </Button>
          </div>

          {!hasAnyCounts &&
          <div className="mt-2 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">Heads-up: To automatically check your funded hours against official limits, please fill in your claimed funded hours totals on the 'Funded Hours' screen (Step 3). If you skip this, you'll need to manually ensure the funded hours you enter here are accurate and within your LA's entitlements.


            </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* The editable grid for 25/26 (funded only; totals read-only inside the component) */}
      <DetailedGrid
        year="2526"
        formData={formData}
        updateFormData={updateFormData} />

    </div>);

}