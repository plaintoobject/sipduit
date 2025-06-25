import { GlobalLoadingSpinner } from '@/components/GlobalLoadingSpinner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute, PublicRoute } from '@/components/RouteGuards';
import { AuthProvider } from '@/context/AuthProvider';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Switch } from 'wouter';

import { FallbackError } from './components/FallbackError.jsx';
import { TransactionProvider } from './context/TransactionProvider.jsx';

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
          <Suspense fallback={<GlobalLoadingSpinner />}>
            <Switch>
              <PublicRoute path="/">
                <Layout>
                  <Route path="/" component={Home} />
                </Layout>
              </PublicRoute>
              <PublicRoute path="/login">
                <Layout>
                  <Route path="/login" component={Login} />
                </Layout>
              </PublicRoute>
              <PublicRoute path="/register">
                <Layout>
                  <Route path="/register" component={Register} />
                </Layout>
              </PublicRoute>
              <ProtectedRoute path="/dashboard">
                <Layout>
                  <Route path="/dashboard" component={Dashboard} />
                </Layout>
              </ProtectedRoute>
              <ProtectedRoute path="/transactions">
                <Layout>
                  <Route path="/transactions" component={Transactions} />
                </Layout>
              </ProtectedRoute>
              <ProtectedRoute path="/analytics">
                <Layout>
                  <Route path="/analytics" component={Analytics} />
                </Layout>
              </ProtectedRoute>
              <ProtectedRoute path="/profile">
                <Layout>
                  <Route path="/profile" component={Profile} />
                </Layout>
              </ProtectedRoute>
              <ProtectedRoute path="/settings">
                <Layout>
                  <Route path="/settings" component={Settings} />
                </Layout>
              </ProtectedRoute>
              <PublicRoute path="/terms">
                <Layout>
                  <Route path="/terms" component={Terms} />
                </Layout>
              </PublicRoute>
              <PublicRoute path="/privacy">
                <Layout>
                  <Route path="/privacy" component={Privacy} />
                </Layout>
              </PublicRoute>
              <PublicRoute path="/help">
                <Layout>
                  <Route path="/help" component={Help} />
                </Layout>
              </PublicRoute>
              <Route path="*" component={NotFound} />
            </Switch>
          </Suspense>
        </TransactionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
