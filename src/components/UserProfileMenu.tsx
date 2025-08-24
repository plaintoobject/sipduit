import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { User as FirebaseUser } from 'firebase/auth';
import { Calendar, LogOut, Mail, Settings, User } from 'lucide-react';
import { useLocation } from 'wouter';

interface UserProfileMenuProps {
  user: FirebaseUser;
  loading: boolean;
  onSignOut: () => void;
}

export function UserProfileMenu({
  user,
  loading,
  onSignOut,
}: UserProfileMenuProps) {
  const [_, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="hidden sm:block">
          <Skeleton className="mb-1 h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-auto p-2 hover:bg-neutral-50"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL!} alt={user.displayName!} />
              <AvatarFallback className="text-xs font-medium">
                {getInitials(user.displayName!)}
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.displayName || 'User'}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-muted-foreground cursor-pointer text-xs"
          disabled
        >
          <Mail className="mr-2 h-3 w-3" />
          {user.emailVerified ? 'Email verified' : 'Email not verified'}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-muted-foreground cursor-pointer text-xs"
          disabled
        >
          <Calendar className="mr-2 h-3 w-3" />
          Joined {formatDate(user.metadata.creationTime)}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
