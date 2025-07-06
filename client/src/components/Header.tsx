import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InstructionsModal } from "./InstructionsModal";
import { periods, isPastPeriod } from "@/lib/periods";
import { cn } from "@/lib/utils";

interface HeaderProps {
  currentPeriod: number;
  onPeriodChange: (period: number) => void;
}

export function Header({ currentPeriod, onPeriodChange }: HeaderProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      <header className="mb-8 px-6 py-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="https://github.com/Charles-Ehler/Cava-Calendar/blob/main/CavaLogo.png?raw=true" 
              alt="CAVA Logo" 
              className="w-32 h-32 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-cava-primary">Ops Leader Visit Calendar</h1>
              <p className="text-lg text-cava-olive">Schedule your visits for the selected period</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-start mb-6">
          <Button
            onClick={() => setShowInstructions(true)}
            className="bg-[#fff8e8] text-cava-error font-bold px-4 py-2 rounded-full shadow-sm hover:underline transition-all"
            variant="ghost"
          >
            View Instructions
          </Button>
        </div>
        
        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {periods.map((period) => (
            <Button
              key={period.id}
              onClick={() => onPeriodChange(period.id)}
              className={cn(
                "period-tab px-3 py-2 font-bold text-sm bg-white rounded-lg shadow-sm border-2 border-transparent transition-all",
                currentPeriod === period.id && "active border-b-cava-primary",
                isPastPeriod(period.id) && "past text-gray-400"
              )}
              variant="ghost"
            >
              P{period.id}
            </Button>
          ))}
        </div>
      </header>

      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
    </>
  );
}
