import { FallbackError } from '@/components/FallbackError.jsx';
import { GlobalLoadingSpinner } from '@/components/GlobalLoadingSpinner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute, PublicRoute } from '@/components/RouteGuards';
import { AuthProvider } from '@/context/AuthProvider';
import { TransactionProvider } from '@/context/TransactionProvider.jsx';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Switch } from 'wouter';

const Home = lazy(() => import('./pages/home.jsx'));
const Login = lazy(() => import('./pages/login.jsx'));
const Register = lazy(() => import('./pages/register.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard.jsx'));
const Transactions = lazy(() => import('./pages/transactions.jsx'));
const Analytics = lazy(() => import('./pages/analytics.jsx'));
const Profile = lazy(() => import('./pages/profile.jsx'));
const Settings = lazy(() => import('./pages/settings.jsx'));
const Terms = lazy(() => import('./pages/terms.jsx'));
const Privacy = lazy(() => import('./pages/privacy.jsx'));
const Help = lazy(() => import('./pages/help.jsx'));
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
