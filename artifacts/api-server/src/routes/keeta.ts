import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  activityLogsTable,
  activityRequiredAgentsTable,
  activitiesTable,
  agentsTable,
  attendanceTable,
  headCountSnapshotsTable,
  sessionsTable,
  trainersTable,
  updateActivitiesTable,
  updatesTable,
} from "@workspace/db";

const router: IRouter = Router();

const LOBS = ["C-Side", "BD-Side", "DC&Calls-Side", "Kfood", "CM"] as const;
const TRAINERS = ["Mustafa", "Dina", "Asma", "Sara", "Nesreen"] as const;
const trainerSchema = z.object({ id: z.number(), name: z.string(), role: z.string() });
const activityInput = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  scope: z.array(z.enum(LOBS)).min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string().min(1),
  description: z.string().optional(),
  requiredAgentIds: z.array(z.number()).optional(),
});
const activityUpdate = activityInput.partial();
const sessionInput = z.object({
  activityId: z.number(),
  sessionDate: z.string(),
  trainerId: z.number(),
  lob: z.enum(LOBS),
  type: z.string().min(1),
  topic: z.string().optional(),
  durationMinutes: z.number().int().min(0),
  status: z.string().min(1),
  notes: z.string().optional(),
});
const sessionUpdate = sessionInput.partial().omit({ activityId: true });
const agentInput = z.object({
  hrId: z.string().min(1),
  mis: z.string().min(1),
  name: z.string().min(1),
  lob: z.enum(LOBS),
  employmentStatus: z.string().min(1),
  dateAdded: z.string().optional(),
  notes: z.string().optional(),
});
const agentUpdate = agentInput.partial().omit({ dateAdded: true });
const bulkAgentInput = z.object({ agents: z.array(agentInput).min(1) });
const bulkAgentUpdate = z.object({
  ids: z.array(z.number().int()).min(1),
  lob: z.enum(LOBS).optional(),
  employmentStatus: z.string().min(1).optional(),
});
const bulkAgentDelete = z.object({ ids: z.array(z.number().int()).min(1) });
const updateInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scope: z.array(z.enum(LOBS)).min(1),
  releaseDate: z.string(),
  deadline: z.string().optional(),
  status: z.string().min(1),
  linkedActivities: z.array(z.number()).optional(),
  notes: z.string().optional(),
});
const updatePatch = updateInput.partial();
const attendanceInput = z.array(z.object({
  agentId: z.number(),
  status: z.string().min(1),
  result: z.number().nullable().optional(),
  notes: z.string().optional(),
}));

const toTrainer = (trainer: typeof trainersTable.$inferSelect) => ({
  id: trainer.id,
  name: trainer.name,
  role: trainer.role,
});

async function ensureTrainers() {
  for (const name of TRAINERS) {
    await db.insert(trainersTable).values({ name, role: "Full Knowledge Trainer" }).onConflictDoNothing();
  }
}

async function logAction(action: string, relatedRecord: string | null, trainer: string | null = null) {
  await db.insert(activityLogsTable).values({ action, relatedRecord, trainer });
}

async function allAgents(includeArchived = false) {
  return db.select().from(agentsTable)
    .where(includeArchived ? undefined : isNull(agentsTable.archivedAt))
    .orderBy(agentsTable.name);
}

async function allActivities() {
  return db.select().from(activitiesTable).orderBy(desc(activitiesTable.startDate), activitiesTable.name);
}

async function activityCoverage(activityId: number) {
  const required = await db.select().from(activityRequiredAgentsTable).where(eq(activityRequiredAgentsTable.activityId, activityId));
  const requiredIds = required.map((row) => row.agentId);
  if (!requiredIds.length) return { requiredIds, coveredIds: new Set<number>(), records: [] as typeof attendanceTable.$inferSelect[] };
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.activityId, activityId));
  const completedSessionIds = sessions.filter((session) => session.status === "Completed").map((session) => session.id);
  if (!completedSessionIds.length) return { requiredIds, coveredIds: new Set<number>(), records: [] as typeof attendanceTable.$inferSelect[] };
  const records = await db.select().from(attendanceTable).where(and(inArray(attendanceTable.sessionId, completedSessionIds), inArray(attendanceTable.agentId, requiredIds)));
  return {
    requiredIds,
    coveredIds: new Set(records.filter((record) => record.status === "Attended").map((record) => record.agentId)),
    records,
  };
}

async function activityView(activity: typeof activitiesTable.$inferSelect) {
  const coverage = await activityCoverage(activity.id);
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.activityId, activity.id));
  const required = coverage.requiredIds.length;
  const covered = coverage.coveredIds.size;
  return {
    id: activity.id,
    name: activity.name,
    type: activity.type,
    scope: activity.scope,
    startDate: activity.startDate,
    endDate: activity.endDate,
    status: activity.status,
    description: activity.description,
    requiredAgents: required,
    coveredAgents: covered,
    pendingAgents: Math.max(required - covered, 0),
    coveragePercent: required ? Math.round((covered / required) * 100) : 0,
    sessionsCount: sessions.length,
    lastSessionDate: sessions.length ? sessions.map((s) => s.sessionDate).sort().at(-1) ?? null : null,
  };
}

async function sessionView(session: typeof sessionsTable.$inferSelect) {
  const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, session.activityId));
  const [trainer] = await db.select().from(trainersTable).where(eq(trainersTable.id, session.trainerId));
  const attendance = await db.select().from(attendanceTable).where(eq(attendanceTable.sessionId, session.id));
  return {
    id: session.id,
    sessionId: session.sessionId,
    activityId: session.activityId,
    activityName: activity?.name ?? "Unknown activity",
    sessionDate: session.sessionDate,
    trainer: trainer ? toTrainer(trainer) : { id: session.trainerId, name: "Unknown", role: "Trainer" },
    lob: session.lob,
    type: session.type,
    topic: session.topic,
    durationMinutes: session.durationMinutes,
    status: session.status,
    attendanceCount: attendance.length,
    notes: session.notes,
  };
}

async function agentView(agent: typeof agentsTable.$inferSelect) {
  return {
    id: agent.id,
    hrId: agent.hrId,
    mis: agent.mis,
    name: agent.name,
    lob: agent.lob,
    employmentStatus: agent.employmentStatus,
    dateAdded: agent.dateAdded,
    notes: agent.notes,
    archivedAt: agent.archivedAt?.toISOString() ?? null,
  };
}

async function coverageRows() {
  const activities = await allActivities();
  const agents = await allAgents();
  const rows: Array<Record<string, unknown>> = [];
  for (const activity of activities) {
    const coverage = await activityCoverage(activity.id);
    for (const agent of agents) {
      const isRequired = coverage.requiredIds.includes(agent.id);
      if (!isRequired) continue;
      const agentRecords = coverage.records.filter((record) => record.agentId === agent.id && record.status === "Attended");
      const lastRecord = agentRecords.at(-1);
      const session = lastRecord ? (await db.select().from(sessionsTable).where(eq(sessionsTable.id, lastRecord.sessionId)))[0] : null;
      const trainer = session ? (await db.select().from(trainersTable).where(eq(trainersTable.id, session.trainerId)))[0] : null;
      rows.push({
        id: activity.id * 100000 + agent.id,
        agentId: agent.id,
        hrId: agent.hrId,
        mis: agent.mis,
        agentName: agent.name,
        lob: agent.lob,
        activityId: activity.id,
        activityName: activity.name,
        trainer: trainer ? toTrainer(trainer) : null,
        status: lastRecord ? "Covered" : "Pending",
        result: lastRecord?.result ?? null,
        lastSessionDate: session?.sessionDate ?? null,
        sessionId: session?.sessionId ?? null,
      });
    }
  }
  return rows;
}

router.get("/dashboard", async (_req, res) => {
  await ensureTrainers();
  const [activities, sessions, agents, updates, logs, trainers] = await Promise.all([
    allActivities(),
    db.select().from(sessionsTable),
    allAgents(),
    db.select().from(updatesTable),
    db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(8),
    db.select().from(trainersTable),
  ]);
  const activityViews = await Promise.all(activities.map(activityView));
  const completedSessions = sessions.filter((session) => session.status === "Completed");
  const coverage = await coverageRows();
  const coveredAgentIds = new Set(coverage.filter((row) => row.status === "Covered").map((row) => row.agentId as number));
  const requiredCount = activityViews.reduce((sum, activity) => sum + activity.requiredAgents, 0);
  const coveredCount = activityViews.reduce((sum, activity) => sum + activity.coveredAgents, 0);
  const makeGrouped = (values: string[]) => values.map((value) => ({ value, count: values.filter((entry) => entry === value).length }));
  const coverageByLob = LOBS.map((lob) => {
    const scoped = coverage.filter((row) => row.lob === lob);
    const covered = scoped.filter((row) => row.status === "Covered").length;
    return { lob, covered, required: scoped.length, percent: scoped.length ? Math.round((covered / scoped.length) * 100) : 0 };
  });
  res.json({
    completedSessions: completedSessions.length,
    agentsCovered: coveredAgentIds.size,
    pendingAgents: Math.max(requiredCount - coveredCount, 0),
    activeHeadCount: agents.filter((agent) => agent.employmentStatus === "Active").length,
    activeActivities: activities.filter((activity) => ["Active", "In Progress"].includes(activity.status)).length,
    activeUpdates: updates.filter((update) => ["Open", "In Progress"].includes(update.status)).length,
    coveragePercent: requiredCount ? Math.round((coveredCount / requiredCount) * 100) : 0,
    trainingHours: Math.round(completedSessions.reduce((sum, session) => sum + session.durationMinutes, 0) / 60 * 10) / 10,
    coverageByLob,
    sessionsByTrainer: trainers.map((trainer) => ({ trainer: toTrainer(trainer), sessions: completedSessions.filter((session) => session.trainerId === trainer.id).length })),
    sessionsByLob: LOBS.map((lob) => ({ lob, sessions: completedSessions.filter((session) => session.lob === lob).length })),
    activitiesByStatus: makeGrouped(activities.map((activity) => activity.status)).map((entry) => ({ status: entry.value, count: entry.count })),
    needingAttention: activityViews.filter((activity) => activity.pendingAgents > 0 && activity.status !== "Archived").slice(0, 5),
    recentActivity: logs.map((log) => ({ id: log.id, action: log.action, createdAt: log.createdAt.toISOString(), relatedRecord: log.relatedRecord, trainer: log.trainer })),
  });
});

router.get("/activities", async (_req, res) => {
  res.json(await Promise.all((await allActivities()).map(activityView)));
});

router.post("/activities", async (req, res) => {
  const input = activityInput.parse(req.body);
  const [activity] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(activitiesTable).values({
      name: input.name, type: input.type, scope: input.scope, startDate: input.startDate, endDate: input.endDate,
      status: input.status, description: input.description ?? null,
    }).returning();
    if (input.requiredAgentIds?.length) {
      await tx.insert(activityRequiredAgentsTable).values(input.requiredAgentIds.map((agentId) => ({ activityId: created.id, agentId })));
    }
    return [created];
  });
  await logAction("Training Activity Created", activity.name);
  res.status(201).json(await activityView(activity));
});

router.get("/activities/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, id));
  if (!activity) {
    res.status(404).json({ error: "Training activity not found" });
    return;
  }
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.activityId, id));
  const coverage = await activityCoverage(id);
  const agents = await allAgents();
  const coveredRecords = coverage.records.filter((record) => record.status === "Attended");
  const covered = await Promise.all(coveredRecords.map(async (record) => {
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, record.agentId));
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, record.sessionId));
    const [trainer] = session ? await db.select().from(trainersTable).where(eq(trainersTable.id, session.trainerId)) : [undefined];
    return agent && session ? { ...agentView(agent), activityName: activity.name, trainer: trainer ? toTrainer(trainer) : null, result: record.result, status: "Covered", lastSessionDate: session.sessionDate, sessionId: session.sessionId } : null;
  }));
  res.json({
    ...(await activityView(activity)),
    sessions: await Promise.all(sessions.map(sessionView)),
    covered: covered.filter(Boolean),
    pending: agents.filter((agent) => coverage.requiredIds.includes(agent.id) && !coverage.coveredIds.has(agent.id)).map(agentView),
  });
});

router.patch("/activities/:id", async (req, res) => {
  const id = Number(req.params.id);
  const input = activityUpdate.parse(req.body);
  const { requiredAgentIds, ...activityFields } = input;
  const [activity] = await db.transaction(async (tx) => {
    const [updated] = await tx.update(activitiesTable).set(activityFields).where(eq(activitiesTable.id, id)).returning();
    if (updated && requiredAgentIds) {
      await tx.delete(activityRequiredAgentsTable).where(eq(activityRequiredAgentsTable.activityId, id));
      if (requiredAgentIds.length) {
        await tx.insert(activityRequiredAgentsTable).values(requiredAgentIds.map((agentId) => ({ activityId: id, agentId })));
      }
    }
    return [updated];
  });
  if (!activity) {
    res.status(404).json({ error: "Training activity not found" });
    return;
  }
  await logAction("Training Activity Edited", activity.name);
  res.json(await activityView(activity));
});

router.get("/sessions", async (_req, res) => {
  const sessions = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.sessionDate));
  res.json(await Promise.all(sessions.map(sessionView)));
});

router.post("/sessions", async (req, res) => {
  const input = sessionInput.parse(req.body);
  const existing = await db.select().from(sessionsTable);
  const [session] = await db.insert(sessionsTable).values({
    sessionId: `S${String(existing.length + 1).padStart(3, "0")}`,
    activityId: input.activityId, sessionDate: input.sessionDate, trainerId: input.trainerId, lob: input.lob,
    type: input.type, topic: input.topic ?? null, durationMinutes: input.durationMinutes, status: input.status, notes: input.notes ?? null,
  }).returning();
  const [trainer] = await db.select().from(trainersTable).where(eq(trainersTable.id, input.trainerId));
  const requiredAgents = await db.select().from(activityRequiredAgentsTable).where(eq(activityRequiredAgentsTable.activityId, input.activityId));
  if (requiredAgents.length) {
    await db.insert(attendanceTable).values(requiredAgents.map((required) => ({ sessionId: session.id, agentId: required.agentId, status: "Absent", result: null, notes: null })));
  }
  await logAction("Session Created", session.sessionId, trainer?.name ?? null);
  res.status(201).json(await sessionView(session));
});

router.get("/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const detail = await sessionView(session);
  const records = await db.select().from(attendanceTable).where(eq(attendanceTable.sessionId, id));
  const agents = await allAgents();
  res.json({ ...detail, attendance: records.map((record) => {
    const agent = agents.find((entry) => entry.id === record.agentId);
    return { id: record.id, agentId: record.agentId, hrId: agent?.hrId ?? "", mis: agent?.mis ?? "", agentName: agent?.name ?? "", lob: agent?.lob ?? session.lob, status: record.status, result: record.result, notes: record.notes };
  }) });
});

router.patch("/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const input = sessionUpdate.parse(req.body);
  const [session] = await db.update(sessionsTable).set(input).where(eq(sessionsTable.id, id)).returning();
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await logAction("Session Edited", session.sessionId);
  res.json(await sessionView(session));
});

router.put("/sessions/:id/attendance", async (req, res) => {
  const sessionId = Number(req.params.id);
  const input = attendanceInput.parse(req.body);
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await db.transaction(async (tx) => {
    await tx.delete(attendanceTable).where(eq(attendanceTable.sessionId, sessionId));
    if (input.length) await tx.insert(attendanceTable).values(input.map((record) => ({ sessionId, agentId: record.agentId, status: record.status, result: record.result ?? null, notes: record.notes ?? null })));
  });
  await logAction("Attendance Updated", session.sessionId);
  const agents = await allAgents();
  const records = await db.select().from(attendanceTable).where(eq(attendanceTable.sessionId, sessionId));
  res.json(records.map((record) => {
    const agent = agents.find((entry) => entry.id === record.agentId);
    return { id: record.id, agentId: record.agentId, hrId: agent?.hrId ?? "", mis: agent?.mis ?? "", agentName: agent?.name ?? "", lob: agent?.lob ?? session.lob, status: record.status, result: record.result, notes: record.notes };
  }));
});

router.get("/agents", async (req, res) => {
  const includeArchived = req.query.includeArchived === "true";
  res.json(await Promise.all((await allAgents(includeArchived)).map(agentView)));
});

router.post("/agents", async (req, res) => {
  const input = agentInput.parse(req.body);
  const [existingHr] = await db.select({ id: agentsTable.id }).from(agentsTable).where(eq(agentsTable.hrId, input.hrId));
  if (existingHr) {
    res.status(409).json({ error: "An agent with this HR ID already exists." });
    return;
  }
  const [agent] = await db.insert(agentsTable).values({
    hrId: input.hrId, mis: input.mis, name: input.name, lob: input.lob, employmentStatus: input.employmentStatus,
    dateAdded: input.dateAdded ?? new Date().toISOString().slice(0, 10), notes: input.notes ?? null,
  }).returning();
  await logAction("Agent Added", agent.hrId);
  res.status(201).json(await agentView(agent));
});

router.post("/agents/bulk", async (req, res) => {
  const input = bulkAgentInput.parse(req.body);
  const hrIds = input.agents.map((agent) => agent.hrId);
  const duplicateHrIds = [...new Set(hrIds.filter((hrId, index) => hrIds.indexOf(hrId) !== index))];
  const existing = await db.select({ hrId: agentsTable.hrId }).from(agentsTable).where(inArray(agentsTable.hrId, [...new Set(hrIds)]));
  const existingHrIds = existing.map((agent) => agent.hrId);
  if (duplicateHrIds.length || existingHrIds.length) {
    const conflicts = [...new Set([...duplicateHrIds, ...existingHrIds])].join(", ");
    res.status(409).json({ error: `Duplicate HR ID${conflicts.includes(", ") ? "s" : ""}: ${conflicts}` });
    return;
  }
  const uniqueMis = [...new Set(input.agents.map((agent) => agent.mis))];
  const existingMis = await db.select({ mis: agentsTable.mis }).from(agentsTable).where(inArray(agentsTable.mis, uniqueMis));
  const existingMisSet = new Set(existingMis.map((agent) => agent.mis));
  const seenMis = new Set<string>();
  const warnings: string[] = [];
  for (const agent of input.agents) {
    if (existingMisSet.has(agent.mis)) warnings.push(`MIS ${agent.mis} already exists.`);
    if (seenMis.has(agent.mis)) warnings.push(`MIS ${agent.mis} is repeated in this import.`);
    seenMis.add(agent.mis);
  }
  const created = await db.transaction(async (tx) => tx.insert(agentsTable).values(input.agents.map((agent) => ({
    hrId: agent.hrId,
    mis: agent.mis,
    name: agent.name,
    lob: agent.lob,
    employmentStatus: agent.employmentStatus,
    dateAdded: agent.dateAdded ?? new Date().toISOString().slice(0, 10),
    notes: agent.notes ?? null,
  }))).returning());
  await logAction("Agents Imported", `${created.length} agents`);
  res.status(201).json({ created: await Promise.all(created.map(agentView)), warnings });
});

router.patch("/agents/bulk", async (req, res) => {
  const input = bulkAgentUpdate.parse(req.body);
  const updates = Object.fromEntries(Object.entries(input).filter(([key]) => key !== "ids" && input[key as keyof typeof input] !== undefined));
  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "Choose a field to update." });
    return;
  }
  const updated = [];
  for (const id of input.ids) {
    const [agent] = await db.update(agentsTable).set(updates).where(eq(agentsTable.id, id)).returning();
    if (agent) updated.push(agent);
  }
  await logAction("Agents Updated", `${updated.length} agents`);
  res.json(await Promise.all(updated.map(agentView)));
});

router.get("/agents/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, id));
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  const records = await db.select().from(attendanceTable).where(eq(attendanceTable.agentId, id));
  const sessions = await db.select().from(sessionsTable);
  const activities = await allActivities();
  const history = await Promise.all(records.map(async (record) => {
    const session = sessions.find((entry) => entry.id === record.sessionId);
    const activity = session ? activities.find((entry) => entry.id === session.activityId) : undefined;
    const [trainer] = session ? await db.select().from(trainersTable).where(eq(trainersTable.id, session.trainerId)) : [undefined];
    return { activityName: activity?.name ?? "Unknown activity", sessionId: session?.sessionId ?? "", trainer: trainer?.name ?? "", lob: agent.lob, date: session?.sessionDate ?? "", result: record.result, attendanceStatus: record.status, coverageStatus: record.status === "Attended" ? "Covered" : "Pending" };
  }));
  const completed = new Set(history.filter((record) => record.coverageStatus === "Covered").map((record) => record.activityName));
  res.json({ ...(await agentView(agent)), totalSessions: records.length, lastTrainingDate: history.map((record) => record.date).sort().at(-1) ?? null, pendingActivities: activities.filter((entry) => entry.status !== "Archived").length - completed.size, completedActivities: completed.size, history });
});

router.patch("/agents/:id", async (req, res) => {
  const id = Number(req.params.id);
  const input = agentUpdate.parse(req.body);
  if (input.hrId) {
    const [existingHr] = await db.select({ id: agentsTable.id }).from(agentsTable).where(and(eq(agentsTable.hrId, input.hrId), sql`${agentsTable.id} <> ${id}`));
    if (existingHr) {
      res.status(409).json({ error: "An agent with this HR ID already exists." });
      return;
    }
  }
  const [agent] = await db.update(agentsTable).set(input).where(eq(agentsTable.id, id)).returning();
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  await logAction(input.lob ? "Agent LOB Changed" : "Agent Modified", agent.hrId);
  res.json(await agentView(agent));
});

async function hasAgentHistory(id: number) {
  const [attendance] = await db.select({ id: attendanceTable.id }).from(attendanceTable).where(eq(attendanceTable.agentId, id)).limit(1);
  const [required] = await db.select({ id: activityRequiredAgentsTable.id }).from(activityRequiredAgentsTable).where(eq(activityRequiredAgentsTable.agentId, id)).limit(1);
  return Boolean(attendance || required);
}

router.delete("/agents/bulk", async (req, res) => {
  const input = bulkAgentDelete.parse(req.body);
  let deleted = 0;
  let archived = 0;
  for (const id of input.ids) {
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, id));
    if (!agent) continue;
    if (await hasAgentHistory(id)) {
      await db.update(agentsTable).set({ archivedAt: new Date() }).where(eq(agentsTable.id, id));
      archived += 1;
    } else {
      await db.delete(agentsTable).where(eq(agentsTable.id, id));
      deleted += 1;
    }
  }
  await logAction("Agents Removed", `${deleted} deleted, ${archived} archived`);
  res.json({ deleted, archived });
});

router.delete("/agents/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, id));
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  if (await hasAgentHistory(id)) {
    const [archived] = await db.update(agentsTable).set({ archivedAt: new Date() }).where(eq(agentsTable.id, id)).returning();
    await logAction("Agent Archived", agent.hrId);
    res.json({ mode: "archived", agent: await agentView(archived) });
    return;
  }
  await db.delete(agentsTable).where(eq(agentsTable.id, id));
  await logAction("Agent Deleted", agent.hrId);
  res.json({ mode: "deleted" });
});

router.get("/coverage", async (_req, res) => {
  res.json(await coverageRows());
});

router.get("/head-count", async (_req, res) => {
  const agents = await allAgents();
  const rows = LOBS.map((lob) => {
    const scoped = agents.filter((agent) => agent.lob === lob);
    return { lob, active: scoped.filter((agent) => agent.employmentStatus === "Active").length, inactive: scoped.filter((agent) => agent.employmentStatus === "Inactive").length, transferred: scoped.filter((agent) => agent.employmentStatus === "Transferred").length, onLeave: scoped.filter((agent) => agent.employmentStatus === "On Leave").length, total: scoped.length };
  });
  const snapshots = await db.select().from(headCountSnapshotsTable).orderBy(desc(headCountSnapshotsTable.month));
  const snapshotMap = new Map<string, number>();
  for (const snapshot of snapshots) snapshotMap.set(snapshot.month, (snapshotMap.get(snapshot.month) ?? 0) + snapshot.active);
  res.json({ totalActive: agents.filter((agent) => agent.employmentStatus === "Active").length, inactive: agents.filter((agent) => agent.employmentStatus === "Inactive").length, transferred: agents.filter((agent) => agent.employmentStatus === "Transferred").length, onLeave: agents.filter((agent) => agent.employmentStatus === "On Leave").length, rows, snapshots: [...snapshotMap].map(([month, totalActive]) => ({ month, totalActive })) });
});

router.get("/updates", async (_req, res) => {
  const updates = await db.select().from(updatesTable).orderBy(desc(updatesTable.releaseDate));
  res.json(await Promise.all(updates.map(async (update) => {
    const links = await db.select().from(updateActivitiesTable).where(eq(updateActivitiesTable.updateId, update.id));
    const linked = await Promise.all(links.map(async (link) => {
      const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, link.activityId));
      return activity;
    }));
    const views = await Promise.all(linked.filter(Boolean).map(activityView));
    return { id: update.id, updateId: update.updateId, title: update.title, description: update.description, scope: update.scope, releaseDate: update.releaseDate, deadline: update.deadline, status: update.status, linkedActivities: links.map((link) => link.activityId), notes: update.notes, coveragePercent: views.length ? Math.round(views.reduce((sum, entry) => sum + entry.coveragePercent, 0) / views.length) : 0 };
  })));
});

router.post("/updates", async (req, res) => {
  const input = updateInput.parse(req.body);
  const existing = await db.select().from(updatesTable);
  const [update] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(updatesTable).values({ updateId: `U${String(existing.length + 1).padStart(3, "0")}`, title: input.title, description: input.description ?? null, scope: input.scope, releaseDate: input.releaseDate, deadline: input.deadline ?? null, status: input.status, notes: input.notes ?? null }).returning();
    if (input.linkedActivities?.length) await tx.insert(updateActivitiesTable).values(input.linkedActivities.map((activityId) => ({ updateId: created.id, activityId })));
    return [created];
  });
  await logAction("Update Created", update.updateId);
  res.status(201).json({ id: update.id, updateId: update.updateId, title: update.title, description: update.description, scope: update.scope, releaseDate: update.releaseDate, deadline: update.deadline, status: update.status, linkedActivities: input.linkedActivities ?? [], notes: update.notes, coveragePercent: 0 });
});

router.patch("/updates/:id", async (req, res) => {
  const id = Number(req.params.id);
  const input = updatePatch.parse(req.body);
  const [update] = await db.update(updatesTable).set({ ...input, deadline: input.deadline ?? undefined }).where(eq(updatesTable.id, id)).returning();
  if (!update) {
    res.status(404).json({ error: "Update not found" });
    return;
  }
  await logAction("Update Modified", update.updateId);
  res.json({ id: update.id, updateId: update.updateId, title: update.title, description: update.description, scope: update.scope, releaseDate: update.releaseDate, deadline: update.deadline, status: update.status, linkedActivities: [], notes: update.notes, coveragePercent: 0 });
});

router.get("/workload", async (_req, res) => {
  await ensureTrainers();
  const trainers = await db.select().from(trainersTable);
  const sessions = await db.select().from(sessionsTable);
  const attendance = await db.select().from(attendanceTable);
  res.json(await Promise.all(trainers.map(async (trainer) => {
    const trainerSessions = sessions.filter((session) => session.trainerId === trainer.id);
    const trainerAttendance = attendance.filter((record) => trainerSessions.some((session) => session.id === record.sessionId));
    const uniqueAgents = new Set(trainerAttendance.filter((record) => record.status === "Attended").map((record) => record.agentId));
    const activityIds = new Set(trainerSessions.map((session) => session.activityId));
    const month = new Date().toISOString().slice(0, 7);
    return { trainer: toTrainer(trainer), completedSessions: trainerSessions.filter((session) => session.status === "Completed").length, uniqueAgentsCovered: uniqueAgents.size, totalAttendance: trainerAttendance.length, trainingHours: Math.round(trainerSessions.filter((session) => session.status === "Completed").reduce((sum, session) => sum + session.durationMinutes, 0) / 60 * 10) / 10, activeSessions: trainerSessions.filter((session) => ["Planned", "In Progress"].includes(session.status)).length, sessionsThisMonth: trainerSessions.filter((session) => session.sessionDate.startsWith(month)).length, activitiesParticipated: activityIds.size };
  })));
});

export default router;