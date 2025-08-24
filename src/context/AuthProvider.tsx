import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  type AuthError,
  type User,
  type UserCredential,
} from 'firebase/auth';
import {
  createContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from 'react';

/* eslint-disable react-refresh/only-export-components */

// Action state types for form actions
interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

// User profile interface
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string | undefined;
  lastSignIn: string | undefined;
}

// Sign in/up function parameter types
interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isPending: boolean;
  error: string;
  signInAction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  signUpAction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  forgotPasswordAction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  updateProfileAction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  changePasswordAction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  signIn: (
    credentials: Pick<AuthCredentials, 'email' | 'password'>,
  ) => Promise<{ success: boolean }>;
  signUp: (credentials: AuthCredentials) => Promise<{ success: boolean }>;
  signOut: () => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean }>;
  clearError: () => void;
  setError: (error: string) => void;
}

// Create context with undefined as default (will be provided by AuthProvider)
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending] = useTransition();

  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Try again later';
      case 'auth/requires-recent-login':
        return 'Please sign in again to continue';
      case 'auth/invalid-credential':
        return 'Invalid credentials';
      case 'auth/network-request-failed':
        return 'Network request failed';
      default:
        return error.message || 'An error occurred';
    }
  };

  async function signInAction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in:', error);
      return { error: getErrorMessage(error as AuthError) };
    }
  }

  async function signUpAction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;
    const confirmPassword = formData.get('confirmPassword') as string | null;
    const displayName = formData.get('displayName') as string | null;

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }
    if (password.length < 6) {
      return { error: 'Password should be at least 6 characters' };
    }

    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sign up:', error);
      return { error: getErrorMessage(error as AuthError) };
    }
  }

  async function forgotPasswordAction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const email = formData.get('email') as string | null;

    if (!email) {
      return { error: 'Email is required' };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Failed to send reset email:', error);
      return { error: getErrorMessage(error as AuthError) };
    }
  }

  async function updateProfileAction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const displayName = formData.get('displayName') as string | null;

    if (!user) {
      return { error: 'User not authenticated' };
    }

    if (!displayName) {
      return { error: 'Display name is required' };
    }

    try {
      await updateProfile(user, { displayName });
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { error: getErrorMessage(error as AuthError) };
    }
  }

  async function changePasswordAction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const currentPassword = formData.get('currentPassword') as string | null;
    const newPassword = formData.get('newPassword') as string | null;
    const confirmPassword = formData.get('confirmPassword') as string | null;

    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Validasi
    if (!currentPassword || !newPassword) {
      return { error: 'Current password and new password are required' };
    }
    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match' };
    }
    if (newPassword.length < 6) {
      return { error: 'New password should be at least 6 characters' };
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Failed to change password:', error);
      return { error: getErrorMessage(error as AuthError) };
    }
  }

  async function signIn({
    email,
    password,
  }: Pick<AuthCredentials, 'email' | 'password'>): Promise<{
    success: boolean;
  }> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in:', error);
      const errorMessage = getErrorMessage(error as AuthError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function signUp({
    email,
    password,
    displayName,
  }: AuthCredentials): Promise<{ success: boolean }> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sign up:', error);
      const errorMessage = getErrorMessage(error as AuthError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function signOut(): Promise<{ success: boolean }> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign out:', error);
      const errorMessage = getErrorMessage(error as AuthError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function resetPassword(email: string): Promise<{ success: boolean }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Failed to send reset email:', error);
      const errorMessage = getErrorMessage(error as AuthError);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const clearError = (): void => setError('');

  const isAuthenticated: boolean = !!user;

  const userProfile: UserProfile | null = user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
      }
    : null;

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    loading,
    isPending,
    error,
    signInAction,
    signUpAction,
    forgotPasswordAction,
    updateProfileAction,
    changePasswordAction,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
