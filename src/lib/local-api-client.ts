import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const Lob = {
  'C-Side': 'C-Side',
  'BD-Side': 'BD-Side',
  'DC&Calls-Side': 'DC&Calls-Side',
  Kfood: 'Kfood',
  CM: 'CM',
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

type Agent = { id: number; hrId: string; mis: string; name: string; lob: Lob; employmentStatus: AgentStatus; dateAdded: string; notes: string | null; archivedAt: string | null };
type Activity = { id: number; name: string; type: ActivityType | string; scope: Lob[]; startDate: string; endDate: string; status: ActivityStatus | string; description: string | null; requiredAgentIds: number[] };
type Session = { id: number; sessionId: string; activityId: number; sessionDate: string; trainerId: number; lob: Lob; type: SessionType | string; topic: string | null; durationMinutes: number; status: SessionStatus | string; notes: string | null };
type Attendance = { id: number; sessionId: number; agentId: number; status: AttendanceStatus | string; result: number | null; notes: string | null };
type TrainingUpdate = { id: number; updateId: string; title: string; description: string | null; scope: Lob[]; releaseDate: string; deadline: string | null; status: UpdateStatus | string; linkedActivities: number[]; notes: string | null };
type Log = { id: number; action: string; relatedRecord: string | null; trainer: string | null; createdAt: string };
type Snapshot = { month: string; lob: Lob; active: number; inactive: number; transferred: number; onLeave: number; total: number };
type Db = {
  agents: Agent[];
  activities: Activity[];
  sessions: Session[];
  attendance: Attendance[];
  updates: TrainingUpdate[];
  logs: Log[];
  snapshots: Snapshot[];
  counters: { agent: number; activity: number; session: number; attendance: number; update: number; log: number };
};

const emptyDb = (): Db => ({
  agents: [], activities: [], sessions: [], attendance: [], updates: [], logs: [], snapshots: [],
  counters: { agent: 1, activity: 1, session: 1, attendance: 1, update: 1, log: 1 },
});

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as Partial<Db>;
    return { ...emptyDb(), ...parsed, counters: { ...emptyDb().counters, ...(parsed.counters ?? {}) } } as Db;
  } catch {
    return emptyDb();
  }
}
function saveDb(db: Db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function withDb<T>(fn: (db: Db) => T): T { const db = loadDb(); const out = fn(db); saveDb(db); return out; }
function activeAgents(db: Db, includeArchived = false) { return db.agents.filter(a => includeArchived || !a.archivedAt).sort((a,b) => a.name.localeCompare(b.name)); }
function log(db: Db, action: string, relatedRecord: string | null, trainer: string | null = null) { db.logs.unshift({ id: db.counters.log++, action, relatedRecord, trainer, createdAt: new Date().toISOString() }); db.logs = db.logs.slice(0, 100); }
function snapshot(db: Db) {
  const month = new Date().toISOString().slice(0,7);
  db.snapshots = db.snapshots.filter(s => s.month !== month);
  for (const lob of LOBS) {
    const rows = activeAgents(db).filter(a => a.lob === lob);
    db.snapshots.push({ month, lob, active: rows.filter(a=>a.employmentStatus==='Active').length, inactive: rows.filter(a=>a.employmentStatus==='Inactive').length, transferred: rows.filter(a=>a.employmentStatus==='Transferred').length, onLeave: rows.filter(a=>a.employmentStatus==='On Leave').length, total: rows.length });
  }
}
function conflict(message: string) { const e: any = new Error(message); e.response = { data: { error: message } }; return e; }

function activityCoverage(db: Db, activityId: number) {
  const activity = db.activities.find(a => a.id === activityId);
  const requiredIds = activity?.requiredAgentIds ?? [];
  const completedSessionIds = db.sessions.filter(s => s.activityId === activityId && s.status === 'Completed').map(s => s.id);
  const records = db.attendance.filter(r => completedSessionIds.includes(r.sessionId) && requiredIds.includes(r.agentId));
  const coveredIds = new Set(records.filter(r => r.status === 'Attended').map(r => r.agentId));
  return { requiredIds, coveredIds, records };
}
function activityView(db: Db, a: Activity) {
  const cov = activityCoverage(db, a.id); const sessions = db.sessions.filter(s => s.activityId === a.id); const required = cov.requiredIds.length; const covered = cov.coveredIds.size;
  return { ...a, requiredAgents: required, coveredAgents: covered, pendingAgents: Math.max(required-covered,0), coveragePercent: required ? Math.round(covered/required*100) : 0, sessionsCount: sessions.length, lastSessionDate: sessions.length ? [...sessions].sort((x,y)=>x.sessionDate.localeCompare(y.sessionDate)).at(-1)?.sessionDate ?? null : null };
}
function sessionView(db: Db, s: Session) {
  const activity = db.activities.find(a=>a.id===s.activityId); const trainer = TRAINERS.find(t=>t.id===s.trainerId) ?? { id:s.trainerId, name:'Unknown', role:'Trainer' };
  return { ...s, activityName: activity?.name ?? 'Unknown activity', trainer, attendanceCount: db.attendance.filter(a=>a.sessionId===s.id).length };
}
function coverageRows(db: Db) {
  const rows: any[] = [];
  for (const activity of db.activities) {
    const cov = activityCoverage(db, activity.id);
    for (const agentId of cov.requiredIds) {
      const agent = db.agents.find(a=>a.id===agentId && !a.archivedAt); if (!agent) continue;
      const attended = cov.records.filter(r=>r.agentId===agentId && r.status==='Attended').sort((a,b)=>a.id-b.id); const last = attended.at(-1);
      const session = last ? db.sessions.find(s=>s.id===last.sessionId) : undefined; const trainer = session ? TRAINERS.find(t=>t.id===session.trainerId) ?? null : null;
      rows.push({ id: activity.id*100000+agent.id, agentId:agent.id, hrId:agent.hrId, mis:agent.mis, agentName:agent.name, lob:agent.lob, activityId:activity.id, activityName:activity.name, trainer, status:last?'Covered':'Pending', result:last?.result ?? null, lastSessionDate:session?.sessionDate ?? null, sessionId:session?.sessionId ?? null });
    }
  }
  return rows;
}
function activityDetail(db: Db, id: number) {
  const a = db.activities.find(x=>x.id===id); if (!a) return undefined; const cov = activityCoverage(db,id); const agents = activeAgents(db);
  const covered = [...cov.coveredIds].map(agentId => {
    const agent = db.agents.find(x=>x.id===agentId); if (!agent) return null;
    const rec = cov.records.filter(r=>r.agentId===agentId && r.status==='Attended').sort((x,y)=>x.id-y.id).at(-1); const session = rec ? db.sessions.find(s=>s.id===rec.sessionId) : undefined; const trainer = session ? TRAINERS.find(t=>t.id===session.trainerId) ?? null : null;
    return { ...agent, activityName:a.name, trainer, result:rec?.result ?? null, status:'Covered', lastSessionDate:session?.sessionDate ?? null, sessionId:session?.sessionId ?? null };
  }).filter(Boolean);
  const pending = agents.filter(x=>cov.requiredIds.includes(x.id) && !cov.coveredIds.has(x.id));
  return { ...activityView(db,a), sessions: db.sessions.filter(s=>s.activityId===id).map(s=>sessionView(db,s)), covered, pending };
}
function sessionDetail(db: Db, id: number) {
  const s = db.sessions.find(x=>x.id===id); if (!s) return undefined;
  return { ...sessionView(db,s), attendance: db.attendance.filter(r=>r.sessionId===id).map(r=>{ const a=db.agents.find(x=>x.id===r.agentId); return { ...r, hrId:a?.hrId??'', mis:a?.mis??'', agentName:a?.name??'', lob:a?.lob??s.lob }; }) };
}
function agentDetail(db: Db, id: number) {
  const a = db.agents.find(x=>x.id===id); if (!a) return undefined;
  const records = db.attendance.filter(r=>r.agentId===id);
  const history = records.map(r=>{ const s=db.sessions.find(x=>x.id===r.sessionId); const ac=s?db.activities.find(x=>x.id===s.activityId):undefined; const t=s?TRAINERS.find(x=>x.id===s.trainerId):undefined; return { activityName:ac?.name??'Unknown activity', sessionId:s?.sessionId??'', trainer:t?.name??'', lob:a.lob, date:s?.sessionDate??'', result:r.result, attendanceStatus:r.status, coverageStatus:r.status==='Attended'?'Covered':'Pending' }; });
  const completed = new Set(history.filter(h=>h.coverageStatus==='Covered').map(h=>h.activityName));
  return { ...a, totalSessions:records.length, lastTrainingDate:history.map(h=>h.date).filter(Boolean).sort().at(-1)??null, pendingActivities:Math.max(db.activities.filter(x=>x.status!=='Archived').length-completed.size,0), completedActivities:completed.size, history };
}
function headCount(db: Db) {
  const agents=activeAgents(db); const rows=LOBS.map(lob=>{ const x=agents.filter(a=>a.lob===lob); return { lob, active:x.filter(a=>a.employmentStatus==='Active').length, inactive:x.filter(a=>a.employmentStatus==='Inactive').length, transferred:x.filter(a=>a.employmentStatus==='Transferred').length, onLeave:x.filter(a=>a.employmentStatus==='On Leave').length, total:x.length }; });
  const byMonth = new Map<string,number>(); for(const s of db.snapshots) byMonth.set(s.month,(byMonth.get(s.month)??0)+s.active);
  return { totalActive:agents.filter(a=>a.employmentStatus==='Active').length, inactive:agents.filter(a=>a.employmentStatus==='Inactive').length, transferred:agents.filter(a=>a.employmentStatus==='Transferred').length, onLeave:agents.filter(a=>a.employmentStatus==='On Leave').length, rows, snapshots:[...byMonth.entries()].sort().reverse().map(([month,totalActive])=>({month,totalActive})) };
}
function dashboard(db: Db) {
  const activities=db.activities.map(a=>activityView(db,a)); const completedSessions=db.sessions.filter(s=>s.status==='Completed'); const coverage=coverageRows(db); const coveredAgentIds=new Set(coverage.filter(r=>r.status==='Covered').map(r=>r.agentId)); const requiredCount=activities.reduce((n,a)=>n+a.requiredAgents,0); const coveredCount=activities.reduce((n,a)=>n+a.coveredAgents,0);
  const coverageByLob=LOBS.map(lob=>{ const scoped=coverage.filter(r=>r.lob===lob); const covered=scoped.filter(r=>r.status==='Covered').length; return {lob,covered,required:scoped.length,percent:scoped.length?Math.round(covered/scoped.length*100):0}; });
  return { completedSessions:completedSessions.length, agentsCovered:coveredAgentIds.size, pendingAgents:Math.max(requiredCount-coveredCount,0), activeHeadCount:activeAgents(db).filter(a=>a.employmentStatus==='Active').length, activeActivities:db.activities.filter(a=>['Active','In Progress'].includes(a.status)).length, activeUpdates:db.updates.filter(u=>['Open','In Progress'].includes(u.status)).length, coveragePercent:requiredCount?Math.round(coveredCount/requiredCount*100):0, trainingHours:Math.round(completedSessions.reduce((n,s)=>n+s.durationMinutes,0)/60*10)/10, coverageByLob, sessionsByTrainer:TRAINERS.map(trainer=>({trainer,sessions:completedSessions.filter(s=>s.trainerId===trainer.id).length})), needingAttention:activities.filter(a=>a.pendingAgents>0&&a.status!=='Archived').slice(0,5), recentActivity:db.logs.slice(0,8) };
}
function updatesView(db: Db) { return [...db.updates].sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)).map(u=>{ const views=u.linkedActivities.map(id=>db.activities.find(a=>a.id===id)).filter(Boolean).map(a=>activityView(db,a!)); return { ...u, coveragePercent:views.length?Math.round(views.reduce((n,a)=>n+a.coveragePercent,0)/views.length):0 }; }); }
function workload(db: Db) { const month=new Date().toISOString().slice(0,7); return TRAINERS.map(trainer=>{ const sessions=db.sessions.filter(s=>s.trainerId===trainer.id); const recs=db.attendance.filter(r=>sessions.some(s=>s.id===r.sessionId)); return { trainer, completedSessions:sessions.filter(s=>s.status==='Completed').length, uniqueAgentsCovered:new Set(recs.filter(r=>r.status==='Attended').map(r=>r.agentId)).size, totalAttendance:recs.length, trainingHours:Math.round(sessions.filter(s=>s.status==='Completed').reduce((n,s)=>n+s.durationMinutes,0)/60*10)/10, activeSessions:sessions.filter(s=>['Planned','In Progress'].includes(s.status)).length, sessionsThisMonth:sessions.filter(s=>s.sessionDate.startsWith(month)).length, activitiesParticipated:new Set(sessions.map(s=>s.activityId)).size }; }); }

const q = {
  dashboard:['dashboard'], activities:['activities'], sessions:['sessions'], agents:['agents'], coverage:['coverage'], headCount:['head-count'], updates:['updates'], workload:['workload']
} as const;
export const getListActivitiesQueryKey = () => q.activities;
export const getListSessionsQueryKey = () => q.sessions;
export const getListAgentsQueryKey = () => q.agents;
export const getListUpdatesQueryKey = () => q.updates;
export const getGetActivityQueryKey = (id:number) => ['activity',id] as const;
export const getGetSessionQueryKey = (id:number) => ['session',id] as const;
export const getGetAgentQueryKey = (id:number) => ['agent',id] as const;

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

function useLocalMutation<TVars,TResult>(fn:(vars:TVars)=>TResult){ const qc=useQueryClient(); return useMutation({mutationFn:async(vars:TVars)=>fn(vars),onSuccess:()=>{ void qc.invalidateQueries(); }}); }
export function useCreateAgent(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ if(db.agents.some(a=>a.hrId===data.hrId)) throw conflict('An agent with this HR ID already exists.'); const a:Agent={id:db.counters.agent++,hrId:data.hrId,mis:data.mis,name:data.name,lob:data.lob,employmentStatus:data.employmentStatus,dateAdded:data.dateAdded??new Date().toISOString().slice(0,10),notes:data.notes||null,archivedAt:null}; db.agents.push(a); log(db,'Agent Added',a.hrId); snapshot(db); return a; })); }
export function useBulkCreateAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const incoming=data.agents as any[]; const ids=incoming.map(a=>a.hrId); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i); const existing=ids.filter(x=>db.agents.some(a=>a.hrId===x)); const conflicts=[...new Set([...dup,...existing])]; if(conflicts.length) throw conflict(`Duplicate HR ID${conflicts.length>1?'s':''}: ${conflicts.join(', ')}`); const seen=new Set<string>(); const warnings:string[]=[]; for(const a of incoming){ if(db.agents.some(x=>x.mis===a.mis)) warnings.push(`MIS ${a.mis} already exists.`); if(seen.has(a.mis)) warnings.push(`MIS ${a.mis} is repeated in this import.`); seen.add(a.mis); } const created=incoming.map(data=>{ const a:Agent={id:db.counters.agent++,hrId:data.hrId,mis:data.mis,name:data.name,lob:data.lob,employmentStatus:data.employmentStatus,dateAdded:data.dateAdded??new Date().toISOString().slice(0,10),notes:data.notes||null,archivedAt:null}; db.agents.push(a); return a; }); log(db,'Agents Imported',`${created.length} agents`); snapshot(db); return {created,warnings}; })); }
export function useUpdateAgent(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const a=db.agents.find(x=>x.id===id); if(!a) throw new Error('Agent not found'); if(data.hrId&&db.agents.some(x=>x.hrId===data.hrId&&x.id!==id)) throw conflict('An agent with this HR ID already exists.'); Object.assign(a,data); log(db,data.lob?'Agent LOB Changed':'Agent Modified',a.hrId); snapshot(db); return a; })); }
export function useBulkUpdateAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const updated=db.agents.filter(a=>data.ids.includes(a.id)); for(const a of updated){ if(data.lob!==undefined)a.lob=data.lob; if(data.employmentStatus!==undefined)a.employmentStatus=data.employmentStatus; } log(db,'Agents Updated',`${updated.length} agents`); snapshot(db); return updated; })); }
function hasHistory(db:Db,id:number){ return db.attendance.some(r=>r.agentId===id)||db.activities.some(a=>a.requiredAgentIds.includes(id)); }
export function useDeleteAgent(){ return useLocalMutation<any,any>(({id})=>withDb(db=>{ const a=db.agents.find(x=>x.id===id); if(!a) throw new Error('Agent not found'); if(hasHistory(db,id)){a.archivedAt=new Date().toISOString();log(db,'Agent Archived',a.hrId);snapshot(db);return {mode:'archived',agent:a};} db.agents=db.agents.filter(x=>x.id!==id);log(db,'Agent Deleted',a.hrId);snapshot(db);return {mode:'deleted'}; })); }
export function useBulkDeleteAgents(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ let deleted=0,archived=0; for(const id of data.ids){ const a=db.agents.find(x=>x.id===id); if(!a)continue; if(hasHistory(db,id)){a.archivedAt=new Date().toISOString();archived++;}else{db.agents=db.agents.filter(x=>x.id!==id);deleted++;} } log(db,'Agents Removed',`${deleted} deleted, ${archived} archived`);snapshot(db);return {deleted,archived}; })); }
export function useCreateActivity(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const a:Activity={id:db.counters.activity++,name:data.name,type:data.type,scope:data.scope,startDate:data.startDate,endDate:data.endDate,status:data.status,description:data.description||null,requiredAgentIds:data.requiredAgentIds??[]}; db.activities.push(a);log(db,'Training Activity Created',a.name);return activityView(db,a); })); }
export function useUpdateActivity(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const a=db.activities.find(x=>x.id===id); if(!a)throw new Error('Training activity not found');Object.assign(a,data);if(data.requiredAgentIds)a.requiredAgentIds=[...data.requiredAgentIds];log(db,'Training Activity Edited',a.name);return activityView(db,a); })); }
export function useCreateSession(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const id=db.counters.session++; const s:Session={id,sessionId:`S${String(id).padStart(3,'0')}`,activityId:data.activityId,sessionDate:data.sessionDate,trainerId:data.trainerId,lob:data.lob,type:data.type,topic:data.topic||null,durationMinutes:Number(data.durationMinutes)||0,status:data.status,notes:data.notes||null};db.sessions.push(s);const activity=db.activities.find(a=>a.id===s.activityId);for(const agentId of activity?.requiredAgentIds??[]){db.attendance.push({id:db.counters.attendance++,sessionId:s.id,agentId,status:'Absent',result:null,notes:null});}log(db,'Session Created',s.sessionId,TRAINERS.find(t=>t.id===s.trainerId)?.name??null);return sessionView(db,s); })); }
export function useUpdateSession(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const s=db.sessions.find(x=>x.id===id);if(!s)throw new Error('Session not found');Object.assign(s,data);log(db,'Session Edited',s.sessionId);return sessionView(db,s); })); }
export function useReplaceSessionAttendance(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const s=db.sessions.find(x=>x.id===id);if(!s)throw new Error('Session not found');db.attendance=db.attendance.filter(r=>r.sessionId!==id);for(const r of data){db.attendance.push({id:db.counters.attendance++,sessionId:id,agentId:r.agentId,status:r.status,result:r.result??null,notes:r.notes||null});}log(db,'Attendance Updated',s.sessionId);return sessionDetail(db,id)?.attendance??[]; })); }
export function useCreateUpdate(){ return useLocalMutation<any,any>(({data})=>withDb(db=>{ const id=db.counters.update++; const u:TrainingUpdate={id,updateId:`U${String(id).padStart(3,'0')}`,title:data.title,description:data.description||null,scope:data.scope,releaseDate:data.releaseDate,deadline:data.deadline||null,status:data.status,linkedActivities:data.linkedActivities??[],notes:data.notes||null};db.updates.push(u);log(db,'Update Created',u.updateId);return {...u,coveragePercent:0}; })); }
export function useUpdateTrainingUpdate(){ return useLocalMutation<any,any>(({id,data})=>withDb(db=>{ const u=db.updates.find(x=>x.id===id);if(!u)throw new Error('Update not found');Object.assign(u,data);log(db,'Update Modified',u.updateId);return updatesView(db).find(x=>x.id===id); })); }

// Optional helpers for browser-only backup/restore; no server or secret is used.
export function exportLocalDatabase() { return JSON.stringify(loadDb(), null, 2); }
export function importLocalDatabase(json: string) { const parsed = JSON.parse(json) as Db; saveDb({ ...emptyDb(), ...parsed, counters: { ...emptyDb().counters, ...(parsed.counters ?? {}) } }); }
export function clearLocalDatabase() { localStorage.removeItem(STORAGE_KEY); }
