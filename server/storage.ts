import { users, calendarSessions, visitTypes, type User, type InsertUser, type CalendarSession, type InsertCalendarSession, type VisitType, type InsertVisitType } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCalendarSession(userName: string): Promise<CalendarSession | undefined>;
  saveCalendarSession(session: InsertCalendarSession): Promise<CalendarSession>;
  updateCalendarSession(userName: string, session: Partial<InsertCalendarSession>): Promise<CalendarSession>;
  
  getVisitTypes(): Promise<VisitType[]>;
  createVisitType(visitType: InsertVisitType): Promise<VisitType>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calendarSessions: Map<string, CalendarSession>;
  private visitTypesMap: Map<string, VisitType>;
  private currentId: number;
  private currentSessionId: number;
  private currentVisitTypeId: number;

  constructor() {
    this.users = new Map();
    this.calendarSessions = new Map();
    this.visitTypesMap = new Map();
    this.currentId = 1;
    this.currentSessionId = 1;
    this.currentVisitTypeId = 1;
    this.initializeVisitTypes();
  }

  private initializeVisitTypes() {
    const visitTypes = [
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

    visitTypes.forEach(vt => {
      const visitType: VisitType = {
        id: this.currentVisitTypeId++,
        ...vt
      };
      this.visitTypesMap.set(vt.key, visitType);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCalendarSession(userName: string): Promise<CalendarSession | undefined> {
    return this.calendarSessions.get(userName);
  }

  async saveCalendarSession(session: InsertCalendarSession): Promise<CalendarSession> {
    const calendarSession: CalendarSession = {
      id: this.currentSessionId++,
      ...session,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.calendarSessions.set(session.userName, calendarSession);
    return calendarSession;
  }

  async updateCalendarSession(userName: string, session: Partial<InsertCalendarSession>): Promise<CalendarSession> {
    const existing = this.calendarSessions.get(userName);
    if (!existing) {
      throw new Error('Calendar session not found');
    }
    
    const updated: CalendarSession = {
      ...existing,
      ...session,
      updatedAt: new Date()
    };
    this.calendarSessions.set(userName, updated);
    return updated;
  }

  async getVisitTypes(): Promise<VisitType[]> {
    return Array.from(this.visitTypesMap.values());
  }

  async createVisitType(visitType: InsertVisitType): Promise<VisitType> {
    const vt: VisitType = {
      id: this.currentVisitTypeId++,
      ...visitType
    };
    this.visitTypesMap.set(visitType.key, vt);
    return vt;
  }
}

export const storage = new MemStorage();
