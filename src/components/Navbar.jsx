import { useAuth } from '@/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useList } from '@/hooks/useList';
import { useToggle } from '@/hooks/useToggle';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import { List } from './List';
import { Button } from './ui/button';
import { UserProfileMenu } from './UserProfile';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isOpen, { toggle, setFalse }] = useToggle(false);
  const navRef = useClickOutside(() => setFalse());

  const navLinksData = [
    { title: 'Dashboard', to: '/dashboard' },
    { title: 'Transactions', to: '/transactions' },
    { title: 'Analytics', to: '/analytics' },
    { title: 'Settings', to: '/settings' },
  ];

  const { list: navLinks } = useList(navLinksData);
  const [_, navigate] = useLocation();

  const handleSignIn = () => navigate('/login');

  const handleLinkClick = () => setFalse();

  const handleAuthAction = (action) => {
    action();
    setFalse();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderNavLink = (link) => (
    <Link
      to={link.to}
      className={`block py-2 text-base font-medium tracking-tight text-neutral-900 transition-all duration-200 ease-out hover:text-neutral-700 hover:underline hover:underline-offset-2 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
      onClick={handleLinkClick}
    >
      {link.title}
    </Link>
  );

  const renderDesktopNavLink = (link) => (
    <Link
      to={link.to}
      className="text-sm font-medium tracking-tight text-neutral-900 transition-colors hover:text-neutral-700 hover:underline hover:underline-offset-2"
    >
      {link.title}
    </Link>
  );

  return (
    <div className="flex flex-col" ref={navRef}>
      <div className="flex items-center justify-between py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-bold tracking-tight sm:text-2xl">
            sip, duit.
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {user ? (
            <>
              <List
                items={navLinks}
                renderItem={renderDesktopNavLink}
                keyExtractor={(item) => item.title}
                className="flex items-center space-x-6"
              />
              <UserProfileMenu
                user={user}
                loading={loading}
                onSignOut={handleSignOut}
              />
            </>
          ) : (
            <Button onClick={handleSignIn}>Login</Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-2 md:hidden">
          {user && (
            <UserProfileMenu
              user={user}
              loading={loading}
              onSignOut={handleSignOut}
            />
          )}
          <Button variant="ghost" size="sm" onClick={toggle} className="p-2">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-neutral-200 transition-all duration-300 ease-out md:hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`space-y-1 py-2 transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : '-translate-y-4'
          }`}
        >
          {user ? (
            <>
              <List
                items={navLinks}
                renderItem={renderNavLink}
                keyExtractor={(item) => item.title}
                animate={true}
                staggerDelay={50}
              />
            </>
          ) : (
            <div
              className={`py-2 transition-all duration-200 ease-out ${
                isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
            >
              <Button
                size="sm"
                onClick={() => handleAuthAction(handleSignIn)}
                className="w-full"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
