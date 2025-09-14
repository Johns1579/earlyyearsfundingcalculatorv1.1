import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingUp, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnnualisationScreen({ formData, updateFormData }) {
  const [focusedField, setFocusedField] = useState(null);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#ff8000] p-6 flex flex-col space-y-1.5 from-primary/5 to-primary/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
             <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Annual Projection Method
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-gray-600 mb-6">
            Choose how to scale your weekly snapshot to a full year's projection. This ensures your final results are as accurate as possible.
          </p>
          <RadioGroup
            value={formData.annualisationMethod}
            onValueChange={(value) => updateFormData({ annualisationMethod: value })}
            className="space-y-6">

            {/* I know my actual revenue */}
            <div className="p-6 border-2 border-gray-200 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="snapshot" id="actual" />
                <Label htmlFor="actual" className="text-base font-semibold text-gray-800 cursor-pointer">
                  I know my 2024/25 total revenue
                </Label>
              </div>
              
              <div className="pl-8 pt-4 space-y-4">
                  <Alert className="bg-white border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary-dark">
                      Enter your actual revenue for September 2024–August 2025. This anchors the forecast for maximum accuracy.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="annual2425" className="font-medium">24/25 Actual Annual Revenue *</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                      <Input
                      id="annual2425"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.annual2425Actual || ''}
                      onChange={(e) => updateFormData({ annual2425Actual: parseFloat(e.target.value) || null })}
                      placeholder="Enter your actual annual revenue"
                      className="h-12 pl-8 border-2 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl shadow-sm hover:border-gray-300"
                      disabled={formData.annualisationMethod !== 'snapshot'} />

                    </div>
                  </div>
                </div>
            </div>

            {/* I don't know my exact revenue */}
            <div className="p-6 border-2 border-gray-200 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="estimated" id="estimated" />
                <Label htmlFor="estimated" className="text-base font-semibold text-gray-800 cursor-pointer">
                  I don't know my exact 2024/25 total revenue
                </Label>
              </div>
              
              <div className="pl-8 pt-4 space-y-4">
                  <Alert className="bg-white border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary-dark">
                      Enter your best estimate for September 2024–August 2025. Result accuracy depends on the accuracy of your estimate.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="annual2425estimated" className="font-medium">Estimated 24/25 Annual Revenue *</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">£</span>
                      <Input
                      id="annual2425estimated"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.annual2425Actual || ''}
                      onChange={(e) => updateFormData({ annual2425Actual: parseFloat(e.target.value) || null })}
                      placeholder="Enter your best estimate annual revenue"
                      className="h-12 pl-8 border-2 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl shadow-sm hover:border-gray-300"
                      disabled={formData.annualisationMethod !== 'estimated'} />

                    </div>
                  </div>
                </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>);

}