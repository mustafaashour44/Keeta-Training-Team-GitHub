import { createInsertSchema } from "drizzle-zod";
import { date, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const trainersTable = pgTable("keeta_trainers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  role: text("role").notNull().default("Full Knowledge Trainer"),
});

export const agentsTable = pgTable("keeta_agents", {
  id: serial("id").primaryKey(),
  hrId: text("hr_id").notNull().unique(),
  mis: text("mis").notNull(),
  name: text("name").notNull(),
  lob: text("lob").notNull(),
  employmentStatus: text("employment_status").notNull().default("Active"),
  dateAdded: date("date_added", { mode: "string" }).notNull(),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  misIdx: index("keeta_agents_mis_idx").on(table.mis),
}));

export const activitiesTable = pgTable("keeta_training_activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  scope: text("scope").array().notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("Draft"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const activityRequiredAgentsTable = pgTable("keeta_activity_required_agents", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activitiesTable.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
});

export const sessionsTable = pgTable("keeta_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  activityId: integer("activity_id").notNull().references(() => activitiesTable.id, { onDelete: "cascade" }),
  sessionDate: date("session_date", { mode: "string" }).notNull(),
  trainerId: integer("trainer_id").notNull().references(() => trainersTable.id),
  lob: text("lob").notNull(),
  type: text("type").notNull(),
  topic: text("topic"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  status: text("status").notNull().default("Planned"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const attendanceTable = pgTable("keeta_session_attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("Attended"),
  result: integer("result"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const updatesTable = pgTable("keeta_training_updates", {
  id: serial("id").primaryKey(),
  updateId: text("update_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  scope: text("scope").array().notNull(),
  releaseDate: date("release_date", { mode: "string" }).notNull(),
  deadline: date("deadline", { mode: "string" }),
  status: text("status").notNull().default("Open"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const updateActivitiesTable = pgTable("keeta_update_activities", {
  id: serial("id").primaryKey(),
  updateId: integer("update_id").notNull().references(() => updatesTable.id, { onDelete: "cascade" }),
  activityId: integer("activity_id").notNull().references(() => activitiesTable.id, { onDelete: "cascade" }),
});

export const headCountSnapshotsTable = pgTable("keeta_head_count_snapshots", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  lob: text("lob").notNull(),
  active: integer("active").notNull(),
  inactive: integer("inactive").notNull(),
  transferred: integer("transferred").notNull(),
  onLeave: integer("on_leave").notNull(),
  total: integer("total").notNull(),
});

export const activityLogsTable = pgTable("keeta_activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  relatedRecord: text("related_record"),
  trainer: text("trainer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTrainerSchema = createInsertSchema(trainersTable).omit({ id: true });
export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true, updatedAt: true, archivedAt: true });
export const insertActivitySchema = createInsertSchema(activitiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUpdateSchema = createInsertSchema(updatesTable).omit({ id: true, createdAt: true, updatedAt: true });

export type Trainer = typeof trainersTable.$inferSelect;
export type Agent = typeof agentsTable.$inferSelect;
export type Activity = typeof activitiesTable.$inferSelect;
export type TrainingSession = typeof sessionsTable.$inferSelect;
export type Attendance = typeof attendanceTable.$inferSelect;
export type TrainingUpdate = typeof updatesTable.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;