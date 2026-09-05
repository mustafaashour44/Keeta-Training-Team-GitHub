import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/app-shell';
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
  UpdatesPage,
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
          <Route path="/updates" component={UpdatesPage} />
          <Route path="/workload" component={WorkloadPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings" component={SettingsPage} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
