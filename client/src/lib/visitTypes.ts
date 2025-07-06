export interface VisitTypeConfig {
  key: string;
  name: string;
  hours: number;
  color: string;
  textColor: string;
  periods: number[];
  isStatic: boolean;
  frequency: 'per-restaurant' | 'per-garden';
  applicability: 'qra-periods' | 'standard-periods' | 'all-periods';
}

export const visitTypeConfigs: VisitTypeConfig[] = [
  {
    key: 'qra',
    name: 'QRA',
    hours: 5,
    color: '#009ef4',
    textColor: 'white',
    periods: [1, 5, 8, 11],
    isStatic: false,
    frequency: 'per-restaurant',
    applicability: 'qra-periods'
  },
  {
    key: 'coaching',
    name: 'Coaching Visit',
    hours: 2,
    color: '#e8b2ee',
    textColor: 'black',
    periods: [2, 3, 4, 6, 7, 9, 10, 12, 13],
    isStatic: false,
    frequency: 'per-restaurant',
    applicability: 'standard-periods'
  },
  {
    key: 'cash-audit',
    name: 'Cash Audit',
    hours: 1,
    color: '#80ceff',
    textColor: 'black',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false,
    frequency: 'per-restaurant',
    applicability: 'all-periods'
  },
  {
    key: 'gm-impact',
    name: 'GM Impact',
    hours: 1,
    color: '#da3d9d',
    textColor: 'white',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false,
    frequency: 'per-restaurant',
    applicability: 'all-periods'
  },
  {
    key: 'guest-experience',
    name: 'Guest Experience',
    hours: 1.5,
    color: '#f9d000',
    textColor: 'black',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false,
    frequency: 'per-restaurant',
    applicability: 'all-periods'
  },
  {
    key: 'station-training',
    name: 'Station Training Workshop',
    hours: 2,
    color: '#959502',
    textColor: 'white',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: true,
    frequency: 'per-garden',
    applicability: 'all-periods'
  },
  {
    key: 'competency-champion',
    name: 'Competency Champion',
    hours: 1,
    color: '#bcdaff',
    textColor: 'black',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: true,
    frequency: 'per-garden',
    applicability: 'all-periods'
  }
];

export function getVisitTypesForPeriod(periodId: number): VisitTypeConfig[] {
  return visitTypeConfigs.filter(vt => vt.periods.includes(periodId));
}

export function getStaticVisitTypes(): VisitTypeConfig[] {
  return visitTypeConfigs.filter(vt => vt.isStatic);
}

export function getVisitTypeByKey(key: string): VisitTypeConfig | undefined {
  return visitTypeConfigs.find(vt => vt.key === key);
}
