import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pullFromCloud, pushToCloud, subscribeToCloud } from './cloud-sync';

export const Lob = {
  'C-Side': 'C-Side',
  'BD-Side': 'BD-Side',
  'DC&Calls-Side': 'DC&Calls-Side',
  Kfood: 'Kfood',
  CM: 'CM',
  'SA C-side': 'SA C-side',
} as const;
export type Lob = typeof Lob[keyof typeof Lob];

export const ActivityType = {
  Refresher: 'Refresher',
  Process_Update: 'Process Update',
  SOP_Update: 'SOP Update',
  QA_Refresher: 'QA Refresher',
  Soft_Skills: 'Soft Skills',
  Product_Update: 'Product Update',
  Task_Review: 'Task Review',
  Mandatory_Training: 'Mandatory Training',
  Other: 'Other',
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export const ActivityStatus = { Draft: 'Draft', Active: 'Active', In_Progress: 'In Progress', Completed: 'Completed', Archived: 'Archived' } as const;
export type ActivityStatus = typeof ActivityStatus[keyof typeof ActivityStatus];
export const SessionStatus = { Planned: 'Planned', In_Progress: 'In Progress', Completed: 'Completed', Cancelled: 'Cancelled' } as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];
export const SessionType = { Refresher: 'Refresher', Update_Session: 'Update Session', Soft_Skills: 'Soft Skills', QA_Coaching: 'QA Coaching', New_Joiner_Support: 'New Joiner Support', Process_Update: 'Process Update', Other: 'Other' } as const;
export type SessionType = typeof SessionType[keyof typeof SessionType];
export const AgentStatus = { Active: 'Active', Inactive: 'Inactive', Transferred: 'Transferred', On_Leave: 'On Leave' } as const;
export type AgentStatus = typeof AgentStatus[keyof typeof AgentStatus];
export const AttendanceStatus = { Attended: 'Attended', Absent: 'Absent', Removed: 'Removed', Cancelled: 'Cancelled' } as const;
export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];
export const UpdateStatus = { Open: 'Open', In_Progress: 'In Progress', Completed: 'Completed', Archived: 'Archived' } as const;
export type UpdateStatus = typeof UpdateStatus[keyof typeof UpdateStatus];
export const CoverageRecordStatus = { Covered: 'Covered', Pending: 'Pending', No_Training_Record: 'No Training Record' } as const;
export type CoverageRecordStatus = typeof CoverageRecordStatus[keyof typeof CoverageRecordStatus];

const TRAINERS = [
  { id: 1, name: 'Mustafa', role: 'Full Knowledge Trainer' },
  { id: 2, name: 'Dina', role: 'Full Knowledge Trainer' },
  { id: 3, name: 'Asma', role: 'Full Knowledge Trainer' },
  { id: 4, name: 'Sara', role: 'Full Knowledge Trainer' },
  { id: 5, name: 'Nesreen', role: 'Full Knowledge Trainer' },
];
const LOBS = Object.values(Lob);
const STORAGE_KEY = 'keeta-training-team-db-v1';

type Agent = { id: number; hrId: string; mis: string; name: string; lob: Lob; employmentStatus: AgentStatus; trainingStage?: 'Active' | 'Nesting W1' | 'Nesting W2' | null; dateAdded: string; notes: string | null; archivedAt: string | null };
type Activity = { id: number; name: string; type: ActivityType | string; scope: Lob[]; startDate: string; endDate: string; status: ActivityStatus | string; description: string | null; requiredAgentIds: number[]; createdByUserId: number | null; createdByName: string | null };
type Session = { id: number; sessionId: string; activityId: number; sessionDate: string; trainerId: number; lob: Lob; type: SessionType | string; topic: string | null; durationMinutes: number; status: SessionStatus | string; notes: string | null; createdByUserId: number | null; createdByName: string | null };
type Attendance = { id: number; sessionId: number; agentId: number; status: AttendanceStatus | string; result: number | null; notes: string | null };
type TrainingUpdate = { id: number; updateId: string; title: string; description: string | null; scope: Lob[]; releaseDate: string; deadline: string | null; status: UpdateStatus | string; linkedActivities: number[]; notes: string | null };
export type BatchStatus = 'In Training' | 'Completed' | 'Archived';
export type BatchType = 'New Hire' | 'Upskill';
export type CertificationStatus = 'Pending' | 'Passed' | 'Failed';
export type BatchAttendanceStatus = 'Not Marked' | 'Attended' | 'Absent';
type Batch = { id: number; batchId: string; name: string; batchType: BatchType; lob: Lob; trainerId: number; startDate: string; durationDays: number; status: BatchStatus; notes: string | null; dayDates: string[]; createdAt: string; createdByUserId: number | null; createdByName: string | null };
type BatchTrainee = { id: number; batchId: number; sourceAgentId: number | null; name: string; mis: string | null; hrId: string | null; jw: string | null; email: string | null; portalPassword: string | null; phoneNumber: string | null; notes: string | null; quizScore: string | null; quizResult: CertificationStatus; quizNotes: string | null; typingWpm: string | null; typingAccuracy: string | null; typingResult: CertificationStatus; typingNotes: string | null; knowledgeAttempt1?: CertificationStatus; knowledgeAttempt2?: CertificationStatus; mockAttempt1?: CertificationStatus; mockAttempt2?: CertificationStatus; mockCaseId1?: string | null; mockCaseId2?: string | null; nestingWeek1?: CertificationStatus; nestingWeek2?: CertificationStatus; stage?: string; finalScore: string | null; finalNotes: string | null; certificationStatus: CertificationStatus; graduated: boolean; agentId: number | null; addedByUserId?: number | null; addedByName?: string | null };
type BatchAttendance = { id: number; batchId: number; traineeId: number; dayNumber: number; date: string; status: BatchAttendanceStatus; notes: string | null };
type BatchQuiz = { id: number; batchId: number; traineeId: number; dayNumber: number; date: string; score: string | null; result: CertificationStatus; notes: string | null };
type TypingLanguage = 'Arabic' | 'English';
type BatchTyping = { id: number; batchId: number; traineeId: number; dayNumber: number; date: string; language: TypingLanguage; wpm: string | null; accuracy: string | null; result: CertificationStatus; notes: string | null };
type BatchRolePlay = { id: number; batchId: number; traineeId: number; date: string; caseId: string; trainerId: number; result: 'Completed' | 'Needs Improvement' | 'Passed'; notes: string | null; createdAt: string };
type ExamLink = { id: number; itemKind: 'Exam Package' | 'Question Bank'; title: string; lob: Lob | 'All LOBs'; type: string; url: string | null; notes: string | null; status: 'Active' | 'Archived'; addedBy: string; createdAt: string; createdByUserId: number | null };
export type AuthUser = { id: number; name: string; role: string; isAdmin: boolean; frozen: boolean; passwordHash: string | null; salt: string };
type Log = { id: number; action: string; relatedRecord: string | null; trainer: string | null; createdAt: string };
type Snapshot = { month: string; lob: Lob; active: number; inactive: number; transferred: number; onLeave: number; total: number };
type Db = {
  agents: Agent[];
  activities: Activity[];
  sessions: Session[];
  attendance: Attendance[];
  updates: TrainingUpdate[];
  batches: Batch[];
  batchTrainees: BatchTrainee[];
  batchAttendance: BatchAttendance[];
  batchQuiz: BatchQuiz[];
  batchTyping: BatchTyping[];
  batchRolePlays: BatchRolePlay[];
  examLinks: ExamLink[];
  logs: Log[];
  snapshots: Snapshot[];
  users: AuthUser[];
  counters: { agent: number; activity: number; session: number; attendance: number; update: number; batch: number; batchTrainee: number; batchAttendance: number; batchQuiz: number; batchTyping: number; batchRolePlay: number; examLink: number; log: number };
};

const emptyDb = (): Db => ({
  agents: [], activities: [], sessions: [], attendance: [], updates: [], batches: [], batchTrainees: [], batchAttendance: [], batchQuiz: [], batchTyping: [], batchRolePlays: [], examLinks: [], logs: [], snapshots: [],
  users: TRAINERS.map(t => ({ id: t.id, name: t.name, role: t.role, isAdmin: t.name === 'Mustafa', frozen: false, passwordHash: null, salt: `keeta-${t.id}-${t.name.toLowerCase()}-2026` })),
  counters: { agent: 1, activity: 1, session: 1, attendance: 1, update: 1, batch: 1, batchTrainee: 1, batchAttendance: 1, batchQuiz: 1, batchTyping: 1, batchRolePlay: 1, examLink: 1, log: 1 },
});

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as Partial<Db>;
    const base = emptyDb(); const merged = { ...base, ...parsed, counters: { ...base.counters, ...(parsed.counters ?? {}) } } as Db;
    if (!Array.isArray(merged.users) || !merged.users.length) merged.users = base.users;
    if (!Array.isArray(merged.batchTrainees)) merged.batchTrainees = [];
    if (!Array.isArray(merged.batchQuiz)) merged.batchQuiz = [];
    if (!Array.isArray(merged.batchTyping)) merged.batchTyping = [];
    if (!Array.isArray(merged.batchRolePlays)) merged.batchRolePlays = [];
    merged.activities = (merged.activities ?? []).map((a:any) => ({ ...a, createdByUserId: a.createdByUserId ?? null, createdByName: a.createdByName ?? null }));
    merged.sessions = (merged.sessions ?? []).map((x:any) => ({ ...x, createdByUserId: x.createdByUserId ?? null, createdByName: x.createdByName ?? null }));
    merged.batches = (merged.batches ?? []).map((b:any) => ({ ...b, batchType: b.batchType === 'Upskill' ? 'Upskill' : 'New Hire', createdByUserId: b.createdByUserId ?? null, createdByName: b.createdByName ?? null }));
    merged.examLinks = (merged.examLinks ?? []).map((e:any) => ({ ...e, itemKind: e.itemKind === 'Question Bank' ? 'Question Bank' : 'Exam Package', url: e.itemKind === 'Question Bank' ? null : (e.url ?? null), createdByUserId: e.createdByUserId ?? null }));
    // Backfill ownership for records created before ownership fields existed, using Recent Activity when available.
    const userIdByName = (name?: string | null) => merged.users.find(u => u.name === name)?.id ?? null;
    for (const a of merged.activities) if (a.createdByUserId == null) { const rec=merged.logs.find(l=>l.action==='Training Activity Created'&&l.relatedRecord===a.name); const uid=userIdByName(rec?.trainer); if(uid!=null){a.createdByUserId=uid;a.createdByName=rec?.trainer??null;} }
    for (const x of merged.sessions) if (x.createdByUserId == null) { const rec=merged.logs.find(l=>l.action==='Session Created'&&l.relatedRecord===x.sessionId); const uid=userIdByName(rec?.trainer); if(uid!=null){x.createdByUserId=uid;x.createdByName=rec?.trainer??null;} }
    for (const b of merged.batches) if (b.createdByUserId == null) { const rec=merged.logs.find(l=>l.action==='Batch Created'&&String(l.relatedRecord??'').startsWith(`${b.batchId} ·`)); const uid=userIdByName(rec?.trainer); if(uid!=null){b.createdByUserId=uid;b.createdByName=rec?.trainer??null;} }
    for (const e of merged.examLinks) if (e.createdByUserId == null) e.createdByUserId=userIdByName(e.addedBy);
    merged.agents = (merged.agents ?? []).map((a:any) => ({ ...a, trainingStage: a.trainingStage ?? 'Active' }));
    merged.batchTrainees = merged.batchTrainees.map((t:any) => ({
      ...t,
      sourceAgentId: t.sourceAgentId ?? null,
      mis: t.mis ?? t.jw ?? null,
      jw: null,
      email: t.email ?? null,
      portalPassword: t.portalPassword ?? null,
      phoneNumber: t.phoneNumber ?? null,
      quizScore: t.quizScore ?? null,
      quizResult: t.quizResult ?? 'Pending',
      quizNotes: t.quizNotes ?? null,
      typingWpm: t.typingWpm ?? null,
      typingAccuracy: t.typingAccuracy ?? null,
      typingResult: t.typingResult ?? 'Pending',
      typingNotes: t.typingNotes ?? null,
      knowledgeAttempt1: t.knowledgeAttempt1 ?? 'Pending',
      knowledgeAttempt2: t.knowledgeAttempt2 ?? 'Pending',
      mockAttempt1: t.mockAttempt1 ?? 'Pending',
      mockAttempt2: t.mockAttempt2 ?? 'Pending',
      mockCaseId1: t.mockCaseId1 ?? null,
      mockCaseId2: t.mockCaseId2 ?? null,
      nestingWeek1: t.nestingWeek1 ?? 'Pending',
      nestingWeek2: t.nestingWeek2 ?? 'Pending',
      stage: t.stage ?? 'Training',
      finalScore: t.finalScore ?? null,
      finalNotes: t.finalNotes ?? null,
      addedByUserId: t.addedByUserId ?? merged.batches.find(b=>b.id===t.batchId)?.createdByUserId ?? null,
      addedByName: t.addedByName ?? merged.batches.find(b=>b.id===t.batchId)?.createdByName ?? null,
    }));
    // Backward compatibility: preserve any older one-off Quiz / Typing Test values by placing them on Day 1.
    for (const t of merged.batchTrainees) {
      const batch = merged.batches.find(b => b.id === t.batchId);
      const date = batch?.dayDates?.[0] ?? batch?.startDate ?? new Date().toISOString().slice(0,10);
      if ((t.quizScore || t.quizNotes || t.quizResult !== 'Pending') && !merged.batchQuiz.some(q => q.traineeId === t.id && q.dayNumber === 1)) {
        merged.batchQuiz.push({ id: merged.counters.batchQuiz++, batchId: t.batchId, traineeId: t.id, dayNumber: 1, date, score: t.quizScore, result: t.quizResult, notes: t.quizNotes });
      }
      if ((t.typingWpm || t.typingAccuracy || t.typingNotes || t.typingResult !== 'Pending') && !merged.batchTyping.some(x => x.traineeId === t.id && x.dayNumber === 1 && x.language === 'English')) {
        merged.batchTyping.push({ id: merged.counters.batchTyping++, batchId: t.batchId, traineeId: t.id, dayNumber: 1, date, language: 'English', wpm: t.typingWpm, accuracy: t.typingAccuracy, result: t.typingResult, notes: t.typingNotes });
      }
    }
    return merged;
  } catch {
    return emptyDb();
  }
}
function saveDb(db: Db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); pushToCloud(db); }
function withDb<T>(fn: (db: Db) => T): T { const db = loadDb(); const out = fn(db); saveDb(db); return out; }
function activeAgents(db: Db, includeArchived = false) { return db.agents.filter(a => includeArchived || !a.archivedAt).sort((a,b) => a.name.localeCompare(b.name)); }
function log(db: Db, action: string, relatedRecord: string | null, trainer: string | null = null) { let actor = trainer; try { actor = JSON.parse(sessionStorage.getItem('keeta-current-user-v1') || 'null')?.name ?? trainer; } catch {} db.logs.unshift({ id: db.counters.log++, action, relatedRecord, trainer: actor, createdAt: new Date().toISOString() }); db.logs = db.logs.slice(0, 100); }
function snapshot(db: Db) {
  const month = new Date().toISOString().slice(0,7);
  db.snapshots = db.snapshots.filter(s => s.month !== month);
  for (const lob of LOBS) {
    const rows = activeAgents(db).filter(a => a.lob === lob);
    db.snapshots.push({ month, lob, active: rows.filter(a=>a.employmentStatus==='Active').length, inactive: rows.filter(a=>a.employmentStatus==='Inactive').length, transferred: rows.filter(a=>a.employmentStatus==='Transferred').length, onLeave: rows.filter(a=>a.employmentStatus==='On Leave').length, total: rows.length });
  }
}
function conflict(message: string) { const e: any = new Error(message); e.response = { data: { error: message } }; return e; }
function currentActor(): { id:number; name:string; isAdmin:boolean } | null { try { const u=JSON.parse(sessionStorage.getItem('keeta-current-user-v1')||'null'); return u ? { id:Number(u.id), name:String(u.name||''), isAdmin:Boolean(u.isAdmin) } : null; } catch { return null; } }
function requireAdmin(action='perform this action') { const actor=currentActor(); if(!actor?.isAdmin) throw conflict(`Only Mustafa (Main Admin) can ${action}.`); return actor; }
function ownershipForCreate(){ const actor=currentActor(); return { createdByUserId: actor?.id ?? null, createdByName: actor?.name ?? null }; }
function canDeleteOwned(record:{createdByUserId?:number|null;createdByName?:string|null;addedBy?:string|null}) { const actor=currentActor(); if(!actor) return false; if(actor.isAdmin) return true; if(record.createdByUserId != null) return Number(record.createdByUserId)===actor.id; const ownerName=record.createdByName ?? record.addedBy ?? null; return Boolean(ownerName && ownerName===actor.name); }
function requireOwnerOrAdmin(record:{createdByUserId?:number|null;createdByName?:string|null;addedBy?:string|null}, thing='record') { if(!canDeleteOwned(record)) throw conflict(`You can only delete ${thing}s you created. Mustafa can delete any ${thing}.`); }

function requireBatchManager(batch: Batch, action='update this batch') {
  const actor=currentActor();
  if(!actor || (!actor.isAdmin && Number(batch.trainerId)!==actor.id)) throw conflict(`Only the responsible trainer for this batch or Mustafa (Main Admin) can ${action}.`);
  return actor;
}
function syncTraineeStage(db:Db,t:BatchTrainee,b:Batch){
  const pass=(a?:CertificationStatus,b2?:CertificationStatus)=>a==='Passed'||(a==='Failed'&&b2==='Passed');
  const finalFail=(a?:CertificationStatus,b2?:CertificationStatus)=>a==='Failed'&&b2==='Failed';
  const certPassed=pass(t.knowledgeAttempt1,t.knowledgeAttempt2)&&pass(t.mockAttempt1,t.mockAttempt2);
  const certFailed=finalFail(t.knowledgeAttempt1,t.knowledgeAttempt2)||finalFail(t.mockAttempt1,t.mockAttempt2);
  t.certificationStatus=certPassed?'Passed':certFailed?'Failed':'Pending';
  if(certFailed){ t.stage='Failed Certification'; return; }
  if(!certPassed){ t.stage='Certification'; return; }
  if(t.nestingWeek1==='Failed') t.stage='Failed Nesting W1';
  else if(t.nestingWeek1!=='Passed') t.stage='Nesting W1';
  else if(t.nestingWeek2==='Failed') t.stage='Failed Nesting W2';
  else if(t.nestingWeek2==='Passed') t.stage='Active';
  else t.stage='Nesting W2';

  const failedNesting=t.stage==='Failed Nesting W1'||t.stage==='Failed Nesting W2';
  const linkedId=t.agentId ?? t.sourceAgentId;
  if(failedNesting){
    if(linkedId){ const a=db.agents.find(x=>x.id===linkedId); if(a)a.archivedAt=new Date().toISOString(); }
    return;
  }

  if(b.batchType==='New Hire' && ['Nesting W1','Nesting W2','Active'].includes(t.stage||'')){
    // New hires are moved into Agents / Head Count only through the explicit Graduate action.
    // Once graduated, keep their HC record synchronized with the current nesting/active stage.
    const a=t.agentId?db.agents.find(x=>x.id===t.agentId):undefined;
    if(a && t.hrId?.trim() && t.mis?.trim()){ a.archivedAt=null; a.employmentStatus='Active'; a.trainingStage=t.stage as any; a.name=t.name; a.hrId=t.hrId.trim(); a.mis=t.mis.trim(); }
  }
  if(b.batchType==='Upskill' && t.sourceAgentId){
    const a=db.agents.find(x=>x.id===t.sourceAgentId);
    if(a){ a.archivedAt=null; a.employmentStatus='Active'; a.trainingStage=(['Nesting W1','Nesting W2','Active'].includes(t.stage||'')?t.stage:'Active') as any; }
  }
}


function activityCoverage(db: Db, activityId: number) {
  const activity = db.activities.find(a => a.id === activityId);
  const requiredIds = activity?.requiredAgentIds ?? [];
  // Coverage is earned as soon as attendance is saved as Attended. A session does
  // not need to be marked Completed first; session status is an operational state,
  // while attendance is the source of truth for learner coverage.
  const activitySessionIds = db.sessions.filter(s => s.activityId === activityId).map(s => s.id);
  const records = db.attendance.filter(r => activitySessionIds.includes(r.sessionId) && requiredIds.includes(r.agentId));
  const coveredIds = new Set(records.filter(r => r.status === 'Attended').map(r => r.agentId));
  return { requiredIds, coveredIds, records };
}
function activityDeadline(endDate: string, pendingAgents: number, status: string) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(`${endDate}T00:00:00`);
  const daysRemaining = Math.round((due.getTime() - today.getTime()) / 86400000);
  const active = ['Active','In Progress'].includes(status) && pendingAgents > 0;
  if (!active) return { daysRemaining, deadlineState: 'clear', deadlineLabel: status === 'Completed' ? 'Completed' : `Ends ${endDate}` };
  if (daysRemaining < 0) return { daysRemaining, deadlineState: 'overdue', deadlineLabel: `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining)===1?'':'s'}` };
  if (daysRemaining === 0) return { daysRemaining, deadlineState: 'today', deadlineLabel: 'Due today' };
  if (daysRemaining <= 3) return { daysRemaining, deadlineState: 'soon', deadlineLabel: `Due in ${daysRemaining} day${daysRemaining===1?'':'s'}` };
  return { daysRemaining, deadlineState: 'upcoming', deadlineLabel: `Due in ${daysRemaining} days` };
}
function activityView(db: Db, a: Activity) {
  const cov = activityCoverage(db, a.id); const sessions = db.sessions.filter(s => s.activityId === a.id); const required = cov.requiredIds.length; const covered = cov.coveredIds.size; const pendingAgents = Math.max(required-covered,0);
  return { ...a, requiredAgents: required, coveredAgents: covered, pendingAgents, coveragePercent: required ? Math.round(covered/required*100) : 0, sessionsCount: sessions.length, lastSessionDate: sessions.length ? [...sessions].sort((x,y)=>x.sessionDate.localeCompare(y.sessionDate)).at(-1)?.sessionDate ?? null : null, ...activityDeadline(a.endDate, pendingAgents, String(a.status)) };
}
function sessionView(db: Db, s: Session) {
  const activity = db.activities.find(a=>a.id===s.activityId); const trainer = TRAINERS.find(t=>t.id===s.trainerId) ?? { id:s.trainerId, name:'Unknown', role:'Trainer' };
  const sessionAttendance = db.attendance.filter(a=>a.sessionId===s.id);
  return { ...s, activityName: activity?.name ?? 'Unknown activity', trainer, attendanceCount: sessionAttendance.length, attendedCount: sessionAttendance.filter(a=>a.status==='Attended').length, absentCount: sessionAttendance.filter(a=>a.status==='Absent').length };
}
function coverageRows(db: Db) {
  const rows: any[] = [];
  for (const activity of db.activities) {
    const cov = activityCoverage(db, activity.id);
    for (const agentId of cov.requiredIds) {
      const agent = db.agents.find(a=>a.id===agentId && !a.archivedAt); if (!agent) continue;
      const attended = cov.records.filter(r=>r.agentId===agentId && r.status==='Attended').sort((a,b)=>a.id-b.id); const last = attended.at(-1);
      const session = last ? db.sessions.find(s=>s.id===last.sessionId) : undefined; const trainer = session ? TRAINERS.find(t=>t.id===session.trainerId) ?? null : null;
      rows.push({ id: activity.id*100000+agent.id, agentId:agent.id, hrId:agent.hrId, mis:agent.mis, agentName:agent.name, lob:agent.lob, activityId:activity.id, activityName:activity.name, trainer, status:last?'Covered':'Pending', result:last?.result ?? null, lastSessionDate:session?.sessionDate ?? null, sessionId:session?.sessionId ?? null, sessionDbId:session?.id ?? null, sessionTopic:session?.topic || session?.type || null, sessionStatus:session?.status ?? null });
    }
  }
  return rows;
}
function activityDetail(db: Db, id: number) {
  const a = db.activities.find(x=>x.id===id); if (!a) return undefined; const cov = activityCoverage(db,id); const agents = activeAgents(db);
  const covered = [...cov.coveredIds].map(agentId => {
    const agent = db.agents.find(x=>x.id===agentId); if (!agent) return null;
    const rec = cov.records.filter(r=>r.agentId===agentId && r.status==='Attended').sort((x,y)=>x.id-y.id).at(-1); const session = rec ? db.sessions.find(s=>s.id===rec.sessionId) : undefined; const trainer = session ? TRAINERS.find(t=>t.id===session.trainerId) ?? null : null;
    return { ...agent, activityName:a.name, trainer, result:rec?.result ?? null, attendanceStatus:'Attended', status:'Covered', lastSessionDate:session?.sessionDate ?? null, sessionId:session?.sessionId ?? null, sessionDbId:session?.id ?? null, sessionTopic:session?.topic || session?.type || null };
  }).filter(Boolean);
  const pending = agents.filter(x=>cov.requiredIds.includes(x.id) && !cov.coveredIds.has(x.id)).map(agent => {
    const rec = cov.records.filter(r=>r.agentId===agent.id && r.status==='Absent').sort((x,y)=>x.id-y.id).at(-1);
    const session = rec ? db.sessions.find(s=>s.id===rec.sessionId) : undefined;
    const trainer = session ? TRAINERS.find(t=>t.id===session.trainerId) ?? null : null;
    return { ...agent, activityName:a.name, trainer, result:rec?.result ?? null, attendanceStatus:rec ? 'Absent' : 'Not marked', status:'Pending', lastSessionDate:session?.sessionDate ?? null, sessionId:session?.sessionId ?? null, sessionDbId:session?.id ?? null, sessionTopic:session?.topic || session?.type || null };
  });
  const absent = pending.filter((agent:any)=>agent.attendanceStatus==='Absent');
  return { ...activityView(db,a), sessions: db.sessions.filter(s=>s.activityId===id).map(s=>sessionView(db,s)), covered, pending, absent };
}
function sessionDetail(db: Db, id: number) {
  const s = db.sessions.find(x=>x.id===id); if (!s) return undefined;
  return { ...sessionView(db,s), attendance: db.attendance.filter(r=>r.sessionId===id).map(r=>{ const a=db.agents.find(x=>x.id===r.agentId); return { ...r, hrId:a?.hrId??'', mis:a?.mis??'', agentName:a?.name??'', lob:a?.lob??s.lob }; }) };
}
function agentDetail(db: Db, id: number) {
  const a = db.agents.find(x=>x.id===id); if (!a) return undefined;
  const records = db.attendance.filter(r=>r.agentId===id);
  const history = records.map(r=>{ const s=db.sessions.find(x=>x.id===r.sessionId); const ac=s?db.activities.find(x=>x.id===s.activityId):undefined; const t=s?TRAINERS.find(x=>x.id===s.trainerId):undefined; return { activityName:ac?.name??'Unknown activity', sessionId:s?.sessionId??'', sessionTopic:s?.topic||s?.type||'', sessionType:s?.type??'', trainer:t?.name??'', lob:a.lob, date:s?.sessionDate??'', quizScore:r.result, result:r.result, notes:r.notes??'', attendanceStatus:r.status, coverageStatus:r.status==='Attended'?'Covered':'Pending' }; }).sort((x,y)=>String(y.date).localeCompare(String(x.date)));
  const completed = new Set(history.filter(h=>h.coverageStatus==='Covered').map(h=>h.activityName));
  const linked=db.batchTrainees.find(t=>t.agentId===id||t.sourceAgentId===id||Boolean(t.mis&&a.mis&&t.mis.toLowerCase()===a.mis.toLowerCase())||Boolean(t.hrId&&a.hrId&&t.hrId===a.hrId)); const profileHistory=linked?batchTraineeHistory(db,linked):{batchHistory:[],rolePlayHistory:[],sessionHistory:history}; return { ...a, totalSessions:records.filter(r=>r.status==='Attended').length, lastTrainingDate:history.map(h=>h.date).filter(Boolean).sort().at(-1)??null, pendingActivities:Math.max(db.activities.filter(x=>x.status!=='Archived').length-completed.size,0), completedActivities:completed.size, history, batchHistory:profileHistory.batchHistory, rolePlayHistory:profileHistory.rolePlayHistory };
}
function headCount(db: Db) {
  const agents=activeAgents(db); const current=agents.filter(a=>a.employmentStatus==='Active');
  const rows=LOBS.map(lob=>{ const x=agents.filter(a=>a.lob===lob); const activeRows=x.filter(a=>a.employmentStatus==='Active'); const nestingW1=activeRows.filter(a=>a.trainingStage==='Nesting W1').length; const nestingW2=activeRows.filter(a=>a.trainingStage==='Nesting W2').length; const officialActive=activeRows.filter(a=>!a.trainingStage||a.trainingStage==='Active').length; return { lob, active:officialActive, nestingW1, nestingW2, currentHc:officialActive+nestingW1+nestingW2, inactive:x.filter(a=>a.employmentStatus==='Inactive').length, transferred:x.filter(a=>a.employmentStatus==='Transferred').length, onLeave:x.filter(a=>a.employmentStatus==='On Leave').length, total:x.length }; });
  const byMonth = new Map<string,number>(); for(const s of db.snapshots) byMonth.set(s.month,(byMonth.get(s.month)??0)+s.active);
  const nestingW1=current.filter(a=>a.trainingStage==='Nesting W1').length; const nestingW2=current.filter(a=>a.trainingStage==='Nesting W2').length; const officialActive=current.filter(a=>!a.trainingStage||a.trainingStage==='Active').length;
  return { totalActive:current.length, officialActive, nestingW1, nestingW2, currentHc:current.length, inactive:agents.filter(a=>a.employmentStatus==='Inactive').length, transferred:agents.filter(a=>a.employmentStatus==='Transferred').length, onLeave:agents.filter(a=>a.employmentStatus==='On Leave').length, rows, snapshots:[...byMonth.entries()].sort().reverse().map(([month,totalActive])=>({month,totalActive})) };
}
function dashboard(db: Db) {
  const activities=db.activities.map(a=>activityView(db,a));
  const completedSessions=db.sessions.filter(s=>s.status==='Completed');
  const coverage=coverageRows(db);
  const activeActivityIds=new Set(db.activities.filter(a=>['Active','In Progress'].includes(a.status)).map(a=>a.id));
  const currentCoverage=coverage.filter(r=>activeActivityIds.has(r.activityId));
  const coveredAgentIds=new Set(currentCoverage.filter(r=>r.status==='Covered').map(r=>r.agentId));
  const requiredCount=currentCoverage.length;
  const coveredCount=currentCoverage.filter(r=>r.status==='Covered').length;
  const coverageByLob=LOBS.map(lob=>{
    const scoped=currentCoverage.filter(r=>r.lob===lob);
    const covered=scoped.filter(r=>r.status==='Covered').length;
    const activityIds=[...new Set(scoped.map(r=>r.activityId))];
    const activities=activityIds.map(activityId=>{
      const rows=scoped.filter(r=>r.activityId===activityId);
      const activity=db.activities.find(a=>a.id===activityId);
      const activityCovered=rows.filter(r=>r.status==='Covered').length;
      return { id:activityId, name:activity?.name ?? 'Activity', covered:activityCovered, required:rows.length, percent:rows.length?Math.round(activityCovered/rows.length*100):0 };
    }).sort((a,b)=>a.name.localeCompare(b.name));
    return {lob,covered,required:scoped.length,percent:scoped.length?Math.round(covered/scoped.length*100):0,activities};
  });
  const activeBatchRows=db.batches.filter(b=>b.status==='In Training'); const activeNewHireBatches=activeBatchRows.filter(b=>b.batchType!=='Upskill').length; const activeUpskillBatches=activeBatchRows.filter(b=>b.batchType==='Upskill').length;
  return { completedSessions:completedSessions.length, agentsCovered:coveredAgentIds.size, pendingAgents:Math.max(requiredCount-coveredCount,0), activeHeadCount:activeAgents(db).filter(a=>a.employmentStatus==='Active').length, activeActivities:activeActivityIds.size, activeBatches:activeBatchRows.length, activeNewHireBatches, activeUpskillBatches, newHiresInTraining:db.batchTrainees.filter(t=>!t.graduated && db.batches.some(b=>b.id===t.batchId&&b.status==='In Training'&&b.batchType!=='Upskill')).length, upskillParticipantsInTraining:db.batchTrainees.filter(t=>db.batches.some(b=>b.id===t.batchId&&b.status==='In Training'&&b.batchType==='Upskill')).length, coveragePercent:requiredCount?Math.round(coveredCount/requiredCount*100):0, trainingHours:Math.round(completedSessions.reduce((n,s)=>n+s.durationMinutes,0)/60*10)/10, coverageByLob, sessionsByTrainer:TRAINERS.map(trainer=>({trainer,sessions:completedSessions.filter(s=>s.trainerId===trainer.id).length})).sort((a,b)=>b.sessions-a.sessions || a.trainer.name.localeCompare(b.trainer.name)), needingAttention:activities.filter(a=>a.pendingAgents>0&&['Active','In Progress'].includes(a.status)).sort((a:any,b:any)=>a.daysRemaining-b.daysRemaining || b.pendingAgents-a.pendingAgents).slice(0,5), recentActivity:db.logs.slice(0,8) };
}
function updatesView(db: Db) { return [...db.updates].sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)).map(u=>{ const views=u.linkedActivities.map(id=>db.activities.find(a=>a.id===id)).filter(Boolean).map(a=>activityView(db,a!)); return { ...u, coveragePercent:views.length?Math.round(views.reduce((n,a)=>n+a.coveragePercent,0)/views.length):0 }; }); }
function workload(db: Db) { const month=new Date().toISOString().slice(0,7); return TRAINERS.map(trainer=>{ const sessions=db.sessions.filter(s=>s.trainerId===trainer.id); const recs=db.attendance.filter(r=>sessions.some(s=>s.id===r.sessionId)); return { trainer, completedSessions:sessions.filter(s=>s.status==='Completed').length, uniqueAgentsCovered:new Set(recs.filter(r=>r.status==='Attended').map(r=>r.agentId)).size, totalAttendance:recs.length, trainingHours:Math.round(sessions.filter(s=>s.status==='Completed').reduce((n,s)=>n+s.durationMinutes,0)/60*10)/10, activeSessions:sessions.filter(s=>['Planned','In Progress'].includes(s.status)).length, sessionsThisMonth:sessions.filter(s=>s.sessionDate.startsWith(month)).length, activitiesParticipated:new Set(sessions.map(s=>s.activityId)).size }; }).sort((a,b)=>b.completedSessions-a.completedSessions || a.trainer.name.localeCompare(b.trainer.name)); }


function trainerFor(id:number) { return TRAINERS.find(t=>t.id===id) ?? { id, name:'Former trainer', role:'Trainer' }; }
function batchView(db:Db, b:Batch) {
  const trainees=db.batchTrainees.filter(t=>t.batchId===b.id);
  return { ...b, batchType:b.batchType==='Upskill'?'Upskill':'New Hire', trainer:trainerFor(b.trainerId), traineeCount:trainees.length, passedCount:trainees.filter(t=>t.certificationStatus==='Passed').length, nestingW1Count:trainees.filter(t=>t.stage==='Nesting W1').length, nestingW2Count:trainees.filter(t=>t.stage==='Nesting W2').length, activeCount:trainees.filter(t=>t.stage==='Active').length, failedCount:trainees.filter(t=>String(t.stage||'').startsWith('Failed')).length, graduatedCount:trainees.filter(t=>t.graduated).length };
}
function relatedTrainees(db:Db,t:BatchTrainee){
  const ids=new Set<number>([t.id]);
  for(const other of db.batchTrainees){
    const sameAgent=Boolean((t.agentId&&other.agentId===t.agentId)||(t.sourceAgentId&&other.sourceAgentId===t.sourceAgentId)||(t.agentId&&other.sourceAgentId===t.agentId)||(t.sourceAgentId&&other.agentId===t.sourceAgentId));
    const sameMis=Boolean(t.mis&&other.mis&&t.mis.trim().toLowerCase()===other.mis.trim().toLowerCase());
    const sameHr=Boolean(t.hrId&&other.hrId&&t.hrId.trim()===other.hrId.trim());
    if(sameAgent||sameMis||sameHr) ids.add(other.id);
  }
  return db.batchTrainees.filter(x=>ids.has(x.id));
}
function batchTraineeHistory(db:Db,t:BatchTrainee){
  const related=relatedTrainees(db,t); const traineeIds=new Set(related.map(x=>x.id));
  const batchHistory=related.map(x=>{const b=db.batches.find(z=>z.id===x.batchId);return {batchId:b?.batchId??'',batchDbId:b?.id??x.batchId,batchName:b?.name??'Unknown batch',batchType:b?.batchType??'New Hire',lob:b?.lob??'',trainer:b?trainerFor(b.trainerId):null,startDate:b?.startDate??'',stage:x.stage??'Training',certificationStatus:x.certificationStatus,knowledgeAttempt1:x.knowledgeAttempt1??'Pending',knowledgeAttempt2:x.knowledgeAttempt2??'Pending',mockAttempt1:x.mockAttempt1??'Pending',mockAttempt2:x.mockAttempt2??'Pending',mockCaseId1:x.mockCaseId1??null,mockCaseId2:x.mockCaseId2??null,nestingWeek1:x.nestingWeek1??'Pending',nestingWeek2:x.nestingWeek2??'Pending'};}).sort((a,b)=>String(b.startDate).localeCompare(String(a.startDate)));
  const rolePlayHistory=db.batchRolePlays.filter(r=>traineeIds.has(r.traineeId)).map(r=>{const bt=db.batchTrainees.find(x=>x.id===r.traineeId);const bb=bt?db.batches.find(x=>x.id===bt.batchId):undefined;return {...r,batchName:bb?.name??'',batchId:bb?.batchId??'',trainer:trainerFor(r.trainerId)};}).sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id);
  const agentIds=new Set<number>(); for(const x of related){if(x.agentId)agentIds.add(x.agentId);if(x.sourceAgentId)agentIds.add(x.sourceAgentId);} 
  const sessionHistory=db.attendance.filter(r=>agentIds.has(r.agentId)).map(r=>{const s=db.sessions.find(x=>x.id===r.sessionId);const a=s?db.activities.find(x=>x.id===s.activityId):undefined;return {sessionDbId:s?.id??null,sessionId:s?.sessionId??'',sessionTopic:s?.topic||s?.type||'',activityName:a?.name??'',date:s?.sessionDate??'',trainer:s?trainerFor(s.trainerId):null,attendanceStatus:r.status,result:r.result,notes:r.notes??''};}).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return {batchHistory,rolePlayHistory,sessionHistory};
}
function batchDetail(db:Db,id:number) {
  const b=db.batches.find(x=>x.id===id); if(!b) return undefined;
  const trainees=db.batchTrainees.filter(t=>t.batchId===id).map(t=>({...t, attendance:db.batchAttendance.filter(a=>a.traineeId===t.id).sort((a,b)=>a.dayNumber-b.dayNumber), quizRecords:db.batchQuiz.filter(q=>q.traineeId===t.id).sort((a,b)=>a.dayNumber-b.dayNumber), typingRecords:db.batchTyping.filter(x=>x.traineeId===t.id).sort((a,b)=>a.dayNumber-b.dayNumber||a.language.localeCompare(b.language)), rolePlays:db.batchRolePlays.filter(r=>r.traineeId===t.id).map(r=>({...r,trainer:trainerFor(r.trainerId)})).sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id), profileHistory:batchTraineeHistory(db,t)}));
  return {...batchView(db,b), trainees};
}
function examLinksView(db:Db) { return [...db.examLinks].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
const q = {
  dashboard:['dashboard'], activities:['activities'], sessions:['sessions'], agents:['agents'], coverage:['coverage'], headCount:['head-count'], updates:['updates'], workload:['workload'], batches:['batches'], examLinks:['exam-links']
} as const;
export const getListActivitiesQueryKey = () => q.activities;
export const getListSessionsQueryKey = () => q.sessions;
export const getListAgentsQueryKey = () => q.agents;
export const getListUpdatesQueryKey = () => q.updates;
export const getListBatchesQueryKey = () => q.batches;
export const getListExamLinksQueryKey = () => q.examLinks;
export const getGetActivityQueryKey = (id:number) => ['activity',id] as const;
export const getGetSessionQueryKey = (id:number) => ['session',id] as const;
export const getGetAgentQueryKey = (id:number) => ['agent',id] as const;
export const getGetBatchQueryKey = (id:number) => ['batch',id] as const;

export function useGetDashboard(){ return useQuery({queryKey:q.dashboard,queryFn:()=>dashboard(loadDb())}); }
export function useListActivities(){ return useQuery({queryKey:q.activities,queryFn:()=>loadDb().activities.map(a=>activityView(loadDb(),a)).sort((a,b)=>b.startDate.localeCompare(a.startDate)||a.name.localeCompare(b.name))}); }
export function useGetActivity(id:number,_opts?:any){ return useQuery({queryKey:getGetActivityQueryKey(id),queryFn:()=>activityDetail(loadDb(),id),enabled:Number.isFinite(id)}); }
export function useListSessions(){ return useQuery({queryKey:q.sessions,queryFn:()=>loadDb().sessions.map(s=>sessionView(loadDb(),s)).sort((a,b)=>b.sessionDate.localeCompare(a.sessionDate))}); }
export function useGetSession(id:number,_opts?:any){ return useQuery({queryKey:getGetSessionQueryKey(id),queryFn:()=>sessionDetail(loadDb(),id),enabled:Number.isFinite(id)}); }
export function useListAgents(params?:{includeArchived?:boolean}){ return useQuery({queryKey:[...q.agents,Boolean(params?.includeArchived)],queryFn:()=>activeAgents(loadDb(),Boolean(params?.includeArchived))}); }
export function useGetAgent(id:number,_opts?:any){ return useQuery({queryKey:getGetAgentQueryKey(id),queryFn:()=>agentDetail(loadDb(),id),enabled:Number.isFinite(id)}); }
export function useListCoverage(){ return useQuery({queryKey:q.coverage,queryFn:()=>coverageRows(loadDb())}); }
export function useGetHeadCount(){ return useQuery({queryKey:q.headCount,queryFn:()=>headCount(loadDb())}); }
export function useListUpdates(){ return useQuery({queryKey:q.updates,queryFn:()=>updatesView(loadDb())}); }
export function useListWorkload(){ return useQuery({queryKey:q.workload,queryFn:()=>workload(loadDb())}); }
export function useListBatches(){ return useQuery({queryKey:q.batches,queryFn:()=>loadDb().batches.map(b=>batchView(loadDb(),b)).sort((a,b)=>b.startDate.localeCompare(a.startDate))}); }
export function useGetBatch(id:number){ return useQuery({queryKey:getGetBatchQueryKey(id),queryFn:()=>batchDetail(loadDb(),id),enabled:Number.isFinite(id)}); }
export function useListExamLinks(){ return useQuery({queryKey:q.examLinks,queryFn:()=>examLinksView(loadDb())}); }

function useLocalMutation<TVars,TResult>(fn:(vars:TVars)=>TResult){ const qc=useQueryClient(); return useMutation({mutationFn:async(vars:TVars)=>fn(vars),onSuccess:()=>{ void qc.invalidateQueries(); if(typeof window!=='undefined') window.dispatchEvent(new CustomEvent('keeta-save-success',{detail:{message:'Saved successfully'}})); }}); }
export function useCreateAgent(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ requireAdmin('add agents'); const hr=String(data.hrId??'').trim(); const mis=String(data.mis??'').trim(); if(db.agents.some(a=>a.hrId.trim()===hr)) throw conflict(`Duplicate agent: HR ID ${hr} already exists.`); if(mis && db.agents.some(a=>a.mis.trim().toLowerCase()===mis.toLowerCase())) throw conflict(`Duplicate agent: MIS ${mis} already exists.`); const a:Agent={id:db.counters.agent++,hrId:hr,mis,name:data.name,lob:data.lob,employmentStatus:data.employmentStatus||'Active',dateAdded:data.dateAdded??new Date().toISOString().slice(0,10),notes:data.notes||null,archivedAt:null}; db.agents.push(a); log(db,'Agent Added',a.hrId); snapshot(db); return a; })); }
export function useBulkCreateAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ requireAdmin('import or add agents'); const incoming=(data.agents as any[]).map(a=>({...a,hrId:String(a.hrId??'').trim(),mis:String(a.mis??'').trim()})); const hrSeen=new Set<string>(), misSeen=new Set<string>(), conflicts:string[]=[]; for(const a of incoming){ const hr=a.hrId, mis=a.mis.toLowerCase(); if(hrSeen.has(hr)||db.agents.some(x=>x.hrId.trim()===hr)) conflicts.push(`HR ID ${hr}`); if(mis && (misSeen.has(mis)||db.agents.some(x=>x.mis.trim().toLowerCase()===mis))) conflicts.push(`MIS ${a.mis}`); hrSeen.add(hr); if(mis)misSeen.add(mis); } if(conflicts.length) throw conflict(`Duplicate agent data blocked: ${[...new Set(conflicts)].join(', ')}`); const created=incoming.map(data=>{ const a:Agent={id:db.counters.agent++,hrId:data.hrId,mis:data.mis,name:data.name,lob:data.lob,employmentStatus:data.employmentStatus||'Active',dateAdded:data.dateAdded??new Date().toISOString().slice(0,10),notes:data.notes||null,archivedAt:null}; db.agents.push(a); return a; }); log(db,'Agents Imported',`${created.length} agents`); snapshot(db); return {created,warnings:[]}; })); }
export function useUpdateAgent(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ requireAdmin('edit agents'); const a=db.agents.find(x=>x.id===id); if(!a) throw new Error('Agent not found'); const hr=data.hrId!==undefined?String(data.hrId).trim():a.hrId; const mis=data.mis!==undefined?String(data.mis).trim():a.mis; if(db.agents.some(x=>x.id!==id&&x.hrId.trim()===hr)) throw conflict(`Duplicate agent: HR ID ${hr} already exists.`); if(mis&&db.agents.some(x=>x.id!==id&&x.mis.trim().toLowerCase()===mis.toLowerCase())) throw conflict(`Duplicate agent: MIS ${mis} already exists.`); Object.assign(a,{...data,hrId:hr,mis}); log(db,data.lob?'Agent LOB Changed':'Agent Modified',a.hrId); snapshot(db); return a; })); }
export function useBulkUpdateAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ requireAdmin('edit agents'); const updated=db.agents.filter(a=>data.ids.includes(a.id)); for(const a of updated){ if(data.lob!==undefined)a.lob=data.lob; if(data.employmentStatus!==undefined)a.employmentStatus=data.employmentStatus; } log(db,'Agents Updated',`${updated.length} agents`); snapshot(db); return updated; })); }
function hasHistory(db:Db,id:number){ return db.attendance.some(r=>r.agentId===id)||db.activities.some(a=>a.requiredAgentIds.includes(id)); }
export function useDeleteAgent(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ requireAdmin('remove agents'); const a=db.agents.find(x=>x.id===id); if(!a) throw new Error('Agent not found'); if(hasHistory(db,id)){a.archivedAt=new Date().toISOString();log(db,'Agent Archived',a.hrId);snapshot(db);return {mode:'archived',agent:a};} db.agents=db.agents.filter(x=>x.id!==id);log(db,'Agent Deleted',a.hrId);snapshot(db);return {mode:'deleted'}; })); }
export function useBulkDeleteAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ requireAdmin('remove agents'); let deleted=0,archived=0; for(const id of data.ids){ const a=db.agents.find(x=>x.id===id); if(!a)continue; if(hasHistory(db,id)){a.archivedAt=new Date().toISOString();archived++;}else{db.agents=db.agents.filter(x=>x.id!==id);deleted++;} } log(db,'Agents Removed',`${deleted} deleted, ${archived} archived`);snapshot(db);return {deleted,archived}; })); }
export function useCreateActivity(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const owner=ownershipForCreate(); const a:Activity={id:db.counters.activity++,name:data.name,type:data.type,scope:data.scope,startDate:data.startDate,endDate:data.endDate,status:data.status,description:data.description||null,requiredAgentIds:data.requiredAgentIds??[],...owner}; db.activities.push(a);log(db,'Training Activity Created',a.name);return activityView(db,a); })); }
export function useUpdateActivity(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const a=db.activities.find(x=>x.id===id); if(!a)throw new Error('Training activity not found'); requireOwnerOrAdmin(a,'activity'); Object.assign(a,data);if(data.requiredAgentIds)a.requiredAgentIds=[...data.requiredAgentIds];log(db,'Training Activity Edited',a.name);return activityView(db,a); })); }
export function useDeleteActivity(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const a=db.activities.find(x=>x.id===id); if(!a) throw new Error('Training activity not found'); requireOwnerOrAdmin(a,'activity'); const sessionIds=db.sessions.filter(s=>s.activityId===id).map(s=>s.id); db.attendance=db.attendance.filter(r=>!sessionIds.includes(r.sessionId)); db.sessions=db.sessions.filter(s=>s.activityId!==id); db.updates=db.updates.map(u=>({...u,linkedActivities:(u.linkedActivities??[]).filter(activityId=>activityId!==id)})); db.activities=db.activities.filter(x=>x.id!==id); log(db,'Training Activity Deleted',a.name); return {deleted:true,id}; })); }
export function useCreateSession(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const activity=db.activities.find(a=>a.id===Number(data.activityId)); if(!activity) throw new Error('Training activity not found'); const requiredIds=new Set(activity.requiredAgentIds??[]); const activitySessionIds=new Set(db.sessions.filter(x=>x.activityId===activity.id).map(x=>x.id)); const coveredIds=new Set(db.attendance.filter(r=>activitySessionIds.has(r.sessionId)&&r.status==='Attended').map(r=>r.agentId)); const requestedIds=Array.isArray(data.agentIds)?data.agentIds.map(Number):[]; const agentIds=Array.from(new Set(requestedIds)).filter(agentId=>requiredIds.has(agentId)&&!coveredIds.has(agentId)&&db.agents.some(a=>a.id===agentId)); if(!agentIds.length) throw new Error('Select at least one pending agent for this session. Agents already covered are not available.'); const id=db.counters.session++; const owner=ownershipForCreate(); const actor=currentActor(); const trainerId=actor?.isAdmin?Number(data.trainerId):Number(actor?.id??data.trainerId); const s:Session={id,sessionId:`S${String(id).padStart(3,'0')}`,activityId:activity.id,sessionDate:data.sessionDate,trainerId,lob:data.lob,type:data.type,topic:data.topic||null,durationMinutes:Number(data.durationMinutes)||0,status:data.status,notes:data.notes||null,...owner};db.sessions.push(s);for(const agentId of agentIds){db.attendance.push({id:db.counters.attendance++,sessionId:s.id,agentId,status:'Absent',result:null,notes:null});}log(db,'Session Created',`${s.sessionId} · ${agentIds.length} agents`,TRAINERS.find(t=>t.id===s.trainerId)?.name??null);return sessionView(db,s); })); }
export function useUpdateSession(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const s=db.sessions.find(x=>x.id===id);if(!s)throw new Error('Session not found'); const actor=currentActor(); if(!actor || (!actor.isAdmin && Number(s.trainerId)!==actor.id)) throw conflict('Only the responsible trainer for this session or Mustafa (Main Admin) can edit it.'); const activity=db.activities.find(a=>a.id===s.activityId); if(!activity) throw new Error('Training activity not found'); if(Array.isArray(data.agentIds)){ const requiredIds=new Set(activity.requiredAgentIds??[]); const currentIds=new Set(db.attendance.filter(r=>r.sessionId===id).map(r=>r.agentId)); const otherSessionIds=new Set(db.sessions.filter(x=>x.activityId===activity.id&&x.id!==id).map(x=>x.id)); const coveredElsewhere=new Set(db.attendance.filter(r=>otherSessionIds.has(r.sessionId)&&r.status==='Attended').map(r=>r.agentId)); const requested=Array.from(new Set(data.agentIds.map((x:any)=>Number(x)))); const allowed=requested.filter((agentId:number)=>requiredIds.has(agentId)&&db.agents.some(a=>a.id===agentId)&&(currentIds.has(agentId)||!coveredElsewhere.has(agentId))); if(!allowed.length) throw conflict('Keep at least one eligible agent in the session. Agents already covered in another session cannot be added.'); const allowedSet=new Set(allowed); db.attendance=db.attendance.filter(r=>r.sessionId!==id||allowedSet.has(r.agentId)); for(const agentId of allowed){ if(!db.attendance.some(r=>r.sessionId===id&&r.agentId===agentId)) db.attendance.push({id:db.counters.attendance++,sessionId:id,agentId,status:'Absent',result:null,notes:null}); } }
 const {agentIds,...sessionData}=data; Object.assign(s,sessionData); log(db,'Session Edited',s.sessionId,TRAINERS.find(t=>t.id===s.trainerId)?.name??null);return sessionView(db,s); })); }
export function useDeleteSession(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const s=db.sessions.find(x=>x.id===id); if(!s) throw new Error('Session not found'); requireOwnerOrAdmin(s,'session'); db.attendance=db.attendance.filter(r=>r.sessionId!==id); db.sessions=db.sessions.filter(x=>x.id!==id); log(db,'Session Deleted',s.sessionId); return {deleted:true,id,activityId:s.activityId}; })); }
export function useReplaceSessionAttendance(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const s=db.sessions.find(x=>x.id===id);if(!s)throw new Error('Session not found'); const actor=currentActor(); if(!actor || (!actor.isAdmin && Number(s.trainerId)!==actor.id)) throw conflict('Only the responsible trainer for this session or Mustafa (Main Admin) can update attendance.'); const incoming=data as any[]; const incomingIds=new Set(incoming.map(r=>r.agentId)); db.attendance=db.attendance.filter(r=>r.sessionId!==id||incomingIds.has(r.agentId)); for(const r of incoming){ const existing=db.attendance.find(a=>a.sessionId===id&&a.agentId===r.agentId); if(existing){ existing.status=r.status; existing.result=r.status==='Attended'?(r.result??null):null; existing.notes=r.notes||null; } else { db.attendance.push({id:db.counters.attendance++,sessionId:id,agentId:r.agentId,status:r.status,result:r.status==='Attended'?(r.result??null):null,notes:r.notes||null}); } } log(db,'Attendance Updated',s.sessionId);return sessionDetail(db,id)?.attendance??[]; })); }
export function useCreateUpdate(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const id=db.counters.update++; const u:TrainingUpdate={id,updateId:`U${String(id).padStart(3,'0')}`,title:data.title,description:data.description||null,scope:data.scope,releaseDate:data.releaseDate,deadline:data.deadline||null,status:data.status,linkedActivities:data.linkedActivities??[],notes:data.notes||null};db.updates.push(u);log(db,'Update Created',u.updateId);return {...u,coveragePercent:0}; })); }
export function useUpdateTrainingUpdate(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const u=db.updates.find(x=>x.id===id);if(!u)throw new Error('Update not found');Object.assign(u,data);log(db,'Update Modified',u.updateId);return updatesView(db).find(x=>x.id===id); })); }


export function useCreateBatch(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{
  const id=db.counters.batch++; const duration=Math.max(1,Number(data.durationDays)||1); const start=new Date(`${data.startDate}T00:00:00`); const dayDates=Array.from({length:duration},(_,i)=>{ const d=new Date(start); d.setDate(d.getDate()+i); return d.toISOString().slice(0,10); });
  const batchType:BatchType=data.batchType==='Upskill'?'Upskill':'New Hire'; const owner=ownershipForCreate(); const actor=currentActor(); const trainerId=actor?.isAdmin?Number(data.trainerId):Number(actor?.id??data.trainerId); const b:Batch={id,batchId:`B${String(id).padStart(3,'0')}`,name:data.name,batchType,lob:data.lob,trainerId,startDate:data.startDate,durationDays:duration,status:'In Training',notes:data.notes||null,dayDates,createdAt:new Date().toISOString(),...owner}; db.batches.push(b);
  if(batchType==='Upskill'){ const ids=new Set<number>((data.agentIds??[]).map((x:any)=>Number(x))); for(const a of activeAgents(db).filter(a=>a.employmentStatus==='Active'&&ids.has(a.id))) db.batchTrainees.push({id:db.counters.batchTrainee++,batchId:id,sourceAgentId:a.id,name:a.name,mis:a.mis,hrId:a.hrId,jw:null,email:null,portalPassword:null,phoneNumber:null,notes:a.notes,quizScore:null,quizResult:'Pending',quizNotes:null,typingWpm:null,typingAccuracy:null,typingResult:'Pending',typingNotes:null,knowledgeAttempt1:'Pending',knowledgeAttempt2:'Pending',mockAttempt1:'Pending',mockAttempt2:'Pending',mockCaseId1:null,mockCaseId2:null,nestingWeek1:'Pending',nestingWeek2:'Pending',stage:'Training',finalScore:null,finalNotes:null,certificationStatus:'Pending',graduated:false,agentId:null,addedByUserId:owner.createdByUserId,addedByName:owner.createdByName}); } else { const names=(data.traineeNames??[]).map((x:string)=>x.trim()).filter(Boolean); for(const name of names) db.batchTrainees.push({id:db.counters.batchTrainee++,batchId:id,sourceAgentId:null,name,mis:null,hrId:null,jw:null,email:null,portalPassword:null,phoneNumber:null,notes:null,quizScore:null,quizResult:'Pending',quizNotes:null,typingWpm:null,typingAccuracy:null,typingResult:'Pending',typingNotes:null,knowledgeAttempt1:'Pending',knowledgeAttempt2:'Pending',mockAttempt1:'Pending',mockAttempt2:'Pending',mockCaseId1:null,mockCaseId2:null,nestingWeek1:'Pending',nestingWeek2:'Pending',stage:'Training',finalScore:null,finalNotes:null,certificationStatus:'Pending',graduated:false,agentId:null,addedByUserId:owner.createdByUserId,addedByName:owner.createdByName}); }
  log(db,'Batch Created',`${b.batchId} · ${b.name}`); return batchView(db,b);
})); }
export function useUpdateBatch(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const b=db.batches.find(x=>x.id===id); if(!b) throw new Error('Batch not found'); const actor=requireBatchManager(b,'edit it'); const patch={...data}; if(!actor.isAdmin) patch.trainerId=b.trainerId; Object.assign(b,patch); if(data.durationDays){ const duration=Math.max(1,Number(data.durationDays)); b.durationDays=duration; while(b.dayDates.length<duration){ const prev=b.dayDates.at(-1)??b.startDate; const d=new Date(`${prev}T00:00:00`); d.setDate(d.getDate()+1); b.dayDates.push(d.toISOString().slice(0,10)); } b.dayDates=b.dayDates.slice(0,duration); } log(db,'Batch Updated',b.batchId); return batchView(db,b); })); }
export function useAddBatchTrainees(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const b=db.batches.find(x=>x.id===id); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'add participants'); const created:BatchTrainee[]=[]; const actor=currentActor(); const addedByUserId=actor?.id??null; const addedByName=actor?.name??null; if(b.batchType==='Upskill'){ const existing=new Set(db.batchTrainees.filter(t=>t.batchId===id).map(t=>t.sourceAgentId).filter(Boolean)); const ids=new Set<number>((data.agentIds??[]).map((x:any)=>Number(x))); for(const a of activeAgents(db).filter(a=>a.employmentStatus==='Active'&&ids.has(a.id)&&!existing.has(a.id))){ const t:BatchTrainee={id:db.counters.batchTrainee++,batchId:id,sourceAgentId:a.id,name:a.name,mis:a.mis,hrId:a.hrId,jw:null,email:null,portalPassword:null,phoneNumber:null,notes:a.notes,quizScore:null,quizResult:'Pending',quizNotes:null,typingWpm:null,typingAccuracy:null,typingResult:'Pending',typingNotes:null,knowledgeAttempt1:'Pending',knowledgeAttempt2:'Pending',mockAttempt1:'Pending',mockAttempt2:'Pending',mockCaseId1:null,mockCaseId2:null,nestingWeek1:'Pending',nestingWeek2:'Pending',stage:'Training',finalScore:null,finalNotes:null,certificationStatus:'Pending',graduated:false,agentId:null,addedByUserId,addedByName}; db.batchTrainees.push(t); created.push(t); } log(db,'Upskill Participants Added',`${b.batchId} · ${created.length} agents`); } else { for(const name of (data.names??[]).map((x:string)=>x.trim()).filter(Boolean)){ const t:BatchTrainee={id:db.counters.batchTrainee++,batchId:id,sourceAgentId:null,name,mis:null,hrId:null,jw:null,email:null,portalPassword:null,phoneNumber:null,notes:null,quizScore:null,quizResult:'Pending',quizNotes:null,typingWpm:null,typingAccuracy:null,typingResult:'Pending',typingNotes:null,knowledgeAttempt1:'Pending',knowledgeAttempt2:'Pending',mockAttempt1:'Pending',mockAttempt2:'Pending',mockCaseId1:null,mockCaseId2:null,nestingWeek1:'Pending',nestingWeek2:'Pending',stage:'Training',finalScore:null,finalNotes:null,certificationStatus:'Pending',graduated:false,agentId:null,addedByUserId,addedByName}; db.batchTrainees.push(t); created.push(t); } log(db,'New Hires Added',`${b.batchId} · ${created.length} new hires`); } return created; })); }
export function useUpdateBatchTrainee(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const t=db.batchTrainees.find(x=>x.id===id); if(!t) throw new Error('New hire not found'); const b=db.batches.find(x=>x.id===t.batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'update participant data'); const clean={...data}; if(clean.jw!==undefined && clean.mis===undefined) clean.mis=clean.jw; delete clean.jw; Object.assign(t,clean); syncTraineeStage(db,t,b); const keys=Object.keys(clean??{}); const action=keys.some(k=>['email','portalPassword','phoneNumber','mis','hrId','name','notes'].includes(k))?'Batch Information Updated':keys.some(k=>['knowledgeAttempt1','knowledgeAttempt2','mockAttempt1','mockAttempt2','mockCaseId1','mockCaseId2','nestingWeek1','nestingWeek2'].includes(k))?'Batch Certification / Nesting Updated':keys.some(k=>['certificationStatus','finalScore','finalNotes'].includes(k))?'Batch Result Updated':'New Hire Updated'; log(db,action,`${b.batchId} · ${t.name}`); snapshot(db); return {...t}; })); }
export function useSaveBatchInformation(){ return useLocalMutation<any,any>(({batchId,rows})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'save batch information'); for(const row of rows as any[]){ const t=db.batchTrainees.find(x=>x.id===row.id&&x.batchId===batchId); if(!t) continue; Object.assign(t,{name:row.name,mis:row.mis||null,hrId:row.hrId||null,jw:null,email:row.email||null,portalPassword:row.portalPassword||null,phoneNumber:row.phoneNumber||null,notes:row.notes||null}); syncTraineeStage(db,t,b); } log(db,'Batch Information Updated',`${b.batchId} · Save All`); snapshot(db); return batchDetail(db,batchId); })); }
export function useSaveBatchDayAttendance(){ return useLocalMutation<any,any>(({batchId,dayNumber,date,rows})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'save attendance'); const idx=Number(dayNumber)-1; if(idx>=0&&idx<b.durationDays) b.dayDates[idx]=date; for(const row of rows as any[]){ let rec=db.batchAttendance.find(a=>a.batchId===batchId&&a.traineeId===row.traineeId&&a.dayNumber===dayNumber); if(rec){rec.status=row.status;rec.notes=row.notes||null;rec.date=date;} else db.batchAttendance.push({id:db.counters.batchAttendance++,batchId,traineeId:row.traineeId,dayNumber,date,status:row.status,notes:row.notes||null}); } log(db,'Batch Attendance Updated',`${b.batchId} · Day ${dayNumber}`); return batchDetail(db,batchId); })); }
export function useSaveBatchDayQuiz(){ return useLocalMutation<any,any>(({batchId,dayNumber,date,rows})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'save quizzes'); const idx=Number(dayNumber)-1; if(idx>=0&&idx<b.durationDays) b.dayDates[idx]=date; for(const row of rows as any[]){ let rec=db.batchQuiz.find(q=>q.batchId===batchId&&q.traineeId===row.traineeId&&q.dayNumber===dayNumber); if(rec){rec.score=row.score||null;rec.result=row.result||'Pending';rec.notes=row.notes||null;rec.date=date;} else db.batchQuiz.push({id:db.counters.batchQuiz++,batchId,traineeId:row.traineeId,dayNumber,date,score:row.score||null,result:row.result||'Pending',notes:row.notes||null}); } log(db,'Batch Quiz Updated',`${b.batchId} · Day ${dayNumber}`); return batchDetail(db,batchId); })); }
export function useSaveBatchDayTyping(){ return useLocalMutation<any,any>(({batchId,dayNumber,date,rows})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'save typing tests'); const idx=Number(dayNumber)-1; if(idx>=0&&idx<b.durationDays) b.dayDates[idx]=date; for(const row of rows as any[]){ for(const language of ['Arabic','English'] as TypingLanguage[]){ const src=language==='Arabic'?row.arabic:row.english; let rec=db.batchTyping.find(x=>x.batchId===batchId&&x.traineeId===row.traineeId&&x.dayNumber===dayNumber&&x.language===language); if(rec){rec.wpm=src?.wpm||null;rec.accuracy=src?.accuracy||null;rec.result=src?.result||'Pending';rec.notes=src?.notes||null;rec.date=date;} else db.batchTyping.push({id:db.counters.batchTyping++,batchId,traineeId:row.traineeId,dayNumber,date,language,wpm:src?.wpm||null,accuracy:src?.accuracy||null,result:src?.result||'Pending',notes:src?.notes||null}); } } log(db,'Batch Typing Test Updated',`${b.batchId} · Day ${dayNumber}`); return batchDetail(db,batchId); })); }
export function useAddBatchRolePlay(){ return useLocalMutation<any,any>(({batchId,data})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'add role plays'); const t=db.batchTrainees.find(x=>x.id===Number(data.traineeId)&&x.batchId===batchId); if(!t) throw conflict('Participant not found in this batch.'); const actor=currentActor(); if(!actor) throw conflict('Sign in again to add a role play.'); const caseId=String(data.caseId??'').trim(); if(!caseId) throw conflict('Case ID is required.'); const rec:BatchRolePlay={id:db.counters.batchRolePlay++,batchId,traineeId:t.id,date:String(data.date||new Date().toISOString().slice(0,10)),caseId,trainerId:actor.id,result:(data.result||'Completed') as any,notes:data.notes?String(data.notes):null,createdAt:new Date().toISOString()}; db.batchRolePlays.push(rec); log(db,'Batch Role Play Added',`${b.batchId} · ${t.name} · Case ${caseId}`); return batchDetail(db,batchId); })); }
export function useDeleteBatchRolePlay(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const rec=db.batchRolePlays.find(x=>x.id===id); if(!rec) throw new Error('Role play not found'); const b=db.batches.find(x=>x.id===rec.batchId); if(!b) throw new Error('Batch not found'); requireBatchManager(b,'delete role plays'); db.batchRolePlays=db.batchRolePlays.filter(x=>x.id!==id); log(db,'Batch Role Play Deleted',`${b.batchId} · Case ${rec.caseId}`); return {deleted:true}; })); }
export function useDeleteBatchTrainee(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const t=db.batchTrainees.find(x=>x.id===id); if(!t) throw new Error('Participant not found'); const b=db.batches.find(x=>x.id===t.batchId); if(!b) throw new Error('Batch not found'); const actor=currentActor(); const canDelete=Boolean(actor&&(actor.isAdmin||Number(t.addedByUserId)===actor.id||(!t.addedByUserId&&Number(b.createdByUserId)===actor.id))); if(!canDelete) throw conflict('You can remove only participants you added. Mustafa can remove anyone.'); db.batchAttendance=db.batchAttendance.filter(x=>x.traineeId!==id); db.batchQuiz=db.batchQuiz.filter(x=>x.traineeId!==id); db.batchTyping=db.batchTyping.filter(x=>x.traineeId!==id); db.batchRolePlays=db.batchRolePlays.filter(x=>x.traineeId!==id); db.batchTrainees=db.batchTrainees.filter(x=>x.id!==id); log(db,'Batch Participant Removed',`${b.batchId} · ${t.name}`); return {deleted:true}; })); }
export function useGraduateBatchTrainees(){ return useLocalMutation<any,any>(({batchId,traineeIds})=>withDb(db=>{ const b=db.batches.find(x=>x.id===batchId); if(!b) throw new Error('Batch not found'); const actor=currentActor(); const canGraduate=Boolean(actor && (actor.isAdmin || Number(b.trainerId)===actor.id || (b.createdByUserId!=null && Number(b.createdByUserId)===actor.id) || Boolean(b.createdByName && b.createdByName===actor.name))); if(!canGraduate) throw conflict('Only Mustafa (Main Admin) or the trainer who owns this batch can graduate new hires into Agents / Head Count.'); if(b.batchType==='Upskill') throw conflict('Upskill batches already contain official agents and do not need graduation.'); const ids=new Set<number>(traineeIds); const targets=db.batchTrainees.filter(t=>t.batchId===batchId&&ids.has(t.id)); const graduated:any[]=[]; for(const t of targets){ if(t.graduated) continue; if(t.certificationStatus!=='Passed') throw conflict(`${t.name} has not passed Certification yet.`); if(!t.hrId?.trim()||!t.mis?.trim()) throw conflict(`Add HR ID and MIS for ${t.name} before graduation.`); if(db.agents.some(a=>a.hrId.trim()===t.hrId.trim())) throw conflict(`Duplicate agent: HR ID ${t.hrId} already exists in Agents.`); if(db.agents.some(a=>a.mis.trim().toLowerCase()===t.mis.trim().toLowerCase())) throw conflict(`Duplicate agent: MIS ${t.mis} already exists in Agents.`); const a:Agent={id:db.counters.agent++,hrId:t.hrId.trim(),mis:t.mis.trim(),name:t.name,lob:b.lob,employmentStatus:'Active',trainingStage:(t.stage??'Nesting W1') as any,dateAdded:new Date().toISOString().slice(0,10),notes:t.notes||`Graduated from ${b.name}`,archivedAt:null}; db.agents.push(a); t.graduated=true; t.agentId=a.id; graduated.push(a); }
  if(graduated.length){ snapshot(db); log(db,'New Hires Graduated',`${b.batchId} · ${graduated.length} moved to Agents / Head Count`); } return graduated;
})); }
export function useDeleteBatch(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const b=db.batches.find(x=>x.id===id); if(!b) throw new Error('Batch not found'); requireOwnerOrAdmin(b,'batch'); const traineeIds=db.batchTrainees.filter(t=>t.batchId===id).map(t=>t.id); db.batchAttendance=db.batchAttendance.filter(a=>!traineeIds.includes(a.traineeId)); db.batchQuiz=db.batchQuiz.filter(q=>!traineeIds.includes(q.traineeId)); db.batchTyping=db.batchTyping.filter(x=>!traineeIds.includes(x.traineeId)); db.batchRolePlays=db.batchRolePlays.filter(x=>!traineeIds.includes(x.traineeId)); db.batchTrainees=db.batchTrainees.filter(t=>t.batchId!==id); db.batches=db.batches.filter(x=>x.id!==id); log(db,'Batch Deleted',b.batchId); return {deleted:true}; })); }

export function useCreateExamLink(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ let actor='Unknown'; try{actor=JSON.parse(sessionStorage.getItem('keeta-current-user-v1')||'null')?.name||'Unknown';}catch{} const current=currentActor(); const kind = data.itemKind === 'Question Bank' ? 'Question Bank' : 'Exam Package'; const e:ExamLink={id:db.counters.examLink++,itemKind:kind,title:data.title,lob:data.lob,type:data.type||'Quiz',url:kind==='Question Bank'?null:(data.url||null),notes:data.notes||null,status:data.status||'Active',addedBy:actor,createdAt:new Date().toISOString(),createdByUserId:current?.id??null}; db.examLinks.push(e); log(db,kind==='Question Bank'?'Question Bank Added':'Exam Package Added',e.title); return e; })); }
export function useUpdateExamLink(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const e=db.examLinks.find(x=>x.id===id); if(!e) throw new Error('Exam item not found'); requireOwnerOrAdmin(e,'exam item'); const nextKind=data.itemKind??e.itemKind; Object.assign(e,data,{itemKind:nextKind,url:nextKind==='Question Bank'?null:(data.url??e.url)}); log(db,nextKind==='Question Bank'?'Question Bank Updated':'Exam Package Updated',e.title); return {...e}; })); }
export function useDeleteExamLink(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const e=db.examLinks.find(x=>x.id===id); if(!e) throw new Error('Exam item not found'); requireOwnerOrAdmin(e,'exam item'); db.examLinks=db.examLinks.filter(x=>x.id!==id); log(db,e.itemKind==='Question Bank'?'Question Bank Deleted':'Exam Package Deleted',e.title); return {deleted:true}; })); }

export function getAuthUsers(): AuthUser[] { return loadDb().users.map(u => ({...u})); }
export function setUserPasswordHash(id:number, passwordHash:string) { return withDb(db=>{ const u=db.users.find(x=>x.id===id); if(!u) throw new Error('User not found'); u.passwordHash=passwordHash; log(db,'Password Set',u.name); return {...u}; }); }
export function updateAuthUser(id:number, patch:Partial<AuthUser>) { return withDb(db=>{ const u=db.users.find(x=>x.id===id); if(!u) throw new Error('User not found'); if(u.isAdmin && (patch.frozen || patch.isAdmin===false)) throw new Error('Main admin cannot be frozen or demoted.'); Object.assign(u,patch); log(db, patch.passwordHash===null?'User Password Reset':patch.frozen===true?'User Frozen':patch.frozen===false?'User Unfrozen':'User Updated',u.name); return {...u}; }); }
export function deleteAuthUser(id:number) { return withDb(db=>{
  const u=db.users.find(x=>x.id===id);
  if(!u) throw new Error('User not found');
  if(u.isAdmin) throw new Error('Main admin cannot be deleted.');

  // Removing a user means removing LOGIN ACCESS ONLY.
  // Training history is intentionally preserved: sessions keep trainerId,
  // attendance stays attached to those sessions, workload remains countable,
  // and historical activity/logs continue to show the trainer's name.
  db.users=db.users.filter(x=>x.id!==id);
  log(db,'User Access Removed',u.name);
  return { removedUserId:id, trainerName:u.name, historyPreserved:true };
}); }

// Full-workspace backup / restore. These are intentionally admin-facing helpers.
// A backup includes the complete shared workspace state: agents, activities, sessions,
// attendance, batches, exams/question banks, logs, snapshots, users and counters.
export type BackupRange = { from?: string | null; to?: string | null };

function dateOnly(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}
function backupDateInRange(value: string | null | undefined, range?: BackupRange) {
  if (!range?.from && !range?.to) return true;
  const d = dateOnly(value);
  if (!d) return false;
  return (!range.from || d >= range.from) && (!range.to || d <= range.to);
}
function backupPeriodOverlaps(start: string | null | undefined, end: string | null | undefined, range?: BackupRange) {
  if (!range?.from && !range?.to) return true;
  const s = dateOnly(start); const e = dateOnly(end) || s;
  if (!s && !e) return false;
  return (!range.from || e >= range.from) && (!range.to || s <= range.to);
}
function buildWorkspaceBackup(range?: BackupRange) {
  const db = loadDb();
  const filtered = Boolean(range?.from || range?.to);
  if (!filtered) return db;

  const sessions = db.sessions.filter(s => backupDateInRange(s.sessionDate, range));
  const selectedSessionIds = new Set(sessions.map(s => s.id));
  const selectedActivityIds = new Set(sessions.map(s => s.activityId));
  db.activities.forEach(a => { if (backupPeriodOverlaps(a.startDate, a.endDate, range)) selectedActivityIds.add(a.id); });
  const activities = db.activities.filter(a => selectedActivityIds.has(a.id));

  const attendance = db.attendance.filter(a => selectedSessionIds.has(a.sessionId));
  const selectedAgentIds = new Set<number>();
  activities.forEach(a => a.requiredAgentIds.forEach(id => selectedAgentIds.add(id)));
  attendance.forEach(a => selectedAgentIds.add(a.agentId));
  db.agents.forEach(a => { if (backupDateInRange(a.dateAdded, range)) selectedAgentIds.add(a.id); });

  const batches = db.batches.filter(b => {
    const dates = (b.dayDates ?? []).filter(Boolean);
    if (dates.some(d => backupDateInRange(d, range))) return true;
    const last = dates[dates.length - 1] ?? b.startDate;
    return backupPeriodOverlaps(b.startDate, last, range);
  });
  const selectedBatchIds = new Set(batches.map(b => b.id));
  const batchTrainees = db.batchTrainees.filter(t => selectedBatchIds.has(t.batchId));
  batchTrainees.forEach(t => { if (t.sourceAgentId) selectedAgentIds.add(t.sourceAgentId); if (t.agentId) selectedAgentIds.add(t.agentId); });
  const batchAttendance = db.batchAttendance.filter(x => selectedBatchIds.has(x.batchId) && backupDateInRange(x.date, range));
  const batchQuiz = db.batchQuiz.filter(x => selectedBatchIds.has(x.batchId) && backupDateInRange(x.date, range));
  const batchTyping = db.batchTyping.filter(x => selectedBatchIds.has(x.batchId) && backupDateInRange(x.date, range));
  const batchRolePlays = db.batchRolePlays.filter(x => selectedBatchIds.has(x.batchId) && backupDateInRange(x.date, range));

  const agents = db.agents.filter(a => selectedAgentIds.has(a.id));
  const examLinks = db.examLinks.filter(e => backupDateInRange(e.createdAt, range));
  const logs = db.logs.filter(l => backupDateInRange(l.createdAt, range));
  const snapshots = db.snapshots.filter(s => {
    const monthStart = `${s.month}-01`;
    const monthEnd = `${s.month}-31`;
    return backupPeriodOverlaps(monthStart, monthEnd, range);
  });
  const updates = db.updates.filter(u => backupPeriodOverlaps(u.releaseDate, u.deadline ?? u.releaseDate, range));

  return {
    ...db,
    agents, activities, sessions, attendance, updates, batches, batchTrainees, batchAttendance, batchQuiz, batchTyping, batchRolePlays, examLinks, logs, snapshots,
    // Keep all users and counters so ownership and IDs remain understandable in the archive.
    users: db.users,
    counters: db.counters,
  } as Db;
}

export function exportWorkspaceBackup(range?: BackupRange) {
  requireAdmin('download a system backup');
  const filtered = Boolean(range?.from || range?.to);
  return JSON.stringify({
    format: 'keeta-training-team-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    scope: filtered ? 'date-range' : 'all-period',
    range: filtered ? { from: range?.from ?? null, to: range?.to ?? null } : null,
    data: buildWorkspaceBackup(range),
  }, null, 2);
}
export function importWorkspaceBackup(json: string) {
  const actor = requireAdmin('restore a full system backup');
  const parsed = JSON.parse(json) as any;
  if (parsed?.format === 'keeta-training-team-backup' && parsed?.scope === 'date-range') {
    throw conflict('Date-range backups are archive/export files only. Restore requires an All period backup so existing workspace data is not accidentally erased.');
  }
  const payload = parsed?.format === 'keeta-training-team-backup' ? parsed.data : parsed;
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.agents) || !Array.isArray(payload.activities) || !Array.isArray(payload.sessions) || !Array.isArray(payload.users)) {
    throw conflict('This file is not a valid Keeta Training Team backup.');
  }
  const base = emptyDb();
  const restored = { ...base, ...payload, counters: { ...base.counters, ...(payload.counters ?? {}) } } as Db;
  restored.logs = Array.isArray(restored.logs) ? restored.logs : [];
  restored.logs.unshift({ id: restored.counters.log++, action: 'Full System Restored', relatedRecord: parsed?.exportedAt ? `Backup from ${parsed.exportedAt}` : 'Imported backup', trainer: actor.name, createdAt: new Date().toISOString() });
  saveDb(restored);
  return { restored: true, exportedAt: parsed?.exportedAt ?? null };
}
// Backward-compatible aliases kept for any older code paths.
export function exportLocalDatabase() { return JSON.stringify(loadDb(), null, 2); }
export function importLocalDatabase(json: string) { const parsed = JSON.parse(json) as Db; saveDb({ ...emptyDb(), ...parsed, counters: { ...emptyDb().counters, ...(parsed.counters ?? {}) } }); }
export function clearLocalDatabase() { localStorage.removeItem(STORAGE_KEY); }

/**
 * Call once when the app starts. Pulls the latest shared database from
 * Firestore (if one exists) and keeps listening for changes made by
 * teammates on other devices, refreshing the UI whenever new data arrives.
 * If nothing exists in the cloud yet, seeds it with whatever is stored
 * locally so the very first device to run this becomes the starting point.
 */
export async function initCloudSync(onRemoteUpdate: () => void) {
  const remoteJson = await pullFromCloud();
  if (remoteJson) {
    localStorage.setItem(STORAGE_KEY, remoteJson);
    onRemoteUpdate();
  } else {
    pushToCloud(loadDb());
  }
  subscribeToCloud((json) => {
    localStorage.setItem(STORAGE_KEY, json);
    onRemoteUpdate();
  });
}
