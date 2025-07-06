import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VisitSetup } from '@/components/VisitSetup';
import { VisitBank } from '@/components/VisitBank';
import { Calendar } from '@/components/Calendar';
import { getCurrentPeriod } from '@/lib/periods';
import { ScheduledVisit, ScheduleData } from '@/lib/calendar';
import { useDragAndDrop, DraggedItem } from '@/hooks/useDragAndDrop';
import { getVisitTypeByKey } from '@/lib/visitTypes';
import { useToast } from '@/hooks/use-toast';
import { generateVisitsForPeriod, decrementVisitUsage, getAvailableVisits, GeneratedVisit, RestaurantInfo } from '@/lib/visitGeneration';

export default function CalendarPage() {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  const [userName, setUserName] = useState('');
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [generatedVisits, setGeneratedVisits] = useState<GeneratedVisit[]>([]);
  const [visitsGenerated, setVisitsGenerated] = useState(false);
  
  const { toast } = useToast();
  
  const {
    draggedItem,
    dragOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave
  } = useDragAndDrop();

  const currentPeriodSchedule = scheduleData[currentPeriod.toString()] || [];

  const handlePeriodChange = (period: number) => {
    setCurrentPeriod(period);
    // Regenerate visits for the new period if visits have been generated
    if (visitsGenerated && restaurants.length > 0) {
      regenerateVisitsForPeriod(period);
    }
  };

  const regenerateVisitsForPeriod = (period: number) => {
    const restaurantInfo: RestaurantInfo[] = restaurants.map((name, index) => ({
      id: `rest-${index}`,
      name
    }));
    const newVisits = generateVisitsForPeriod(period, restaurantInfo);
    setGeneratedVisits(newVisits);
  };

  const handleGenerateVisits = () => {
    const restaurantInfo: RestaurantInfo[] = restaurants.map((name, index) => ({
      id: `rest-${index}`,
      name
    }));
    const newVisits = generateVisitsForPeriod(currentPeriod, restaurantInfo);
    setGeneratedVisits(newVisits);
    setVisitsGenerated(true);
    toast({
      title: "Visits Generated",
      description: "Visit tiles are now available in the Visit Bank for drag and drop scheduling.",
    });
  };

  const handleDropVisit = (visit: ScheduledVisit) => {
    // Find the generated visit that was used
    const generatedVisit = generatedVisits.find(gv => 
      gv.visitType === visit.visitType && 
      gv.remaining > 0 &&
      (draggedItem?.name === gv.name || draggedItem?.name?.includes(gv.name))
    );

    if (!generatedVisit) {
      toast({
        title: "Error",
        description: "Visit not found or no longer available.",
        variant: "destructive"
      });
      return;
    }

    const enhancedVisit = {
      ...visit,
      name: generatedVisit.name,
      color: generatedVisit.color,
      textColor: generatedVisit.textColor,
      restaurantName: generatedVisit.restaurantName
    };

    // Add to schedule
    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: [...(prev[currentPeriod.toString()] || []), enhancedVisit]
    }));

    // Decrement the visit usage
    setGeneratedVisits(prev => decrementVisitUsage(prev, generatedVisit.id));
  };

  const handleRemoveVisit = (visitId: string) => {
    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: (prev[currentPeriod.toString()] || []).filter(v => v.id !== visitId)
    }));
  };

  const handleResetCalendar = () => {
    // Reset calendar and regenerate visits
    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: []
    }));
    
    // Regenerate visits to restore all tiles
    if (visitsGenerated && restaurants.length > 0) {
      regenerateVisitsForPeriod(currentPeriod);
    }
    
    toast({
      title: "Calendar Reset",
      description: `All scheduled visits for Period ${currentPeriod} have been cleared.`,
    });
  };

  return (
    <div className="min-h-screen cava-bg">
      <Header 
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
      />
      
      <div className="flex gap-6 px-6 pb-6">
        {/* Left Column - Visit Setup and Bank (1/3 width) */}
        <div className="w-1/3">
          <VisitSetup
            userName={userName}
            restaurants={restaurants}
            onUserNameChange={setUserName}
            onRestaurantsChange={setRestaurants}
            onGenerateVisits={handleGenerateVisits}
          />
          
          {/* Sticky Visit Bank */}
          <div className="sticky top-4">
            {visitsGenerated && (
              <VisitBank
                currentPeriod={currentPeriod}
                generatedVisits={getAvailableVisits(generatedVisits)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onResetCalendar={handleResetCalendar}
              />
            )}
          </div>
        </div>

        {/* Right Column - Calendar (2/3 width) */}
        <div className="w-2/3">
          <Calendar
            currentPeriod={currentPeriod}
            userName={userName}
            scheduleData={currentPeriodSchedule}
            draggedItem={draggedItem}
            dragOverTarget={dragOverTarget}
            onDrop={handleDropVisit}
            onRemoveVisit={handleRemoveVisit}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          />
        </div>
      </div>
    </div>
  );
}
