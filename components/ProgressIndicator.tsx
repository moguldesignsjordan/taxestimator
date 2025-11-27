import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-1 text-sm font-medium text-[var(--text-color-light)]">
        <span>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-[var(--secondary-color)] rounded-full h-2.5">
        <div 
          className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;