export interface ScheduledVisit {
  id: string;
  visitType: string;
  week: number;
  day: number;
  time: number;
  hours: number;
  restaurantName?: string;
}

export interface ScheduleData {
  [periodId: string]: ScheduledVisit[];
}

export function generateHourSlots(): number[] {
  return Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
}

export function formatTimeSlot(hour: number): string {
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

export function canPlaceVisit(
  scheduleData: ScheduledVisit[],
  week: number,
  day: number,
  time: number,
  hours: number
): boolean {
  const endTime = time + hours;
  
  return !scheduleData.some(visit => {
    if (visit.week !== week || visit.day !== day) return false;
    
    const visitEnd = visit.time + visit.hours;
    return (
      (time >= visit.time && time < visitEnd) ||
      (endTime > visit.time && endTime <= visitEnd) ||
      (time < visit.time && endTime > visitEnd)
    );
  });
}

export function getVisitAtPosition(
  scheduleData: ScheduledVisit[],
  week: number,
  day: number,
  time: number
): ScheduledVisit | undefined {
  return scheduleData.find(visit => {
    if (visit.week !== week || visit.day !== day) return false;
    const visitEnd = visit.time + visit.hours;
    return time >= visit.time && time < visitEnd;
  });
}

export function removeVisit(
  scheduleData: ScheduledVisit[],
  visitId: string
): ScheduledVisit[] {
  return scheduleData.filter(visit => visit.id !== visitId);
}

export function addVisit(
  scheduleData: ScheduledVisit[],
  visit: ScheduledVisit
): ScheduledVisit[] {
  return [...scheduleData, visit];
}
