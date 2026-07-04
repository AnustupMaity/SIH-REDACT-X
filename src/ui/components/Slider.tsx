import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({ value, onValueChange, min = 0, max = 5, step = 1, className }: SliderProps) {
  const marks = React.useMemo(() => {
    const result = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }, [min, max, step]);

  return (
    <div className="relative pt-2 pb-8 w-full">
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none items-center cursor-pointer group",
          className
        )}
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-gray-200/80 dark:bg-gray-800/80 overflow-hidden shadow-inner">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-150" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 border-white bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-900"
          aria-label="Redaction Level Slider"
        />
      </SliderPrimitive.Root>

      <div className="absolute left-0 right-0 -bottom-1 flex justify-between px-0.5">
        {marks.map((mark) => (
          <div
            key={mark}
            className="flex flex-col items-center group/mark cursor-pointer"
            onClick={() => onValueChange([mark])}
          >
            <div className={cn(
              "w-0.5 h-2.5 transition-colors mb-1 rounded-full",
              value[0] >= mark ? "bg-purple-500 dark:bg-purple-400 font-bold" : "bg-gray-300 dark:bg-gray-700"
            )} />
            <span className={cn(
              "text-xs transition-all font-medium",
              value[0] === mark
                ? "text-purple-600 dark:text-purple-400 font-extrabold scale-110"
                : "text-gray-500 dark:text-gray-400"
            )}>
              L{mark}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}