import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

export default function CapMeter({ band, formData }) {
  const ageBandLabels = {
    'U2': '0-2 years',
    '2to3': '2-3 years', 
    '3to4': '3-4 years'
  };

  const counts = formData.claimantCounts2526[band];
  if (!counts) return null;

  const mode = formData.modeByBand[band];
  let cap = 0;

  // Calculate cap
  if (mode === 'STRETCHED' || mode === 'MIXED') {
    cap += (counts.fifteen_stretched || 0) * 11.176470588;
    cap += (counts.thirty_stretched || 0) * 22.352941176;
  }

  if (mode === 'TERMTIME' || mode === 'MIXED') {
    cap += (counts.fifteen_term || 0) * 15;
    cap += (counts.thirty_term || 0) * 30;
  }

  // Calculate allocated hours
  const grid2526 = formData.grid2526 || {};
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const sessions = ['FD', 'AM', 'PM'];
  
  let allocated = 0;
  days.forEach(day => {
    sessions.forEach(session => {
      const funded = grid2526[band]?.[day]?.[session]?.funded || 0;
      const sessionHours = formData.sessionHours[session] || 0;
      allocated += funded * sessionHours;
    });
  });

  const remaining = Math.max(0, cap - allocated);
  const percentage = cap > 0 ? Math.min(100, (allocated / cap) * 100) : 0;
  const isOverCap = allocated > cap;

  return (
    <Card className={`${isOverCap ? 'border-red-300 bg-red-50' : 'border-sage-200'} transition-colors`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-gray-700">
          {ageBandLabels[band]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Progress 
            value={percentage} 
            className={`h-3 ${isOverCap ? '[&>div]:bg-red-500' : '[&>div]:bg-sage-500'}`}
          />
          {isOverCap && (
            <div className="absolute -top-1 -right-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Allocated:</span>
            <span className="font-medium">{allocated.toFixed(1)}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cap:</span>
            <span className="font-medium">{cap.toFixed(1)}h</span>
          </div>
          <div className="flex justify-between">
            <span className={isOverCap ? 'text-red-600' : 'text-sage-600'}>
              {isOverCap ? 'Over by:' : 'Remaining:'}
            </span>
            <span className={`font-medium ${isOverCap ? 'text-red-600' : 'text-sage-600'}`}>
              {isOverCap ? `${(allocated - cap).toFixed(1)}h` : `${remaining.toFixed(1)}h`}
            </span>
          </div>
        </div>
        
        {isOverCap && (
          <p className="text-xs text-red-600 font-medium">
            Weekly entitlement exceeded
          </p>
        )}
      </CardContent>
    </Card>
  );
}