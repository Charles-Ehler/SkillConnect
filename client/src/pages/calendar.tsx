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

export default function CalendarPage() {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  const [userName, setUserName] = useState('');
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
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
  };

  const handleGenerateVisits = () => {
    setVisitsGenerated(true);
    toast({
      title: "Visits Generated",
      description: "Visit tiles are now available in the Visit Bank for drag and drop scheduling.",
    });
  };

  const handleDropVisit = (visit: ScheduledVisit) => {
    const visitType = getVisitTypeByKey(visit.visitType);
    const enhancedVisit = {
      ...visit,
      name: visitType?.name || visit.visitType,
      color: visitType?.color || '#009ef4',
      textColor: visitType?.textColor || 'white'
    };

    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: [...(prev[currentPeriod.toString()] || []), enhancedVisit]
    }));
  };

  const handleRemoveVisit = (visitId: string) => {
    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: (prev[currentPeriod.toString()] || []).filter(v => v.id !== visitId)
    }));
  };

  const handleResetCalendar = () => {
    setScheduleData(prev => ({
      ...prev,
      [currentPeriod.toString()]: []
    }));
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
          
          {visitsGenerated && (
            <VisitBank
              currentPeriod={currentPeriod}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onResetCalendar={handleResetCalendar}
            />
          )}
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
