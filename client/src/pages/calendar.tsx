import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VisitSetup } from '@/components/VisitSetup';
import { VisitBank } from '@/components/VisitBank';
import { Calendar } from '@/components/Calendar';
import { getCurrentPeriod, getPeriodById } from '@/lib/periods';
import { ScheduledVisit, ScheduleData } from '@/lib/calendar';
import { useDragAndDrop, DraggedItem } from '@/hooks/useDragAndDrop';
import { getVisitTypeByKey } from '@/lib/visitTypes';
import { useToast } from '@/hooks/use-toast';
import { generateVisitsForPeriod, decrementVisitUsage, getAvailableVisits, GeneratedVisit, RestaurantInfo } from '@/lib/visitGeneration';
import jsPDF from 'jspdf';

export default function CalendarPage() {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  const [userName, setUserName] = useState('');
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [generatedVisitsByPeriod, setGeneratedVisitsByPeriod] = useState<{[period: number]: GeneratedVisit[]}>({});
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
  const currentPeriodVisits = generatedVisitsByPeriod[currentPeriod] || [];

  const handlePeriodChange = (period: number) => {
    setCurrentPeriod(period);
    // Generate visits for the new period if visits have been generated and this period doesn't have them yet
    if (visitsGenerated && restaurants.length > 0 && !generatedVisitsByPeriod[period]) {
      regenerateVisitsForPeriod(period);
    }
  };

  const regenerateVisitsForPeriod = (period: number) => {
    const restaurantInfo: RestaurantInfo[] = restaurants.map((name, index) => ({
      id: `rest-${index}`,
      name
    }));
    const newVisits = generateVisitsForPeriod(period, restaurantInfo);
    setGeneratedVisitsByPeriod(prev => ({
      ...prev,
      [period]: newVisits
    }));
  };

  const handleGenerateVisits = () => {
    const restaurantInfo: RestaurantInfo[] = restaurants.map((name, index) => ({
      id: `rest-${index}`,
      name
    }));
    const newVisits = generateVisitsForPeriod(currentPeriod, restaurantInfo);
    setGeneratedVisitsByPeriod(prev => ({
      ...prev,
      [currentPeriod]: newVisits
    }));
    setVisitsGenerated(true);
    toast({
      title: "Visits Generated",
      description: "Visit tiles are now available in the Visit Bank for drag and drop scheduling.",
    });
  };

  const handleDropVisit = (visit: ScheduledVisit) => {
    // Find the generated visit that was used
    const generatedVisit = currentPeriodVisits.find(gv => 
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

    // Decrement the visit usage for the current period
    setGeneratedVisitsByPeriod(prev => ({
      ...prev,
      [currentPeriod]: decrementVisitUsage(prev[currentPeriod] || [], generatedVisit.id)
    }));
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
    
    // Regenerate visits to restore all tiles for current period
    if (visitsGenerated && restaurants.length > 0) {
      regenerateVisitsForPeriod(currentPeriod);
    }
    
    toast({
      title: "Calendar Reset",
      description: `All scheduled visits for Period ${currentPeriod} have been cleared.`,
    });
  };

  const handleDownloadPDF = () => {
    if (!userName || currentPeriodSchedule.length === 0) {
      toast({
        title: "Cannot Download PDF",
        description: "Please enter your name and add some visits to the calendar first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const period = getPeriodById(currentPeriod);
      if (!period) {
        throw new Error('Period not found');
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      
      // Title on first page
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0); // Black for print
      doc.text(`${userName} - Period ${currentPeriod} Schedule`, pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`${period.name} (${period.start} - ${period.end})`, pageWidth / 2, 45, { align: 'center' });
      
      // Generate one page per week
      period.weeks.forEach((week, weekIndex) => {
        if (weekIndex > 0) {
          doc.addPage();
        }
        
        // Week header
        const yStart = weekIndex === 0 ? 70 : 30;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Week ${week.num}: ${week.start} - ${week.end}`, margin, yStart);
        
        // Days of the week
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayWidth = (pageWidth - 2 * margin) / 7;
        let currentY = yStart + 20;
        
        // Day headers
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        days.forEach((day, dayIndex) => {
          const x = margin + dayIndex * dayWidth;
          doc.text(day, x + dayWidth / 2, currentY, { align: 'center' });
          
          // Draw vertical line between days
          if (dayIndex < days.length - 1) {
            doc.setDrawColor(128, 128, 128); // Gray
            doc.line(x + dayWidth, currentY - 10, x + dayWidth, pageHeight - 40);
          }
        });
        
        // Draw horizontal line under day headers
        doc.setDrawColor(128, 128, 128);
        doc.line(margin, currentY + 5, pageWidth - margin, currentY + 5);
        
        // Create full calendar grid with time slots
        const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM
        const slotHeight = 12;
        const startY = currentY + 20;
        
        // Draw grid background
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        
        // Vertical lines for days
        for (let dayIndex = 0; dayIndex <= 7; dayIndex++) {
          const x = margin + dayIndex * dayWidth;
          doc.line(x, startY, x, startY + timeSlots.length * slotHeight);
        }
        
        // Horizontal lines for time slots
        for (let hourIndex = 0; hourIndex <= timeSlots.length; hourIndex++) {
          const y = startY + hourIndex * slotHeight;
          doc.line(margin, y, pageWidth - margin, y);
        }
        
        // Time labels and visit blocks
        timeSlots.forEach((hour, hourIndex) => {
          const y = startY + hourIndex * slotHeight;
          
          // Time label
          doc.setFontSize(7);
          doc.setTextColor(60, 60, 60);
          const timeStr = hour === 12 ? '12PM' : 
                         hour > 12 ? `${hour - 12}PM` : 
                         hour === 0 ? '12AM' : `${hour}AM`;
          doc.text(timeStr, margin - 20, y + 7);
          
          // Check for visits in each day
          days.forEach((day, dayIndex) => {
            const x = margin + dayIndex * dayWidth;
            
            // Find visits for this day and time
            const dayVisits = currentPeriodSchedule.filter(visit => 
              visit.week === week.num && 
              visit.day === dayIndex + 1 && 
              visit.time === hour
            );
            
            if (dayVisits.length > 0) {
              dayVisits.forEach((visit, visitIndex) => {
                // Calculate visit block height based on duration
                const visitHeight = (visit.hours || 1) * slotHeight - 2;
                const visitY = y + 1 + (visitIndex * 2);
                
                // Draw visit block with darker fill
                doc.setFillColor(180, 180, 180); // Darker gray for visibility
                doc.setDrawColor(100, 100, 100);
                doc.setLineWidth(1);
                doc.rect(x + 1, visitY, dayWidth - 2, visitHeight, 'FD');
                
                // Visit type (abbreviated for space)
                doc.setFontSize(6);
                doc.setTextColor(0, 0, 0);
                const visitType = visit.visitType === 'Quality Restaurant Audit' ? 'QRA' :
                                visit.visitType === 'Coaching Visit' ? 'Coaching' :
                                visit.visitType === 'Cash Audit' ? 'Cash' :
                                visit.visitType === 'GM Impact Plan Conversation' ? 'GM Impact' :
                                visit.visitType === 'Guest Experience Night/Weekend' ? 'Guest Exp' :
                                visit.visitType;
                
                doc.text(visitType, x + dayWidth / 2, visitY + 6, { align: 'center' });
                
                // Restaurant name (if space allows)
                if (visit.restaurantName && visitHeight >= 8) {
                  doc.setFontSize(5);
                  doc.setTextColor(40, 40, 40);
                  doc.text(visit.restaurantName, x + dayWidth / 2, visitY + 10, { align: 'center' });
                }
                
                // Time indicator
                if (visitHeight >= 12) {
                  doc.setFontSize(5);
                  doc.setTextColor(80, 80, 80);
                  const timeLabel = `${visit.hours || 1}h`;
                  doc.text(timeLabel, x + dayWidth / 2, visitY + visitHeight - 2, { align: 'center' });
                }
              });
            }
          });
        });
        
        // Add legend at bottom of each page
        const legendY = pageHeight - 40;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('Legend:', margin, legendY);
        
        const legendItems = [
          { abbr: 'QRA', full: 'Quality Restaurant Audit (5h)' },
          { abbr: 'Coaching', full: 'Coaching Visit (2h)' },
          { abbr: 'Cash', full: 'Cash Audit (1h)' },
          { abbr: 'GM Impact', full: 'GM Impact Plan Conversation (1h)' },
          { abbr: 'Guest Exp', full: 'Guest Experience Night/Weekend (2h)' }
        ];
        
        legendItems.forEach((item, index) => {
          const x = margin + (index % 2) * (pageWidth / 2 - margin);
          const y = legendY + 8 + Math.floor(index / 2) * 8;
          doc.setFontSize(7);
          doc.text(`${item.abbr}: ${item.full}`, x, y);
        });

        // Week summary
        const weekVisits = currentPeriodSchedule.filter(visit => visit.week === week.num);
        if (weekVisits.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(`Total visits this week: ${weekVisits.length}`, margin, pageHeight - 15);
          
          // Visit types summary
          const visitTypes = weekVisits.reduce((acc, visit) => {
            acc[visit.visitType] = (acc[visit.visitType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          let summaryText = 'Types: ';
          Object.entries(visitTypes).forEach(([type, count], index) => {
            if (index > 0) summaryText += ', ';
            const abbr = type === 'Quality Restaurant Audit' ? 'QRA' :
                        type === 'Coaching Visit' ? 'Coaching' :
                        type === 'Cash Audit' ? 'Cash' :
                        type === 'GM Impact Plan Conversation' ? 'GM Impact' :
                        type === 'Guest Experience Night/Weekend' ? 'Guest Exp' :
                        type;
            summaryText += `${abbr}(${count})`;
          });
          
          doc.text(summaryText, margin, pageHeight - 8);
        }
      });
      
      // Save the PDF
      const fileName = `${userName}_Period_${currentPeriod}_Schedule.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: `Calendar for ${userName} - Period ${currentPeriod} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    }
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
          {/* Collapsible Visit Setup */}
          <div className={`transition-all duration-300 ${visitsGenerated ? 'mb-2' : 'mb-4'}`}>
            {visitsGenerated ? (
              <div className="bg-[#ffeab6] border border-[#009ef4] rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Setup: {userName} • {restaurants.length} restaurants
                  </div>
                  <button
                    onClick={() => {
                      setVisitsGenerated(false);
                      setGeneratedVisitsByPeriod({});
                      setScheduleData({});
                    }}
                    className="text-xs text-[#009ef4] hover:underline"
                  >
                    Edit Setup
                  </button>
                </div>
                {/* PDF Download Button */}
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-[#009ef4] hover:bg-[#009ef4]/90 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Calendar (PDF)
                </button>
              </div>
            ) : (
              <VisitSetup
                userName={userName}
                restaurants={restaurants}
                onUserNameChange={setUserName}
                onRestaurantsChange={setRestaurants}
                onGenerateVisits={handleGenerateVisits}
              />
            )}
          </div>
          
          {/* Sticky Visit Bank */}
          <div className="sticky top-4">
            {visitsGenerated && (
              <VisitBank
                currentPeriod={currentPeriod}
                generatedVisits={getAvailableVisits(currentPeriodVisits)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onResetCalendar={handleResetCalendar}
                onDownloadPDF={handleDownloadPDF}
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
