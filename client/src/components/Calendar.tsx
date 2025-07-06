import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPeriodById } from "@/lib/periods";
import { generateHourSlots, formatTimeSlot, canPlaceVisit, getVisitAtPosition, ScheduledVisit } from "@/lib/calendar";
import { DraggedItem } from "@/hooks/useDragAndDrop";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

interface CalendarProps {
  currentPeriod: number;
  userName: string;
  scheduleData: ScheduledVisit[];
  draggedItem: DraggedItem | null;
  dragOverTarget: string | null;
  onDrop: (visit: ScheduledVisit) => void;
  onRemoveVisit: (visitId: string) => void;
  onDragOver: (targetId: string) => void;
  onDragLeave: () => void;
}

export function Calendar({ 
  currentPeriod, 
  userName, 
  scheduleData, 
  draggedItem,
  dragOverTarget,
  onDrop,
  onRemoveVisit,
  onDragOver,
  onDragLeave
}: CalendarProps) {
  const period = getPeriodById(currentPeriod);
  const hourSlots = generateHourSlots();

  if (!period) {
    return <div>Period not found</div>;
  }

  const handleDragOver = (e: React.DragEvent, week: number, day: number, time: number) => {
    e.preventDefault();
    const targetId = `${week}-${day}-${time}`;
    onDragOver(targetId);
  };

  const handleDragLeave = () => {
    onDragLeave();
  };

  const handleDrop = (e: React.DragEvent, week: number, day: number, time: number) => {
    e.preventDefault();
    onDragLeave();
    
    if (!draggedItem) return;

    // Check if visit can be placed
    if (!canPlaceVisit(scheduleData, week, day, time, draggedItem.hours)) {
      alert('Cannot place visit here - time slot is occupied');
      return;
    }

    const visit: ScheduledVisit = {
      id: nanoid(),
      visitType: draggedItem.visitType,
      week,
      day,
      time,
      hours: draggedItem.hours
    };

    onDrop(visit);
  };

  const handleVisitClick = (visit: ScheduledVisit) => {
    if (confirm('Remove this visit?')) {
      onRemoveVisit(visit.id);
    }
  };

  const isDropTarget = (week: number, day: number, time: number) => {
    return dragOverTarget === `${week}-${day}-${time}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-cava-primary">
          {period.name} Calendar
        </CardTitle>
        <p className="text-sm text-cava-olive">
          {period.start} - {period.end}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8" data-calendar="true">
          {period.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week-block" data-week={week.num}>
              <h3 className="text-lg font-bold mb-3">
                <span className="text-cava-primary">Week {week.num}</span> – 
                <span className="text-gray-600"> {week.start} through {week.end}</span> – 
                <span className="text-cava-fuchsia">{userName || 'User'}</span>
              </h3>
              
              <div className="calendar-grid overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-xs font-bold text-left w-20 bg-gray-50">Time</th>
                      {week.dates.map((date, dayIndex) => (
                        <th key={dayIndex} className="border border-gray-300 p-2 text-xs font-bold text-center bg-gray-50">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]}
                          <br />
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hourSlots.map((hour) => (
                      <tr key={hour}>
                        <td className="border border-gray-300 p-1 text-xs bg-gray-50 sticky left-0 z-10">
                          {formatTimeSlot(hour)}
                        </td>
                        {week.dates.map((_, dayIndex) => {
                          const cellId = `${weekIndex}-${dayIndex}-${hour}`;
                          const existingVisit = getVisitAtPosition(scheduleData, weekIndex, dayIndex, hour);
                          const isFirstCell = existingVisit && existingVisit.time === hour;
                          
                          return (
                            <td
                              key={dayIndex}
                              className={cn(
                                "calendar-cell drop-zone",
                                isDropTarget(weekIndex, dayIndex, hour) && "drag-over"
                              )}
                              onDragOver={(e) => handleDragOver(e, weekIndex, dayIndex, hour)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, weekIndex, dayIndex, hour)}
                            >
                              {existingVisit && isFirstCell && (
                                <div
                                  className="placed-tile"
                                  style={{
                                    backgroundColor: existingVisit.color || '#009ef4',
                                    color: existingVisit.textColor || 'white',
                                    height: `${existingVisit.hours * 60}px`,
                                    top: '0',
                                    fontSize: '11px',
                                    lineHeight: '1.1',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    overflow: 'hidden'
                                  }}
                                  onClick={() => handleVisitClick(existingVisit)}
                                >
                                  <div>
                                    {existingVisit.name || existingVisit.visitType}
                                    <br />
                                    <small>
                                      {formatTimeSlot(existingVisit.time)} - {formatTimeSlot(existingVisit.time + existingVisit.hours)}
                                    </small>
                                    <br />
                                    <small>({existingVisit.hours}h)</small>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
