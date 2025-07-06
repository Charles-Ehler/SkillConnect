export interface VisitTypeConfig {
  key: string;
  name: string;
  hours: number;
  color: string;
  textColor: string;
  periods: number[];
  isStatic: boolean;
}

export const visitTypeConfigs: VisitTypeConfig[] = [
  {
    key: 'qra',
    name: 'Quality Restaurant Audit (QRA)',
    hours: 5,
    color: '#009ef4',
    textColor: 'white',
    periods: [1, 5, 8, 11],
    isStatic: false
  },
  {
    key: 'coaching',
    name: 'Coaching Visit',
    hours: 2,
    color: '#959502',
    textColor: 'white',
    periods: [2, 3, 4, 6, 7, 9, 10, 12, 13],
    isStatic: false
  },
  {
    key: 'cash-audit',
    name: 'Cash Audit',
    hours: 1,
    color: '#bcdaff',
    textColor: 'black',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false
  },
  {
    key: 'gm-impact',
    name: 'GM Impact Plan Conversation',
    hours: 1,
    color: '#ff9d00',
    textColor: 'white',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false
  },
  {
    key: 'guest-experience',
    name: 'Guest Experience Night/Weekend',
    hours: 1.5,
    color: '#da3d9d',
    textColor: 'white',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: false
  },
  {
    key: 'station-training',
    name: 'Station Training Workshop',
    hours: 2,
    color: '#ff4c0a',
    textColor: 'white',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: true
  },
  {
    key: 'competency-champion',
    name: 'Competency Champion Training',
    hours: 1,
    color: '#e8b2ee',
    textColor: 'black',
    periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isStatic: true
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
