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
import html2canvas from 'html2canvas';

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

  const handleDownloadPDF = async () => {
    if (!userName) {
      toast({
        title: "Cannot Download PDF",
        description: "Please enter your name first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const period = getPeriodById(currentPeriod);
      if (!period) {
        throw new Error('Period not found');
      }

      toast({
        title: "Generating PDF",
        description: "Capturing calendar weeks...",
      });

      const doc = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Title page
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(`${userName} - Period ${currentPeriod} Schedule`, pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(`${period.name} (${period.start} - ${period.end})`, pageWidth / 2, 55, { align: 'center' });

      // Find the calendar element
      const calendarElement = document.querySelector('[data-calendar="true"]') as HTMLElement;
      
      if (!calendarElement) {
        throw new Error('Calendar not found');
      }

      // Capture each week
      for (let weekIndex = 0; weekIndex < period.weeks.length; weekIndex++) {
        if (weekIndex > 0) {
          doc.addPage();
        }

        // Week header - smaller to save space
        const week = period.weeks[weekIndex];
        const yStart = weekIndex === 0 ? 70 : 15;
        
        doc.setFontSize(14);
        doc.text(`Week ${week.num}: ${week.start} - ${week.end}`, 20, yStart);

        // Find the specific week element
        const weekElement = document.querySelector(`[data-week="${week.num}"]`) as HTMLElement;
        
        if (weekElement) {
          try {
            // Temporarily make the element visible and styled for print
            const originalStyle = weekElement.style.cssText;
            weekElement.style.backgroundColor = 'white';
            weekElement.style.color = 'black';
            
            // Capture the week as an image with higher quality
            const canvas = await html2canvas(weekElement, {
              backgroundColor: 'white',
              scale: 3, // Higher quality
              useCORS: true,
              allowTaint: true
            });
            
            // Restore original styling
            weekElement.style.cssText = originalStyle;
            
            // Add the image to PDF - make it larger
            const imgData = canvas.toDataURL('image/png');
            const margin = 10; // Smaller margins
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - yStart - 15; // Maximum space for calendar
            
            // Calculate size to fill most of the page while maintaining aspect ratio
            const aspectRatio = canvas.width / canvas.height;
            let finalWidth = maxWidth;
            let finalHeight = finalWidth / aspectRatio;
            
            // If height is too big, scale by height instead
            if (finalHeight > maxHeight) {
              finalHeight = maxHeight;
              finalWidth = finalHeight * aspectRatio;
            }
            
            // Center the image horizontally
            const xPosition = (pageWidth - finalWidth) / 2;
            
            doc.addImage(imgData, 'PNG', xPosition, yStart + 10, finalWidth, finalHeight);
            
          } catch (error) {
            console.error('Error capturing week:', error);
            // Fallback: just add week info
            doc.setFontSize(12);
            doc.text('Week content could not be captured', 20, yStart + 30);
          }
        } else {
          // Fallback: add basic week info
          doc.setFontSize(12);
          doc.text(`Week ${week.num} calendar view not available`, 20, yStart + 30);
        }

        // Add visit summary for this week
        const weekVisits = currentPeriodSchedule.filter(visit => visit.week === week.num);
        if (weekVisits.length > 0) {
          doc.setFontSize(10);
          doc.text(`Total visits: ${weekVisits.length}`, 20, pageHeight - 15);
          
          const visitTypes = weekVisits.reduce((acc, visit) => {
            acc[visit.visitType] = (acc[visit.visitType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          let summaryText = 'Types: ';
          Object.entries(visitTypes).forEach(([type, count], index) => {
            if (index > 0) summaryText += ', ';
            summaryText += `${type} (${count})`;
          });
          
          doc.text(summaryText, 20, pageHeight - 8);
        }
      }
      
      // Save the PDF
      const fileName = `${userName}_Period_${currentPeriod}_Schedule.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: `Calendar for ${userName} - Period ${currentPeriod} has been downloaded.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
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
