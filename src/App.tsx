import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/components/auth-gate';
import { getCurrentUser } from '@/lib/user-auth';
import { initCloudSync } from '@/lib/local-api-client';
import {
  ActivityDetailPage,
  ActivitiesPage,
  AgentDetailPage,
  AgentsPage,
  CoveragePage,
  DashboardPage,
  HeadCountPage,
  ReportsPage,
  SessionDetailPage,
  SessionsPage,
  SettingsPage,
  BatchDetailPage,
  BatchesPage,
  ExamLinksPage,
  WorkloadPage,
} from '@/pages/operations-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/activities" component={ActivitiesPage} />
          <Route path="/activities/:id" component={ActivityDetailPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/sessions/:id" component={SessionDetailPage} />
          <Route path="/coverage" component={CoveragePage} />
          <Route path="/agents" component={AgentsPage} />
          <Route path="/agents/:id" component={AgentDetailPage} />
          <Route path="/head-count" component={HeadCountPage} />
          <Route path="/batches" component={BatchesPage} />
          <Route path="/batches/:id" component={BatchDetailPage} />
          <Route path="/exam-links" component={ExamLinksPage} />
          <Route path="/workload" component={WorkloadPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings">{() => getCurrentUser()?.isAdmin ? <SettingsPage /> : <DashboardPage />}</Route>
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [cloudReady, setCloudReady] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [storageWarning,setStorageWarning]=useState<{percent:number}|null>(null);
  useEffect(() => {
    const handler=(event:Event)=>{ const message=(event as CustomEvent)?.detail?.message || 'Saved successfully'; setSaveNotice(message); window.setTimeout(()=>setSaveNotice(''),2200); };
    window.addEventListener('keeta-save-success',handler);
    const storageHandler=(event:Event)=>setStorageWarning((event as CustomEvent).detail);
    window.addEventListener('keeta-storage-warning',storageHandler);
    return ()=>{window.removeEventListener('keeta-save-success',handler);window.removeEventListener('keeta-storage-warning',storageHandler);};
  }, []);
  // Pull the shared team database from the cloud on load, then stay
  // subscribed so changes made by teammates on other devices show up
  // here automatically.
  useEffect(() => {
    initCloudSync(() => { void queryClient.invalidateQueries(); window.dispatchEvent(new Event('keeta-auth-change')); }).finally(() => { setCloudReady(true); window.dispatchEvent(new Event('keeta-auth-change')); });
  }, []);

  if (!cloudReady) return <div className="min-h-screen grid place-items-center bg-[hsl(var(--background))]"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-700 text-2xl font-black text-amber-300">K</div><p className="mt-4 text-sm font-semibold">Loading team workspace…</p></div></div>;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthGate><Router /></AuthGate>
        </WouterRouter>
        <Toaster />
        {storageWarning && <div className="fixed left-1/2 top-5 z-[9999] w-[min(92vw,680px)] -translate-x-1/2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900 shadow-xl">⚠ Database document is about {storageWarning.percent}% full. Download a full JSON/Excel backup from Settings before clearing old records.</div>}
        {saveNotice && <div className="fixed right-5 top-5 z-[9999] rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-xl">✓ {saveNotice}</div>}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
