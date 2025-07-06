import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitTile } from "./VisitTile";
import { getVisitTypesForPeriod, getStaticVisitTypes } from "@/lib/visitTypes";
import { useDragAndDrop, DraggedItem } from "@/hooks/useDragAndDrop";

interface VisitBankProps {
  currentPeriod: number;
  onDragStart: (item: DraggedItem) => void;
  onDragEnd: () => void;
  onResetCalendar: () => void;
}

export function VisitBank({ 
  currentPeriod, 
  onDragStart, 
  onDragEnd,
  onResetCalendar 
}: VisitBankProps) {
  const staticVisits = getStaticVisitTypes();
  const periodVisits = getVisitTypesForPeriod(currentPeriod).filter(vt => !vt.isStatic);

  const handleResetCalendar = () => {
    if (confirm('Are you sure you want to reset the calendar for this period? This action cannot be undone.')) {
      onResetCalendar();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-cava-primary">Visit Bank</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Static Visits Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-cava-primary mb-3">
            Static Visits (One per period)
          </h3>
          <div className="space-y-2">
            {staticVisits.map((visit) => (
              <VisitTile
                key={visit.key}
                visitType={visit.key}
                name={visit.name}
                hours={visit.hours}
                color={visit.color}
                textColor={visit.textColor}
                isStatic={visit.isStatic}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>

        {/* Restaurant Visits Section */}
        <div>
          <h3 className="text-sm font-bold text-cava-fuchsia mb-3">
            Restaurant Visits (Period {currentPeriod})
          </h3>
          <div className="space-y-2">
            {periodVisits.map((visit) => (
              <VisitTile
                key={visit.key}
                visitType={visit.key}
                name={visit.name}
                hours={visit.hours}
                color={visit.color}
                textColor={visit.textColor}
                isStatic={visit.isStatic}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>

        {/* Reset Calendar Button */}
        <Button
          onClick={handleResetCalendar}
          className="w-full cava-action-red text-white font-bold py-2 px-4 rounded-lg mt-6 hover:bg-red-700 transition-colors"
        >
          Reset Calendar
        </Button>
      </CardContent>
    </Card>
  );
}
