import jsPDF from 'jspdf';
import { ScheduledVisit, formatTimeSlot } from './calendar';
import { getPeriodById } from './periods';

export interface PDFGenerationData {
  userName: string;
  periodId: number;
  scheduleData: ScheduledVisit[];
}

export function generatePDF(data: PDFGenerationData) {
  const { userName, periodId, scheduleData } = data;
  const period = getPeriodById(periodId);
  
  if (!period) {
    throw new Error('Period not found');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Title on first page
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0); // Black for print
  doc.text(`${userName} - Period ${periodId} Schedule`, pageWidth / 2, 30, { align: 'center' });
  
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
    
    // Time slots and visits
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 6); // 6 AM to 6 PM
    const slotHeight = 15;
    
    timeSlots.forEach((hour, hourIndex) => {
      const y = currentY + 20 + hourIndex * slotHeight;
      
      // Time label
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(formatTimeSlot(hour), margin - 15, y + 5);
      
      // Check for visits in this time slot
      days.forEach((day, dayIndex) => {
        const x = margin + dayIndex * dayWidth;
        
        // Find visits for this day and time
        const dayVisits = scheduleData.filter(visit => 
          visit.week === week.num && 
          visit.day === dayIndex + 1 && 
          visit.time === hour
        );
        
        if (dayVisits.length > 0) {
          dayVisits.forEach((visit, visitIndex) => {
            const visitY = y + visitIndex * 8;
            
            // Draw visit box
            doc.setFillColor(240, 240, 240); // Light gray for print
            doc.setDrawColor(128, 128, 128);
            doc.rect(x + 2, visitY - 3, dayWidth - 4, 6, 'FD');
            
            // Visit text
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            const visitText = `${visit.visitType}${visit.restaurantName ? ` - ${visit.restaurantName}` : ''}`;
            doc.text(visitText, x + dayWidth / 2, visitY + 1, { align: 'center' });
          });
        }
        
        // Draw light grid lines
        if (hourIndex > 0) {
          doc.setDrawColor(200, 200, 200);
          doc.line(x, y, x + dayWidth, y);
        }
      });
    });
    
    // Week summary at bottom
    const weekVisits = scheduleData.filter(visit => visit.week === week.num);
    if (weekVisits.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total visits this week: ${weekVisits.length}`, margin, pageHeight - 20);
      
      // Visit types summary
      const visitTypes = weekVisits.reduce((acc, visit) => {
        acc[visit.visitType] = (acc[visit.visitType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      let summaryText = 'Visit breakdown: ';
      Object.entries(visitTypes).forEach(([type, count], index) => {
        if (index > 0) summaryText += ', ';
        summaryText += `${type} (${count})`;
      });
      
      doc.text(summaryText, margin, pageHeight - 10);
    }
  });
  
  // Save the PDF
  const fileName = `${userName}_Period_${periodId}_Schedule.pdf`;
  doc.save(fileName);
}