import { useEffect, useState } from 'react';
import { authenticate, createFirstPassword, getCurrentUser, listUsers } from '@/lib/user-auth';
import type { AuthUser } from '@/lib/local-api-client';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AuthUser | null>(() => getCurrentUser());
  const [selected, setSelected] = useState<AuthUser | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>(() => listUsers());
  useEffect(() => { const fn=()=>{ const all=listUsers(); const cur=getCurrentUser(); const fresh=cur?all.find(u=>u.id===cur.id):null; if(cur && (!fresh || fresh.frozen || fresh.passwordHash !== cur.passwordHash)){ sessionStorage.removeItem('keeta-current-user-v1'); setCurrent(null); } else if(fresh){ sessionStorage.setItem('keeta-current-user-v1',JSON.stringify(fresh)); setCurrent(fresh); } else setCurrent(null); setUsers(all) }; window.addEventListener('keeta-auth-change',fn); return()=>window.removeEventListener('keeta-auth-change',fn); },[]);
  if (current && !current.frozen) return <>{children}</>;
  const refresh = () => setUsers(listUsers());
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if(!selected) return; setError(''); setBusy(true);
    try {
      if (!selected.passwordHash && selected.name !== 'Mustafa') {
        if (password !== confirm) throw new Error('Passwords do not match.');
        await createFirstPassword(selected.id, password);
      } else await authenticate(selected.id, password);
      setCurrent(getCurrentUser()); refresh();
    } catch (e:any) { setError(e.message === 'PASSWORD_NOT_SET' ? 'Choose your password first.' : e.message); }
    finally { setBusy(false); }
  };
  return <div className="min-h-screen bg-[hsl(var(--background))] p-5 grid place-items-center"><div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl md:p-8"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-2xl font-black text-amber-300">K</span><div><h1 className="text-xl font-black">Keeta Training Team</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Who is using the workspace?</p></div></div>{!selected?<div className="mt-7 grid gap-3 sm:grid-cols-2">{users.filter(u=>!u.frozen).map(u=><button key={u.id} onClick={()=>{setSelected(u);setPassword('');setConfirm('');setError('')}} className="rounded-2xl border border-[hsl(var(--border))] p-4 text-left hover:bg-[hsl(var(--accent))]"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[hsl(var(--primary)/.14)] text-sm font-bold text-[hsl(var(--primary))]">{u.name.slice(0,2).toUpperCase()}</span><div><p className="font-bold">{u.name}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{u.isAdmin?'Main Admin':u.passwordHash?'Password protected':'First login'}</p></div></div></button>)}</div>:<form onSubmit={submit} className="mt-7 space-y-4"><button type="button" onClick={()=>setSelected(null)} className="text-sm font-bold text-[hsl(var(--primary))]">← Choose another user</button><div><h2 className="text-lg font-bold">Welcome, {selected.name}</h2><p className="text-sm text-[hsl(var(--muted-foreground))]">{!selected.passwordHash&&selected.name!=='Mustafa'?'Choose a password for your first login.':'Enter your password to continue.'}</p></div><input autoFocus type="password" required minLength={selected.name==='Mustafa'?1:4} value={password} onChange={e=>setPassword(e.target.value)} placeholder={!selected.passwordHash&&selected.name!=='Mustafa'?'Create password':'Password'} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 outline-none" />{!selected.passwordHash&&selected.name!=='Mustafa'&&<input type="password" required minLength={4} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 outline-none" />}{error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-[hsl(var(--primary))] px-4 py-3 font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">{busy?'Please wait…':!selected.passwordHash&&selected.name!=='Mustafa'?'Save password & enter':'Sign in'}</button></form>}</div></div>;
}
