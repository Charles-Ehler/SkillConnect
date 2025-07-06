import { visitTypeConfigs } from './visitTypes';

export interface GeneratedVisit {
  id: string;
  visitType: string;
  name: string;
  hours: number;
  color: string;
  textColor: string;
  restaurantName?: string;
  location: string;
  frequency: 'per-restaurant' | 'per-garden';
  remaining: number;
  total: number;
}

export interface RestaurantInfo {
  id: string;
  name: string;
}

const QRA_PERIODS = [1, 5, 8, 11];
const STANDARD_PERIODS = [2, 3, 4, 6, 7, 9, 10, 12, 13];

export function generateVisitsForPeriod(period: number, restaurants: RestaurantInfo[]): GeneratedVisit[] {
  const visits: GeneratedVisit[] = [];
  const isQraPeriod = QRA_PERIODS.includes(period);
  const isStandardPeriod = STANDARD_PERIODS.includes(period);

  // Generate per-restaurant visits
  restaurants.forEach((restaurant, index) => {
    const restaurantId = `rest-${index}`;
    
    // QRA visits for QRA periods only
    if (isQraPeriod) {
      const qraConfig = visitTypeConfigs.find(v => v.key === 'qra');
      if (qraConfig) {
        visits.push({
          id: `qra-${restaurantId}`,
          visitType: qraConfig.key,
          name: `${qraConfig.name} - ${restaurant.name} (${qraConfig.hours}h)`,
          hours: qraConfig.hours,
          color: qraConfig.color,
          textColor: qraConfig.textColor,
          restaurantName: restaurant.name,
          location: restaurant.name,
          frequency: 'per-restaurant',
          remaining: 1,
          total: 1
        });
      }
    }

    // Coaching visits for standard periods only
    if (isStandardPeriod) {
      const coachingConfig = visitTypeConfigs.find(v => v.key === 'coaching');
      if (coachingConfig) {
        visits.push({
          id: `coaching-${restaurantId}`,
          visitType: coachingConfig.key,
          name: `${coachingConfig.name} - ${restaurant.name} (${coachingConfig.hours}h)`,
          hours: coachingConfig.hours,
          color: coachingConfig.color,
          textColor: coachingConfig.textColor,
          restaurantName: restaurant.name,
          location: restaurant.name,
          frequency: 'per-restaurant',
          remaining: 1,
          total: 1
        });
      }
    }

    // Universal visits for all periods
    const universalVisitTypes = ['guest-experience', 'cash-audit', 'gm-impact'];
    universalVisitTypes.forEach(visitKey => {
      const config = visitTypeConfigs.find(v => v.key === visitKey);
      if (config) {
        visits.push({
          id: `${visitKey}-${restaurantId}`,
          visitType: config.key,
          name: `${config.name} - ${restaurant.name} (${config.hours}h)`,
          hours: config.hours,
          color: config.color,
          textColor: config.textColor,
          restaurantName: restaurant.name,
          location: restaurant.name,
          frequency: 'per-restaurant',
          remaining: 1,
          total: 1
        });
      }
    });
  });

  // Generate per-garden visits (once per period)
  const perGardenVisitTypes = ['station-training', 'competency-champion'];
  perGardenVisitTypes.forEach(visitKey => {
    const config = visitTypeConfigs.find(v => v.key === visitKey);
    if (config) {
      visits.push({
        id: `${visitKey}-garden`,
        visitType: config.key,
        name: `${config.name} (${config.hours}h)`,
        hours: config.hours,
        color: config.color,
        textColor: config.textColor,
        location: 'Per Garden',
        frequency: 'per-garden',
        remaining: 1,
        total: 1
      });
    }
  });

  return visits;
}

export function decrementVisitUsage(visits: GeneratedVisit[], visitId: string): GeneratedVisit[] {
  return visits.map(visit => {
    if (visit.id === visitId && visit.remaining > 0) {
      return {
        ...visit,
        remaining: visit.remaining - 1
      };
    }
    return visit;
  });
}

export function getAvailableVisits(visits: GeneratedVisit[]): GeneratedVisit[] {
  return visits.filter(visit => visit.remaining > 0);
}