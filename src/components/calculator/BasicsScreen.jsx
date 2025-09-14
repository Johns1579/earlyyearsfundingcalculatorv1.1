
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Clock, PoundSterling, Gift } from "lucide-react";

export default function BasicsScreen({ formData, updateFormData }) {
  const [focusedField, setFocusedField] = useState(null);

  const ageBandOptions = [
    { id: 'U2', label: '0-2 years (Under 2s)' },
    { id: '2to3', label: '2-3 years' },
    { id: '3to4', label: '3-4 years' }
  ];

  const handleAgeBandChange = (bandId, checked) => {
    const newBands = checked ?
      [...(formData.ageBands || []), bandId] :
      (formData.ageBands || []).filter((b) => b !== bandId);
    updateFormData({ ageBands: newBands });
  };

  const updateSessionHours = (session, value) => {
    updateFormData({
      sessionHours: { ...formData.sessionHours, [session]: parseFloat(value) || 0 }
    });
  };

  const updatePrivateFees = (session, value) => {
    updateFormData({
      privateFees: { ...formData.privateFees, [session]: parseFloat(value) || 0 }
    });
  };

  const updateLARate = (year, band, value) => {
    const key = `laRates${year}`;
    updateFormData({
      [key]: {
        ...formData[key],
        [band]: {
          ...(formData[key]?.[band] || {}),
          total_rate: parseFloat(value) || 0
        }
      }
    });
  };

  const updateExtras = (year, field, value) => {
    const key = `extras${year}`;
    updateFormData({
      [key]: { ...formData[key], [field]: parseFloat(value) || 0 }
    });
  };

  return (
    <div className="space-y-8">
      {/* Nursery Details */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <div className="bg-[#ff8000] w-10 h-10 from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Nursery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="nurseryName" className="text-base font-semibold text-gray-700">Nursery Name *</Label>
              <Input
                id="nurseryName"
                value={formData.nurseryName}
                onChange={(e) => updateFormData({ nurseryName: e.target.value })}
                placeholder="Enter your nursery name"
                className="h-12 text-lg border-2 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl shadow-sm hover:border-gray-300 transition-colors" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Open Weeks per Year</Label>
              <Select
                value={(formData.openWeeks || '51').toString()}
                onValueChange={(value) => updateFormData({ openWeeks: parseInt(value) })}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                  <SelectValue placeholder="Select weeks" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-2">
                  <SelectItem value="51">51 weeks (year-round with 1 week closure)</SelectItem>
                  <SelectItem value="38">38 weeks (term-time only)</SelectItem>
                  <SelectItem value="52">52 weeks (full year-round)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">Choose your typical operating pattern</p>
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-700">Age Bands Included</Label>
            <div className="grid md:grid-cols-3 gap-6">
              {ageBandOptions.map((band) => (
                <div key={band.id} className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                  <Checkbox
                    id={band.id}
                    checked={(formData.ageBands || []).includes(band.id)}
                    onCheckedChange={(checked) => handleAgeBandChange(band.id, checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-5 h-5" />
                  <Label htmlFor={band.id} className="text-sm font-medium cursor-pointer">{band.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Setup */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <div className="bg-[#ff8000] w-10 h-10 from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Session Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-inner">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-base font-bold text-gray-700">Session Type</th>
                  <th className="text-left py-4 px-6 text-base font-bold text-gray-700">Hours</th>
                  <th className="text-left py-4 px-6 text-base font-bold text-gray-700">Private Fee</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'FD', label: 'Full Day' },
                  { key: 'AM', label: 'Morning' },
                  { key: 'PM', label: 'Afternoon' }
                ].map((session, index) => (
                  <tr key={session.key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary/5 transition-colors`}>
                    <td className="py-6 px-6 font-semibold text-gray-800">{session.label}</td>
                    <td className="py-6 px-6">
                      <Input
                        type="number"
                        min="0.25"
                        max="12"
                        step="0.25"
                        value={formData.sessionHours[session.key]}
                        onChange={(e) => updateSessionHours(session.key, e.target.value)}
                        className="w-24 border-2 border-gray-200 focus:border-primary rounded-lg shadow-sm" />
                    </td>
                    <td className="py-6 px-6">
                      <div className="relative w-32 inline-block">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            focusedField === `privatefee-${session.key}` ?
                            formData.privateFees[session.key] :
                            Number(formData.privateFees[session.key]).toFixed(2)
                          }
                          onFocus={() => setFocusedField(`privatefee-${session.key}`)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => updatePrivateFees(session.key, e.target.value)}
                          className="w-full pl-8 pr-4 border-2 border-gray-200 focus:border-primary rounded-lg shadow-sm"
                          placeholder="0.00" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
            <p className="text-sm text-primary-dark leading-relaxed">
              <strong>Private Fees:</strong> These are the rates you charge for non-funded sessions (e.g., private paying children or sessions beyond funded entitlement).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LA Rates */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <div className="bg-[#ff8000] w-10 h-10 from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <PoundSterling className="w-5 h-5 text-white" />
            </div>
            LA Provider Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-inner">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-base font-bold text-gray-700">Age Band</th>
                  <th className="text-right py-4 px-6 text-base font-bold text-gray-700">24/25 Rate (£/hr)</th>
                  <th className="text-right py-4 px-6 text-base font-bold text-gray-700">25/26 Rate (£/hr)</th>
                </tr>
              </thead>
              <tbody>
                {(formData.ageBands || []).map((band, index) => (
                  <tr key={band} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary/5 transition-colors`}>
                    <td className="py-6 px-6 font-semibold text-gray-800">
                      {ageBandOptions.find((b) => b.id === band)?.label}
                    </td>
                    {/* 24/25 Rate Input */}
                    <td className="py-6 px-6 text-right">
                      <div className="relative w-32 inline-block">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                        <Input
                          type="number" min="0" step="0.01"
                          value={
                            focusedField === `larate-2425-${band}` ?
                            formData.laRates2425?.[band]?.total_rate || '' :
                            Number(formData.laRates2425?.[band]?.total_rate || 0).toFixed(2)
                          }
                          onFocus={() => setFocusedField(`larate-2425-${band}`)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => updateLARate('2425', band, e.target.value)}
                          className="w-full text-right pr-4 pl-8 border-2 border-gray-200 focus:border-primary rounded-lg shadow-sm"
                          placeholder="0.00" />
                      </div>
                    </td>
                    {/* 25/26 Rate Input */}
                    <td className="py-6 px-6 text-right">
                      <div className="relative w-32 inline-block">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                        <Input
                          type="number" min="0" step="0.01"
                          value={
                            focusedField === `larate-2526-${band}` ?
                            formData.laRates2526?.[band]?.total_rate || '' :
                            Number(formData.laRates2526?.[band]?.total_rate || 0).toFixed(2)
                          }
                          onFocus={() => setFocusedField(`larate-2526-${band}`)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => updateLARate('2526', band, e.target.value)}
                          className="w-full text-right pr-4 pl-8 border-2 border-gray-200 focus:border-primary rounded-lg shadow-sm"
                          placeholder="0.00" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
            <p className="text-sm text-primary-dark leading-relaxed">
              <strong>LA Rates:</strong> Enter the total hourly rate your Local Authority pays you for funded places, for each year.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Extras on Funded Sessions */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
            <div className="bg-[#ff8000] w-10 h-10 from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <Gift className="w-5 h-5 text-white" />
            </div>
            Extras on Funded Sessions (Top-ups)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* 24/25 Extras Card */}
          <div className="p-6 rounded-2xl border-2 border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">24/25 Extras</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="fullDayExtras2425" className="text-base font-semibold text-gray-700">Per Funded Full-Day</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                  <Input
                    id="fullDayExtras2425" type="number" min="0" step="0.01"
                    value={
                      focusedField === 'extra-2425-full' ?
                      formData.extras2425?.perFundedFullDay :
                      Number(formData.extras2425?.perFundedFullDay || 0).toFixed(2)
                    }
                    onFocus={() => setFocusedField('extra-2425-full')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateExtras('2425', 'perFundedFullDay', e.target.value)}
                    className="h-12 pl-8 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm hover:border-gray-300 transition-colors"
                    placeholder="0.00" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Applies to full day sessions</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="halfDayExtras2425" className="text-base font-semibold text-gray-700">Per Funded Half-Day</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                  <Input
                    id="halfDayExtras2425" type="number" min="0" step="0.01"
                    value={
                      focusedField === 'extra-2425-half' ?
                      formData.extras2425?.perFundedHalfDay :
                      Number(formData.extras2425?.perFundedHalfDay || 0).toFixed(2)
                    }
                    onFocus={() => setFocusedField('extra-2425-half')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateExtras('2425', 'perFundedHalfDay', e.target.value)}
                    className="h-12 pl-8 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm hover:border-gray-300 transition-colors"
                    placeholder="0.00" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Applies to AM/PM sessions</p>
              </div>
            </div>
          </div>
          
          {/* 25/26 Extras Card */}
          <div className="p-6 rounded-2xl border-2 border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">25/26 Extras</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="fullDayExtras2526" className="text-base font-semibold text-gray-700">Per Funded Full-Day</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                  <Input
                    id="fullDayExtras2526" type="number" min="0" step="0.01"
                    value={
                      focusedField === 'extra-2526-full' ?
                      formData.extras2526?.perFundedFullDay :
                      Number(formData.extras2526?.perFundedFullDay || 0).toFixed(2)
                    }
                    onFocus={() => setFocusedField('extra-2526-full')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateExtras('2526', 'perFundedFullDay', e.target.value)}
                    className="h-12 pl-8 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm hover:border-gray-300 transition-colors"
                    placeholder="0.00" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Applies to full day sessions</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="halfDayExtras2526" className="text-base font-semibold text-gray-700">Per Funded Half-Day</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                  <Input
                    id="halfDayExtras2526" type="number" min="0" step="0.01"
                    value={
                      focusedField === 'extra-2526-half' ?
                      formData.extras2526?.perFundedHalfDay :
                      Number(formData.extras2526?.perFundedHalfDay || 0).toFixed(2)
                    }
                    onFocus={() => setFocusedField('extra-2526-half')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateExtras('2526', 'perFundedHalfDay', e.target.value)}
                    className="h-12 pl-8 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm hover:border-gray-300 transition-colors"
                    placeholder="0.00" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Applies to AM/PM sessions</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
            <p className="text-sm text-primary-dark leading-relaxed">
              <strong>Note:</strong> Set 25/26 extras to £0 if top-ups are no longer permitted. Extras apply only to funded sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
