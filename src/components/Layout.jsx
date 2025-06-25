import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

import { Footer } from './Footer';
import { GlobalLoadingSpinner } from './GlobalLoadingSpinner';
import { Navbar } from './Navbar';

export function Layout({ children }) {
  const { loading } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === '/login' || location === '/register';

  if (loading) {
    return <GlobalLoadingSpinner />;
  }

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 left-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto w-full">
          <Navbar />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="container mx-auto w-full">{children}</div>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50/50 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto w-full">
          <Footer />
        </div>
      </footer>
    </div>
  );
}
