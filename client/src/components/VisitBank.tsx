import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitTile } from "./VisitTile";
import { DraggedItem } from "@/hooks/useDragAndDrop";
import { GeneratedVisit } from "@/lib/visitGeneration";
import { Download } from "lucide-react";

interface VisitBankProps {
  currentPeriod: number;
  generatedVisits: GeneratedVisit[];
  onDragStart: (item: DraggedItem) => void;
  onDragEnd: () => void;
  onDownloadPDF: () => void;
}

export function VisitBank({ 
  currentPeriod, 
  generatedVisits,
  onDragStart, 
  onDragEnd,
  onDownloadPDF
}: VisitBankProps) {
  const staticVisits = generatedVisits.filter(visit => visit.frequency === 'per-garden');
  const restaurantVisits = generatedVisits.filter(visit => visit.frequency === 'per-restaurant');



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-cava-primary">Visit Bank</CardTitle>
          <Button
            onClick={onDownloadPDF}
            className="bg-cava-primary hover:bg-cava-primary/90 text-white font-semibold"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Calendar (PDF)
          </Button>
        </div>
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
                key={visit.id}
                visitType={visit.visitType}
                name={visit.name}
                hours={visit.hours}
                color={visit.color}
                textColor={visit.textColor}
                isStatic={true}
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
            {restaurantVisits.map((visit) => (
              <VisitTile
                key={visit.id}
                visitType={visit.visitType}
                name={visit.name}
                hours={visit.hours}
                color={visit.color}
                textColor={visit.textColor}
                isStatic={false}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}
