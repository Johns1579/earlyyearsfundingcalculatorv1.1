
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, TrendingUp, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import BasicsScreen from '../components/calculator/BasicsScreen';
import AnnualisationScreen from '../components/calculator/AnnualisationScreen';
import TermTimeScreen from '../components/calculator/TermTimeScreen';
import WeeklyBaseline2425Screen from '../components/calculator/WeeklyBaseline2425Screen';
import WeeklyProjected2526Screen from '../components/calculator/WeeklyProjected2526Screen';
import ResultsScreen from '../components/calculator/ResultsScreen';

import { calculateResults } from '../components/calculator/calculations';

export default function Calculator() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    nurseryName: '',
    openWeeks: 51,
    ageBands: ['U2', '2to3', '3to4'],
    sessionHours: { FD: 10.0, AM: 5.0, PM: 5.0 },
    privateFees: { FD: 75, AM: 37.5, PM: 37.5 },
    laRates: {
      'U2': { total_rate: 8.50 },
      '2to3': { total_rate: 7.50 },
      '3to4': { total_rate: 5.80 }
    },
    extras: { perFundedHalfDay: 5, perFundedFullDay: 8 },
    annualisationMethod: 'snapshot',
    annual2425Actual: null,
    termMultipliers: { autumn: 0.92, spring: 1.00, summer: 1.10 },
    enforceCaps: true,
    modeByBand: { 'U2': 'STRETCHED', '2to3': 'STRETCHED', '3to4': 'STRETCHED' },
    claimantCounts2526: {},
    grid2425: {},
    grid2526: {},
    inputMode: 'detailed',
    _copied2425to2526: false,
    simplifiedInputRef: null // Added to hold a reference to imperative methods for simplified input mode
  });

  const updateFormData = (updates) => setFormData((prev) => ({ ...prev, ...updates }));

  const results = useMemo(() => calculateResults(formData), [formData]);

  const handleStartCalculator = () => {
    setShowCalculator(true);
  };

  const handleBackToHero = () => {
    setShowCalculator(false);
    setCurrentStep(1);
  };

  const handleNext = () => {
    const newStep = Math.min(currentStep + 1, 6);
    
    // If moving from step 4 to 5 and using simplified input, auto-generate grids
    if (currentStep === 4 && newStep === 5 && formData.inputMode === 'simplified' && formData.simplifiedInputRef?.current) {
      formData.simplifiedInputRef.current.generateGrids();
    }
    
    setCurrentStep(newStep);
    
    // For results page (step 6), use a slight delay to ensure content is rendered
    if (newStep === 6) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // Immediate scroll for other pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    // Scroll to top of page when moving to previous step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
  { id: 1, title: 'Your Nursery', component: BasicsScreen },
  { id: 2, title: 'Annual Projection', component: AnnualisationScreen },
  { id: 3, title: 'Funded Hours', component: TermTimeScreen },
  { id: 4, title: '24/25 Attendance', component: WeeklyBaseline2425Screen },
  { id: 5, title: '25/26 Attendance', component: WeeklyProjected2526Screen },
  { id: 6, title: 'Results', component: ResultsScreen }];


  const currentStepData = steps.find((s) => s.id === currentStep);
  const CurrentComponent = currentStepData?.component;

  if (!showCalculator) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF8000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Column - Content */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-lg font-bold text-gray-700">Funding Changes 24/25 → 25/26</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Optimise your
                      <span className="block text-primary">2025/26 plan</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                      Understand exactly how the new Early Years Funding rules will affect your nursery's revenue. To achieve this, we project your 2025/26 revenue assuming your nursery's occupancy levels and operational costs remain consistent with your 24/25 baseline. This approach provides a clear, focused insight into how the new funding rates alone will influence your income, empowering you to plan effectively for the year ahead.
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Accurate Projections</h3>
                        <p className="text-sm text-gray-600">Based on your actual 24/25 revenue and attendance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Funded Hours Checker</h3>
                        <p className="text-sm text-gray-600">Automatically validates your projected funded hours against your LA claimed funding hours.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">10-Minute Setup</h3>
                        <p className="text-sm text-gray-600">Use your 24/25 figures; get a clear 25/26 forecast.</p>
                      </div>
                    </div>
                  </div>

                  {/* New paragraph before CTA */}
                  <p className="text-lg text-gray-700 text-center sm:text-left max-w-2xl mx-auto sm:mx-0">
                    Click on the button below, enter your numbers and find out how the funding changes will affect your nursery in 25/26.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleStartCalculator}
                      size="lg"
                      className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">

                      <CalculatorIcon className="w-6 h-6 mr-3" />
                      Let's Begin
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>✓ Secure & Private</span>
                      <span>✓ No Registration Required</span>
                      <span>✓ Professional Results</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visual */}
                <div className="relative">
                  {/* Main visual container */}
                  <div className="relative">
                    {/* Background card stack effect */}
                    <div className="absolute top-4 left-4 w-full h-80 bg-gray-100 rounded-2xl transform rotate-2 opacity-30"></div>
                    <div className="absolute top-2 left-2 w-full h-80 bg-gray-200 rounded-2xl transform rotate-1 opacity-50"></div>
                    
                    {/* Main preview card */}
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="bg-primary p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CalculatorIcon className="w-8 h-8 text-white" />
                            <span className="font-bold text-white text-lg">EY Calculator</span>
                          </div>
                          <div className="text-white/80 text-sm">Step 1 of 6</div>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">Nursery Details</h3>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                          <div className="h-6 bg-primary/10 rounded w-full"></div>
                        </div>
                        
                        <div className="pt-4">
                          <div className="h-10 bg-primary rounded-lg w-32"></div>
                        </div>
                      </div>
                      
                      <div className="px-6 pb-6">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full w-1/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating stats */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border p-4">
                    <div className="text-2xl font-bold text-primary">£45,000</div>
                    <div className="text-xs text-gray-500">Projected Impact</div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border p-4">
                    <div className="text-2xl font-bold text-green-600">+12%</div>
                    <div className="text-xs text-gray-500">Revenue Change</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
            </div>
          </div>
        </section>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={handleBackToHero}
            variant="outline"
            className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">

            <ChevronLeft className="w-4 h-4" />
            Back to Overview
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Early Years Funding Calculator</h1>
            <p className="text-gray-600">Step {currentStep} of {steps.length}: {currentStepData?.title}</p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${currentStep / steps.length * 100}%` }}>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            {steps.map((step) =>
            <span key={step.id} className={currentStep >= step.id ? 'text-primary font-medium' : ''}>
                {step.title}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {CurrentComponent &&
            <CurrentComponent formData={formData} updateFormData={updateFormData} />
            }
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary shadow-sm hover:shadow-md transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">

            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length || (currentStep === 3 && formData.enforceCaps && !formData._termTimeScreenValid)}
            size="lg"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">

            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>);

}
