
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Grid3X3, Sliders } from "lucide-react";

import DetailedGrid from '../calculator/DetailedGrid';
import SimplifiedInput from '../calculator/SimplifiedInput';

export default function WeeklyBaseline2425Screen({ formData, updateFormData }) {
  const simplifiedInputRef = React.useRef();
  
  const initializeGrids = () => {
    if (!formData.grid2425 || Object.keys(formData.grid2425).length === 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const sessions = ['FD', 'AM', 'PM'];
      
      const emptyGrid = {};
      (formData.ageBands || []).forEach(band => {
        emptyGrid[band] = {};
        days.forEach(day => {
          emptyGrid[band][day] = {};
          sessions.forEach(session => {
            emptyGrid[band][day][session] = { total: 0, funded: 0 };
          });
        });
      });
      // Also init 2526 grid if it's missing, to prevent errors on next screen
      if (!formData.grid2526 || Object.keys(formData.grid2526).length === 0) {
        updateFormData({ grid2425: emptyGrid, grid2526: JSON.parse(JSON.stringify(emptyGrid)) });
      } else {
        updateFormData({ grid2425: emptyGrid });
      }
    }
  };

  useEffect(() => {
    initializeGrids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formData.ageBands)]);

  // Pass ref to parent for grid generation
  useEffect(() => {
    // This passes the ref to the formData state. Be cautious as refs are not serializable
    // and storing them in state might lead to issues if state is persisted or deeply copied.
    // However, this is as per the outline.
    updateFormData({ simplifiedInputRef });
  }, [updateFormData]);

  const switchInputMode = (mode) => {
    updateFormData({ inputMode: mode });
  };

  return (
    <div className="space-y-8">
      {/* Input Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Baseline Data (24/25)</h3>
          <p className="text-gray-600">Enter attendance for a typical September week.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button
            variant={'ghost'}
            size="sm"
            onClick={() => switchInputMode('detailed')}
            className={`transition-colors ${formData.inputMode === 'detailed' 
                ? 'bg-white shadow-sm text-sage-800 hover:bg-white' 
                : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Detailed Grid
          </Button>
          <Button
            variant={'ghost'}
            size="sm"
            onClick={() => switchInputMode('simplified')}
            className={`transition-colors ${formData.inputMode === 'simplified' 
                ? 'bg-white shadow-sm text-sage-800 hover:bg-white'
                : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <Sliders className="w-4 h-4 mr-2" />
            Simplified
          </Button>
        </div>
      </div>

      {formData.inputMode === 'detailed' ? (
        <DetailedGrid 
          year="2425"
          formData={formData}
          updateFormData={updateFormData}
        />
      ) : (
        <SimplifiedInput 
          ref={simplifiedInputRef}
          formData={formData}
          updateFormData={updateFormData}
        />
      )}

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> This screen sets your baseline. On the next screen, you'll project how many of these sessions become funded in 25/26.
        </p>
      </div>
    </div>
  );
}
