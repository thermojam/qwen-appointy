'use client';

import { cn } from '@/shared/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step labels */}
      {stepLabels && (
        <div className="flex justify-between">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className={cn(
                'flex flex-col items-center gap-1',
                index > currentStep && 'opacity-40'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block max-w-[80px] truncate">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
