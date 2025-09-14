
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Calendar, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TermTimeScreen({ formData, updateFormData }) {
  const ageBandLabels = {
    'U2': '0-2 years',
    '2to3': '2-3 years',
    '3to4': '3-4 years'
  };

  // Update parent component with validation state
  React.useEffect(() => {
    // Validation logic moved into useEffect
    const isValid = () => {
      if (!formData.enforceCaps) return true; // No validation needed if caps not enforced
      
      const bands = formData.ageBands || [];
      
      for (const band of bands) {
        const mode = formData.modeByBand?.[band] || 'STRETCHED';
        const counts = formData.claimantCounts2526?.[band];
        
        if (!counts) return false; // No data entered for this band
        
        // Check required fields based on mode
        if (mode === 'STRETCHED' || mode === 'MIXED') {
          // fifteen_stretched and thirty_stretched are required
          if (!counts.fifteen_stretched && counts.fifteen_stretched !== 0) return false;
          if (!counts.thirty_stretched && counts.thirty_stretched !== 0) return false;
        }
        
        if (mode === 'TERMTIME' || mode === 'MIXED') {
          // fifteen_term and thirty_term are required
          if (!counts.fifteen_term && counts.fifteen_term !== 0) return false;
          if (!counts.thirty_term && counts.thirty_term !== 0) return false;
        }
      }
      
      return true;
    };

    const validationState = isValid();
    updateFormData({ _termTimeScreenValid: validationState });
  }, [formData.enforceCaps, formData.ageBands, formData.modeByBand, formData.claimantCounts2526, updateFormData]);

  // Validation helper for display purposes
  const isFormValid = () => {
    if (!formData.enforceCaps) return true;
    
    const bands = formData.ageBands || [];
    
    for (const band of bands) {
      const mode = formData.modeByBand?.[band] || 'STRETCHED';
      const counts = formData.claimantCounts2526?.[band];
      
      if (!counts) return false;
      
      if (mode === 'STRETCHED' || mode === 'MIXED') {
        if (!counts.fifteen_stretched && counts.fifteen_stretched !== 0) return false;
        if (!counts.thirty_stretched && counts.thirty_stretched !== 0) return false;
      }
      
      if (mode === 'TERMTIME' || mode === 'MIXED') {
        if (!counts.fifteen_term && counts.fifteen_term !== 0) return false;
        if (!counts.thirty_term && counts.thirty_term !== 0) return false;
      }
    }
    
    return true;
  };


  const updateModeByBand = (band, mode) => {
    updateFormData({
      modeByBand: { ...formData.modeByBand, [band]: mode }
    });
  };

  const updateClaimantCount = (band, type, value) => {
    const counts = formData.claimantCounts2526[band] || {
      fifteen_stretched: 0,
      thirty_stretched: 0,
      fifteen_term: 0,
      thirty_term: 0,
      thirty_stretched_twoday: 0
    };

    let newCounts = { ...counts };
    const parsedValue = Math.max(0, parseInt(value) || 0);

    // Update the specific field
    newCounts[type] = parsedValue;

    // Validation logic for 30h stretched two-day entitlement
    if (type === 'thirty_stretched_twoday') {
      const thirtyStretchedTotal = newCounts.thirty_stretched || 0;
      newCounts.thirty_stretched_twoday = Math.min(parsedValue, thirtyStretchedTotal);
    } else if (type === 'thirty_stretched') {
      // If total 30h stretched decreases, ensure two-day count doesn't exceed new total
      const thirtyStretchedTwoDay = newCounts.thirty_stretched_twoday || 0;
      newCounts.thirty_stretched_twoday = Math.min(thirtyStretchedTwoDay, parsedValue);
    }

    // Auto-update funding mode if two-day count is entered and not already STRETCHED/MIXED
    let newMode = formData.modeByBand[band];
    if (type === 'thirty_stretched_twoday' && newCounts.thirty_stretched_twoday > 0) {
      if (newMode === 'TERMTIME') {
        newMode = 'MIXED';
      } else if (newMode !== 'MIXED' && newMode !== 'STRETCHED') {
        // Fallback for an unexpected mode, default to STRETCHED if two-day is active
        newMode = 'STRETCHED';
      }
    }

    updateFormData({
      claimantCounts2526: {
        ...formData.claimantCounts2526,
        [band]: newCounts
      },
      // Conditionally update modeByBand only if it has changed
      ...(newMode !== formData.modeByBand[band] && { modeByBand: { ...formData.modeByBand, [band]: newMode } })
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Your Funded Hours (25/26)
        </h3>
        <p className="text-gray-600">
          Configure how many children will claim each type of funding in 25/26. This data, typically found on your LA portal, is crucial for validating your revenue projection.
        </p>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
             <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
            </div>
            Funded Hours Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="space-y-1">
              <Label htmlFor="enforce-caps" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-semibold text-gray-800">Enforce Official Funding Hours Limits

              </Label>
              <p className="text-sm text-gray-600 max-w-2xl">
                (Recommended) Ensures your projected funded hours do not exceed what you can legally claim.
              </p>
            </div>
            <Switch
              id="enforce-caps"
              checked={formData.enforceCaps}
              onCheckedChange={(checked) => updateFormData({ enforceCaps: checked })}
              className="data-[state=checked]:bg-primary" />

          </div>

          {formData.enforceCaps ?
          <Alert className="bg-primary/10 border-primary/20">
              <Calendar className="h-4 w-4 text-primary-dark" />
              <AlertDescription className="text-primary-dark font-medium">
                Validation is ON. The calculator will now use the child counts you provide below to determine your maximum claimable funded hours per week.
              </AlertDescription>
            </Alert> :

          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation is OFF.</strong> The calculator will not validate your funded hours. You are responsible for ensuring your entries align with your actual entitlements.
              </AlertDescription>
            </Alert>
          }

          {formData.enforceCaps && !isFormValid() && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Incomplete data:</strong> Please fill in all required claimant counts for each age band before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {formData.ageBands.map((band) =>
      <Card key={band} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
            <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                <span className="font-bold text-white text-sm">{ageBandLabels[band].substring(0, 4).trim()}</span>
              </div>
              Claimant Counts: {ageBandLabels[band]}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="max-w-sm">
              <Label htmlFor={`mode-${band}`} className="text-base font-semibold text-gray-700">Funding Mode</Label>
              <Select
              value={formData.modeByBand[band] || 'STRETCHED'}
              onValueChange={(value) => updateModeByBand(band, value)}>

                <SelectTrigger className="mt-2 h-12 border-2 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl shadow-sm hover:border-gray-300">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-2">
                  <SelectItem value="STRETCHED">Stretched Only (Year-round)</SelectItem>
                  <SelectItem value="TERMTIME">Term-time Only</SelectItem>
                  <SelectItem value="MIXED">Mixed (Both types offered)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
              {(formData.modeByBand[band] === 'STRETCHED' || formData.modeByBand[band] === 'MIXED') &&
            <>
                  <div>
                    <Label htmlFor={`${band}-15-stretched`}>15h Stretched</Label>
                    <Input
                  id={`${band}-15-stretched`}
                  type="number"
                  min="0"
                  value={formData.claimantCounts2526[band]?.fifteen_stretched || ''}
                  onChange={(e) => updateClaimantCount(band, 'fifteen_stretched', e.target.value)}
                  className="mt-1 h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                  placeholder="0" />

                  </div>
                  <div>
                    <Label htmlFor={`${band}-30-stretched`}>30h Stretched</Label>
                    <Input
                  id={`${band}-30-stretched`}
                  type="number"
                  min="0"
                  value={formData.claimantCounts2526[band]?.thirty_stretched || ''}
                  onChange={(e) => updateClaimantCount(band, 'thirty_stretched', e.target.value)}
                  className="mt-1 h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                  placeholder="0" />

                  </div>
                  <div>
                    <Label htmlFor={`${band}-30-stretched-twoday`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">30h stretched (Children who attend for 2-days/week)</Label>
                    <Input
                  id={`${band}-30-stretched-twoday`}
                  type="number"
                  min="0"
                  max={formData.claimantCounts2526[band]?.thirty_stretched || 0}
                  value={formData.claimantCounts2526[band]?.thirty_stretched_twoday || ''}
                  onChange={(e) => updateClaimantCount(band, 'thirty_stretched_twoday', e.target.value)}
                  className="mt-1 h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                  placeholder="0" />

                     <p className="text-xs text-gray-500 mt-1">Subset of 30h stretched</p>
                  </div>
                </>
            }

              {(formData.modeByBand[band] === 'TERMTIME' || formData.modeByBand[band] === 'MIXED') &&
            <>
                  <div>
                    <Label htmlFor={`${band}-15-term`}>15h Term-time</Label>
                    <Input
                  id={`${band}-15-term`}
                  type="number"
                  min="0"
                  value={formData.claimantCounts2526[band]?.fifteen_term || ''}
                  onChange={(e) => updateClaimantCount(band, 'fifteen_term', e.target.value)}
                  className="mt-1 h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                  placeholder="0" />

                  </div>
                  <div>
                    <Label htmlFor={`${band}-30-term`}>30h Term-time</Label>
                    <Input
                  id={`${band}-30-term`}
                  type="number"
                  min="0"
                  value={formData.claimantCounts2526[band]?.thirty_term || ''}
                  onChange={(e) => updateClaimantCount(band, 'thirty_term', e.target.value)}
                  className="mt-1 h-12 border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                  placeholder="0" />

                  </div>
                </>
            }
            </div>
             <p className="text-sm text-gray-500 -mt-4">
              Enter the number of children claiming each funding type.
            </p>
          </CardContent>
        </Card>
      )}
    </div>);

}
