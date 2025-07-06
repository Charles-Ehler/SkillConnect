import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calendarSessions = pgTable("calendar_sessions", {
  id: serial("id").primaryKey(),
  userName: text("user_name").notNull(),
  restaurants: jsonb("restaurants").notNull().$type<string[]>(),
  scheduleData: jsonb("schedule_data").notNull().$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visitTypes = pgTable("visit_types", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  hours: integer("hours").notNull(),
  color: text("color").notNull(),
  textColor: text("text_color").notNull(),
  periods: jsonb("periods").notNull().$type<number[]>(),
  isStatic: boolean("is_static").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCalendarSessionSchema = createInsertSchema(calendarSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisitTypeSchema = createInsertSchema(visitTypes).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CalendarSession = typeof calendarSessions.$inferSelect;
export type InsertCalendarSession = z.infer<typeof insertCalendarSessionSchema>;
export type VisitType = typeof visitTypes.$inferSelect;
export type InsertVisitType = z.infer<typeof insertVisitTypeSchema>;
