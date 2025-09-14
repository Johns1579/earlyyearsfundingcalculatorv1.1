

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary">
      <style jsx>{`
        :root {
          --primary: #FF8000;
          --primary-dark: #D96D00;
          --primary-light: #FFF2E6;
          --secondary: #F3F4F6;
          --secondary-dark: #E5E7EB;
        }
        
        .bg-primary { background-color: var(--primary); }
        .hover\\:bg-primary-dark:hover { background-color: var(--primary-dark); }
        .bg-primary-light { background-color: var(--primary-light); }
        .bg-secondary { background-color: var(--secondary); }
        
        .text-primary { color: var(--primary); }
        .text-primary-dark { color: var(--primary-dark); }
        
        .border-primary { border-color: var(--primary); }
        .border-secondary-dark { border-color: var(--secondary-dark); }

        .ring-primary {
          --tw-ring-opacity: 1;
          --tw-ring-color: rgb(255 128 0 / var(--tw-ring-opacity));
        }
        
        .focus\\:ring-primary:focus {
           --tw-ring-opacity: 1;
          --tw-ring-color: rgb(255 128 0 / var(--tw-ring-opacity));
        }

        .focus\\:border-primary:focus {
          --tw-border-opacity: 1;
          border-color: rgb(255 128 0 / var(--tw-border-opacity));
        }
        
        input:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            --tw-ring-color: var(--primary);
            border-color: var(--primary);
        }
        
        .data-\\[state\\=checked\\]\\:bg-primary[data-state="checked"] {
            background-color: var(--primary);
        }

        /* Remove number input spinners/arrows */
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Calculator")} className="flex items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9c16fd63bf4608b740ef3/0dcbd038d_Thumbnail.png"
                alt="My Outstanding Day Nursery Logo"
                className="h-12 w-auto object-contain" />

              <div>
                <h1 className="text-xl font-bold text-gray-900">Early Years Funding Calculator</h1>
                <p className="text-sm text-gray-600">24/25 → 25/26 Funding Impact Analysis</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-primary">How to Use the EY Funding Calculator</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-8 mt-4 text-gray-800">
                    <div>
                      <h2 className="font-bold text-2xl text-primary mb-4">Quick Start Guide: Step-by-Step Walkthrough</h2>
                      <p className="mb-6 text-base text-gray-700">Follow these steps to accurately forecast your nursery's revenue changes from 24/25 to 25/26 under the new Early Years Funding rules.</p>
                      
                      <div className="space-y-5">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">1</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">Your Nursery Details (Basics Screen)</h3>
                            <p className="text-gray-700">Begin by entering your nursery's foundational information: its name, the number of weeks it's open per year (e.g., 51 for year-round with a week closure, 38 for term-time only), and the specific age bands you cater to. Accurately define your standard session hours (Full Day, AM, PM) and the private fees you charge for each session type. Finally, input the hourly rates your Local Authority (LA) pays you for funded places for both 24/25 and 25/26, along with any "extras" or top-up fees you charge on funded sessions for each year.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">2</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">Annual Projection Method</h3>
                            <p className="text-gray-700">Select how the calculator should annualise your weekly data. The recommended method is **"I know my 2024/25 total revenue" (Snapshot & Scale)**, which uses your actual annual income from the 24/25 financial year as a baseline for scaling projections. This provides the most accurate forecast. If you don't have this figure readily available, choose "I don't know my exact 2024/25 total revenue" and provide your best estimate, though accuracy will depend on your estimate's precision.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">3</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">Funded Hours Setup (Term Settings)</h3>
                            <p className="text-gray-700">This critical step allows you to define the number of children you expect to claim each type of funding in 25/26 (e.g., 15h stretched, 30h term-time). You can toggle "Enforce Official Funding Hours Limits" on or off. We highly recommend keeping it **ON** as it uses your entered child counts to validate your projected funded hours against legal claim limits, preventing over-estimation and ensuring realistic forecasts. Data for claimant counts can typically be found on your Local Authority's portal.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">4</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">24/25 Attendance (Baseline)</h3>
                            <p className="text-gray-700">Input your typical weekly attendance data for a representative week in 24/25. This establishes your baseline occupancy for each session type (Full Day, AM, PM) across all days of the week. You can choose between a **Detailed Grid** for day-by-day input or a **Simplified** input by entering weekly totals, which the calculator will then distribute across the week for you. This data will be used to project your 25/26 attendance, assuming similar occupancy trends.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">5</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">25/26 Projection</h3>
                            <p className="text-gray-700">With your baseline attendance locked in, this screen allows you to adjust the number of **funded** sessions to reflect how parents will use their new entitlements in 25/26. Use the "Copy 24/25" button to carry over your baseline data, then modify only the "Funded" columns as needed. If you've enabled funding caps, the calculator will prevent you from exceeding your official entitlements.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">6</span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">View Results</h3>
                            <p className="text-gray-700">The final screen presents a comprehensive analysis of the financial impact. You'll see the overall annual and weekly revenue changes, detailed breakdowns by age band and revenue type (funded vs. paid), and actionable insights to help you plan for the upcoming financial year. You can also download a PDF report for your records.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="font-bold text-2xl text-primary mb-4 mt-8">Troubleshooting & FAQs</h2>
                      <div className="space-y-4">
                        <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                          <h3 className="font-semibold text-lg">Why is my funded revenue zero or very low?</h3>
                          <p className="text-gray-700 mt-1">This usually happens for one of two reasons: 1) You may have forgotten to enter your **LA Provider Rates** on the Basics screen for 25/26. The calculator needs these hourly rates to calculate funded income. 2) You may not have allocated any **funded** sessions in the 25/26 projection grid. Ensure you have updated the "Funded" columns on Step 5.</p>
                        </div>
                        <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                          <h3 className="font-semibold text-lg">Why am I getting an "Over Cap" warning?</h3>
                          <p className="text-gray-700 mt-1">This warning appears on Step 5 if the total funded hours you've allocated for an age band exceed the maximum allowed by your claimant counts (from Step 3). To fix this, you need to reduce the number of funded sessions in the grid for that age band until the allocated hours are within the cap shown at the top of the grid.</p>
                        </div>
                        <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                          <h3 className="font-semibold text-lg">What if my 24/25 revenue fluctuates a lot?</h3>
                          <p className="text-gray-700 mt-1">The calculator's accuracy depends on a representative baseline. If your revenue is highly seasonal, using the **"I know my 2024/25 total revenue"** method on Step 2 is crucial. This method uses your actual annual figure to create a scaling factor, smoothing out weekly fluctuations and ensuring your projection is anchored to a known yearly total.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9c16fd63bf4608b740ef3/0dcbd038d_Thumbnail.png"
              alt="My Outstanding Day Nursery Logo"
              className="h-8 w-auto object-contain" />

            <span className="font-medium text-gray-900">Early Years Funding Calculator</span>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            This calculator helps nursery owners understand the revenue impact of funding rule changes 
            from 24/25 to 25/26. For professional advice, consult with your accountant or early years advisor.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © 2024 My Outstanding Day Nursery. All calculations are estimates based on provided inputs.
          </p>
        </div>
      </footer>
    </div>);

}

