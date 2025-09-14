
// src/components/calculator/ResultsScreen.jsx
// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Download, FileText, BarChart3, Percent, AlertCircle } from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Switch } from "@/components/ui/switch"; // Import Switch component

import { calculateResults } from '../calculator/calculations';
// Removed: import { InvokeLLM } from "@/api/integrations";

// ---------- helpers ----------
const fmtGBP = (n) => `£${Math.round(Number(n || 0)).toLocaleString()}`;
const fmtPct1 = (n) => `${Number(n || 0).toFixed(1)}%`;
const bandLabel = (b) => b === 'U2' ? '0-2 years' : b === '2to3' ? '2-3 years' : '3-4 years';

export default function ResultsScreen({ formData }) {
  const results = useMemo(() => calculateResults(formData), [formData]);
  const [showPercent, setShowPercent] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const isPositive = (results?.deltaAnnual || 0) >= 0;
  const headlinePct = (results?.revenue2425 || 0) > 0 ?
    (results.deltaAnnual || 0) / results.revenue2425 * 100 :
    0;

  const bands = useMemo(() => formData.ageBands || [], [formData.ageBands]);

  // Define ageBandLabels for use in reportData (kept for consistency but not strictly used in new PDF code)
  // const ageBandLabels = { U2: '0-2 years', '2to3': '2-3 years', '3to4': '3-4 years' };

  // Caps badge - update logic for new enforceCaps toggle
  const capsEnforced = formData.enforceCaps;
  // This variable (hasCountsData) is defined as per the outline, but not used in the provided badge logic.
  // It effectively holds the old 'capsProvided' logic, but the new display uses 'capsEnforced'.
  // const hasCountsData = bands.some(b => !!formData.claimantCounts2526?.[b]); // Removed as per outline not using it for display.

  // Aggregate weekly drivers across bands
  const drivers = useMemo(() => {
    let f24 = 0, f25 = 0, p24 = 0, p25 = 0, h24 = 0, h25 = 0;
    bands.forEach((b) => {
      const rb = results.byBand?.[b] || {};
      f24 += rb.revenue2425?.funded || 0;
      f25 += rb.revenue2526?.funded || 0;
      p24 += rb.revenue2425?.paid || 0;
      p25 += rb.revenue2526?.paid || 0;
      h24 += rb.revenue2425?.hours?.funded || 0;
      h25 += rb.revenue2526?.hours?.funded || 0;
    });
    const w24 = f24 + p24;
    const w25 = f25 + p25;
    return {
      funded24: f24, funded25: f25,
      paid24: p24, paid25: p25,
      hrs24: h24, hrs25: h25,
      weekly24: w24, weekly25: w25,
      weeklyDelta: w25 - w24
    };
  }, [bands, results.byBand]);

  const dFunded = drivers.funded25 - drivers.funded24;
  const dPaid = drivers.paid25 - drivers.paid24;
  const dHours = drivers.hrs25 - drivers.hrs24; // This was hrs25 - hrs24, fixed.

  const isWeeklyPositive = results?.deltaWeekly >= 0;

  // Break-even hint: % uplift on paid fees that would offset weeklyDelta
  const breakEvenPaidUpliftPct = drivers.paid24 > 0 ?
    Math.max(0, -drivers.weeklyDelta / drivers.paid24) * 100 :
    0;

  // Chart data (money or percent view)
  const chartData = useMemo(() => {
    return bands.map((band) => {
      const rb = results.byBand?.[band] || {};
      const f24 = rb.revenue2425?.funded || 0;
      const p24 = rb.revenue2425?.paid || 0;
      const f25 = rb.revenue2526?.funded || 0;
      const p25 = rb.revenue2526?.paid || 0;

      if (!showPercent) {
        return {
          band: band === 'U2' ? '0-2yr' : band === '2to3' ? '2-3yr' : '3-4yr',
          '24/25 Funded': f24,
          '24/25 Paid': p24,
          '25/26 Funded': f25,
          '25/26 Paid': p25
        };
      }

      const t24 = Math.max(1, f24 + p24);
      const t25 = Math.max(1, f25 + p25);
      return {
        band: band === 'U2' ? '0-2yr' : band === '2to3' ? '2-3yr' : '3-4yr',
        '24/25 Funded': f24 / t24 * 100,
        '24/25 Paid': p24 / t24 * 100,
        '25/26 Funded': f25 / t25 * 100,
        '25/26 Paid': p25 / t25 * 100
      };
    });
  }, [bands, results.byBand, showPercent]);

  const yTickFmt = (v) => showPercent ? `${v}%` : `£${Math.round(Number(v)).toLocaleString()}`;
  const tipFmt = (value) => showPercent ?
    [`${Number(value).toFixed(1)}%`, ''] :
    [`£${Math.round(Number(value)).toLocaleString()}`, ''];

  const methodBadge = formData.annualisationMethod === 'snapshot' ?
    'Snapshot & Scale' :
    'Term Multipliers';

  const generatePDFReport = () => {
    setIsGeneratingPDF(true);

    try {
      const reportData = {
        nurseryName: formData.nurseryName,
        calculationDate: new Date().toLocaleDateString('en-GB'),
        annualChange: results.deltaAnnual,
        percentageChange: headlinePct,
        baseline2425: results.revenue2425,
        projection2526: results.revenue2526,
        weeklyChange: results.deltaWeekly,
        openWeeks: formData.openWeeks,
        annualisationMethod: methodBadge,
        capsEnforced: formData.enforceCaps,
        bandBreakdown: bands.map((band) => {
          const rb = results.byBand?.[band] || {};
          const total2425 = (rb.revenue2425?.funded || 0) + (rb.revenue2425?.paid || 0);
          const total2526 = (rb.revenue2526?.funded || 0) + (rb.revenue2526?.paid || 0);
          const change = total2526 - total2425;
          const pctChange = total2425 > 0 ? (change / total2425) * 100 : 0;
          return {
            band: bandLabel(band),
            weekly2425: total2425,
            weekly2526: total2526,
            change: change,
            pctChange: pctChange,
          };
        }),
      };

      const htmlContent = `
        <html>
          <head>
            <title>Your 25/26 Revenue Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; color: #333; }
              h1, h2 { color: #FF8000; }
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; margin-top: 2.5rem; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { border: 1px solid #ddd; padding: 0.8rem; text-align: left; }
              th { background-color: #f9f9f9; }
              td { text-align: right; }
              td:first-child { text-align: left; }
              .summary-box { border: 1px solid #ddd; padding: 1.5rem; margin: 1.5rem 0; background: #fafafa; border-radius: 8px; }
              .positive { color: #16a34a; }
              .negative { color: #dc2626; }
              .font-bold { font-weight: 700; }
            </style>
          </head>
          <body>
            <h1>Your 25/26 Revenue Report for ${reportData.nurseryName}</h1>
            <p>Generated on: ${reportData.calculationDate}</p>

            <h2>Executive Summary</h2>
            <div class="summary-box">
              <p>Projected Annual Revenue Change: 
                <strong class="${reportData.annualChange >= 0 ? 'positive' : 'negative'}">
                  ${reportData.annualChange >= 0 ? '+' : ''}£${Math.round(reportData.annualChange).toLocaleString()} (${reportData.percentageChange.toFixed(1)}%)
                </strong>
              </p>
              <p>24/25 Baseline Annual Revenue: <strong class="font-bold">£${Math.round(reportData.baseline2425).toLocaleString()}</strong></p>
              <p>25/26 Projected Annual Revenue: <strong class="font-bold">£${Math.round(reportData.projection2526).toLocaleString()}</strong></p>
            </div>

            <h2>Weekly Revenue Breakdown by Age Band</h2>
            <table>
              <thead>
                <tr>
                  <th>Age Band</th>
                  <th>24/25 Weekly (£)</th>
                  <th>25/26 Weekly (£)</th>
                  <th>Change (£)</th>
                  <th>Change (%)</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.bandBreakdown.map(band => `
                  <tr>
                    <td>${band.band}</td>
                    <td>${Math.round(band.weekly2425).toLocaleString()}</td>
                    <td>${Math.round(band.weekly2526).toLocaleString()}</td>
                    <td class="${band.change >= 0 ? 'positive' : 'negative'}">${band.change >= 0 ? '+' : ''}${Math.round(band.change).toLocaleString()}</td>
                    <td class="${band.pctChange >= 0 ? 'positive' : 'negative'}">${band.pctChange >= 0 ? '+' : ''}${band.pctChange.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h2>Calculation Assumptions</h2>
            <ul>
              <li>Operating Weeks per Year: <strong>${reportData.openWeeks}</strong></li>
              <li>Annualisation Method: <strong>${reportData.annualisationMethod}</strong></li>
              <li>Funding Caps Enforced: <strong>${reportData.capsEnforced ? 'Yes' : 'No'}</strong></li>
            </ul>
          </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
        setTimeout(() => newWindow.print(), 1000);
      } else {
        alert('Could not open a new window. Please check your browser’s pop-up settings.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Sorry, there was an error generating the report.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="space-y-8">
      {/* Headline tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`col-span-1 md:col-span-3 lg:col-span-1 border-2 ${isPositive ? 'border-green-200' : 'border-red-200'} bg-gradient-to-br ${isPositive ? 'from-green-50/50' : 'from-red-50/50'} to-white`}>
          <CardHeader className="bg-[#ff8000] pb-3 p-6 flex flex-col space-y-1.5">
            <CardTitle className="text-xl text-gray-800 text-center">Annual Revenue Change</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-32 p-6">
            <div className="flex items-center justify-center gap-4">
              {isPositive ?
                <TrendingUp className="w-12 h-12 text-green-500" /> :
                <TrendingDown className="w-12 h-12 text-red-500" />
              }
              <div className="text-center">
                <div className={`py-3 font-extrabold text-4xl lg:text-6xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{fmtGBP(results.deltaAnnual)}
                </div>
                <div className={`text-lg font-semibold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                  {fmtPct1(headlinePct)} change vs 24/25 baseline
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="bg-[#ff8000] pb-3 p-6 flex flex-col space-y-1.5">
            <CardTitle className="text-xl text-gray-700 text-center">24/25 Baseline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-32 p-6 text-center">
            <div className="text-4xl lg:text-5xl font-bold text-gray-900">{fmtGBP(results.revenue2425)}</div>
            <div className="text-base text-gray-600 mt-2">Annual (actual or scaled)</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="bg-[#ff8000] pb-3 p-6 flex flex-col space-y-1.5">
            <CardTitle className="text-xl text-gray-700 text-center">25/26 Projection</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-32 p-6 text-center">
            <div className={`text-4xl lg:text-5xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{fmtGBP(results.revenue2526)}</div>
            <div className="text-base text-gray-600 mt-2">Annual (projected)</div>
          </CardContent>
        </Card>
      </div>

      {/* What changed (weekly drivers) */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">What Changed (per week)</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left">
            {isWeeklyPositive ?
              <TrendingUp className="w-16 h-16 text-green-500" /> :
              <TrendingDown className="w-16 h-16 text-red-500" />
            }
            <div>
              <div className="text-xl font-medium text-gray-600 mb-1">Total Weekly Revenue Change</div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900">
                {isWeeklyPositive ? '+' : ''}{fmtGBP(results.deltaWeekly)}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-sm text-gray-600 mb-1">Δ Funded Revenue</div>
              <div className={`text-xl font-bold ${dFunded >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dFunded >= 0 ? '+' : ''}{fmtGBP(dFunded)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-sm text-gray-600 mb-1">Δ Paid Revenue</div>
              <div className={`text-xl font-bold ${dPaid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dPaid >= 0 ? '+' : ''}{fmtGBP(dPaid)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-sm text-gray-600 mb-1">Δ Funded Hours</div>
              <div className={`text-xl font-bold ${dHours >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dHours >= 0 ? '+' : ''}{(Math.round(dHours * 10) / 10).toFixed(1)}h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Revenue Breakdown
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Value (£)</span>
            <Switch
              checked={showPercent}
              onCheckedChange={setShowPercent}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium text-gray-700">Percentage (%)</span>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" />
                <YAxis tickFormatter={yTickFmt} domain={showPercent ? [0, 100] : ['auto', 'auto']} />
                <Tooltip formatter={tipFmt} />
                <Legend />
                <Bar dataKey="24/25 Funded" stackId="2425" fill="#9CA3AF" name="24/25 Funded" />
                <Bar dataKey="24/25 Paid" stackId="2425" fill="#D1D5DB" name="24/25 Paid" />
                <Bar dataKey="25/26 Funded" stackId="2526" fill="#4B5563" name="25/26 Funded" />
                <Bar dataKey="25/26 Paid" stackId="2526" fill="#6B7280" name="25/26 Paid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">Detailed Weekly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold">Age Band</th>
                  <th className="text-right py-3 px-2 font-semibold">24/25 Weekly (£)</th>
                  <th className="text-right py-3 px-2 font-semibold">25/26 Weekly (£)</th>
                  <th className="text-right py-3 px-2 font-semibold">Change</th>
                  <th className="text-right py-3 px-2 font-semibold">% Change</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((band) => {
                  const rb = results.byBand?.[band] || {};
                  const total2425 = (rb.revenue2425?.funded || 0) + (rb.revenue2425?.paid || 0);
                  const total2526 = (rb.revenue2526?.funded || 0) + (rb.revenue2526?.paid || 0);
                  const change = total2526 - total2425;
                  const pctChange = total2425 > 0 ? change / total2425 * 100 : 0;

                  return (
                    <tr key={band} className="border-b border-gray-100">
                      <td className="py-3 px-2 font-medium">{bandLabel(band)}</td>
                      <td className="py-3 px-2 text-right">{fmtGBP(total2425)}</td>
                      <td className="py-3 px-2 text-right">{fmtGBP(total2526)}</td>
                      <td className={`py-3 px-2 text-right font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{fmtGBP(change)}
                      </td>
                      <td className={`py-3 px-2 text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmtPct1(pctChange)}
                      </td>
                    </tr>);

                })}
              </tbody>
            </table>
          </div>

          {/* Break-even hint */}
          {drivers.weeklyDelta < 0 &&
            <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 text-sm text-primary-dark flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                To offset the weekly shortfall of <strong className="font-bold">{fmtGBP(-drivers.weeklyDelta)}</strong>, you could consider increasing <strong className="font-bold">paid</strong> fees by approximately <strong className="font-bold">{fmtPct1(breakEvenPaidUpliftPct)}</strong>, or adjusting funded-session extras.
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Assumptions / context badges - MOVED TO BOTTOM */}
      <Card>
        <CardHeader className="bg-[#ff8000] pb-4 p-6 flex flex-col space-y-1.5">
          <CardTitle className="text-base font-semibold">Calculation Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="my-1 pt-0 p-6 flex flex-wrap gap-3">
          <Badge variant="outline" className="text-sm py-1 px-3 border-gray-300">Weeks/year: {formData.openWeeks}</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3 border-gray-300">Method: {methodBadge}</Badge>
          {capsEnforced ?
            <Badge variant="outline" className="text-sm py-1 px-3 border-green-300 bg-green-50 text-green-700">Funding Caps Enforced</Badge> :
            <Badge variant="destructive" className="text-sm py-1 px-3">Funding Caps NOT Enforced</Badge>
          }
        </CardContent>
      </Card>

      {/* Download PDF - moved to bottom */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <Button
          size="lg"
          onClick={generatePDFReport}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark rounded-xl shadow-lg disabled:opacity-50">

          <FileText className="w-5 h-5" />
          {isGeneratingPDF ? 'Generating Report...' : 'Download PDF Report'}
        </Button>

        {!isGeneratingPDF &&
          <p className="text-sm text-gray-600 text-center max-w-md">
            This will open your report in a new window. Use your browser's "Print to PDF" option to save it.
          </p>
        }
      </div>
    </div>);
}
