import { getAuthUsers, setUserPasswordHash, updateAuthUser, deleteAuthUser, type AuthUser } from './local-api-client';

const SESSION_KEY = 'keeta-current-user-v1';

async function hashPassword(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentUser(): AuthUser | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export function setCurrentUser(user: AuthUser | null) {
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); else sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('keeta-auth-change'));
}
export function logout() { setCurrentUser(null); }
export function listUsers() { return getAuthUsers(); }

export async function authenticate(userId: number, password: string) {
  const user = getAuthUsers().find(u => u.id === userId);
  if (!user) throw new Error('User not found.');
  if (user.frozen) throw new Error('This user is frozen. Contact Mustafa.');
  // Mustafa always has the requested bootstrap password until he changes it in the future.
  if (user.name === 'Mustafa' && !user.passwordHash && password === '2004') {
    const hash = await hashPassword(password, user.salt);
    const updated = setUserPasswordHash(user.id, hash);
    setCurrentUser(updated); return updated;
  }
  if (!user.passwordHash) throw new Error('PASSWORD_NOT_SET');
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) throw new Error('Incorrect password.');
  setCurrentUser(user); return user;
}

export async function createFirstPassword(userId: number, password: string) {
  if (password.length < 4) throw new Error('Password must be at least 4 characters.');
  const user = getAuthUsers().find(u => u.id === userId);
  if (!user) throw new Error('User not found.');
  if (user.frozen) throw new Error('This user is frozen. Contact Mustafa.');
  if (user.passwordHash) throw new Error('A password is already set for this user.');
  const hash = await hashPassword(password, user.salt);
  const updated = setUserPasswordHash(user.id, hash);
  setCurrentUser(updated); return updated;
}

export function adminResetPassword(userId: number) { return updateAuthUser(userId, { passwordHash: null }); }
export function adminToggleFreeze(userId: number, frozen: boolean) { return updateAuthUser(userId, { frozen }); }
export function adminDeleteUser(userId: number) { return deleteAuthUser(userId); }
