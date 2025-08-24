import { FallbackError } from '@/components/FallbackError.jsx';
import { GlobalLoadingSpinner } from '@/components/GlobalLoadingSpinner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute, PublicRoute } from '@/components/RouteGuards';
import { AuthProvider } from '@/context/AuthProvider';
import { TransactionProvider } from '@/context/TransactionProvider.jsx';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Switch } from 'wouter';

const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/register'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Transactions = lazy(() => import('./pages/transactions'));
const Analytics = lazy(() => import('./pages/analytics'));
const Profile = lazy(() => import('./pages/profile'));
const Settings = lazy(() => import('./pages/settings'));
const Terms = lazy(() => import('./pages/terms'));
const Privacy = lazy(() => import('./pages/privacy'));
const Help = lazy(() => import('./pages/help'));
const NotFound = lazy(() => import('./pages/not-found'));

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackError}
      onReset={(details) => {
        // refreshAppState()
        console.error(`ErrorBoundary catch ${details}`);
      }}
    >
      <AuthProvider>
        <TransactionProvider>
          <Layout>
            <Suspense fallback={<GlobalLoadingSpinner />}>
              <Switch>
                <Route path="/">
                  <PublicRoute path="/">
                    <Home />
                  </PublicRoute>
                </Route>

                <Route path="/login">
                  <PublicRoute path="/login">
                    <Login />
                  </PublicRoute>
                </Route>

                <Route path="/register">
                  <PublicRoute path="/register">
                    <Register />
                  </PublicRoute>
                </Route>

                <Route path="/terms">
                  <PublicRoute path="/terms">
                    <Terms />
                  </PublicRoute>
                </Route>

                <Route path="/privacy">
                  <PublicRoute path="/privacy">
                    <Privacy />
                  </PublicRoute>
                </Route>

                <Route path="/help">
                  <PublicRoute path="/help">
                    <Help />
                  </PublicRoute>
                </Route>

                <Route path="/dashboard">
                  <ProtectedRoute path="/dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                </Route>

                <Route path="/transactions">
                  <ProtectedRoute path="/transactions">
                    <Transactions />
                  </ProtectedRoute>
                </Route>

                <Route path="/analytics">
                  <ProtectedRoute path="/analytics">
                    <Analytics />
                  </ProtectedRoute>
                </Route>

                <Route path="/profile">
                  <ProtectedRoute path="/profile">
                    <Profile />
                  </ProtectedRoute>
                </Route>

                <Route path="/settings">
                  <ProtectedRoute path="/settings">
                    <Settings />
                  </ProtectedRoute>
                </Route>

                <Route path="*" component={NotFound} />
              </Switch>
            </Suspense>
          </Layout>
        </TransactionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
