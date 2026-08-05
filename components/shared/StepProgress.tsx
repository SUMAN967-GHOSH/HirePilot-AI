import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, title: 'Upload' },
  { id: 2, title: 'Analysis' },
  { id: 3, title: 'Interview' },
  { id: 4, title: 'Report' },
];

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-violet-600 -z-10 rounded transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-slate-900' 
                    : isCurrent
                      ? 'bg-violet-600 border-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-medium">{step.id}</span>}
              </div>
              <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
