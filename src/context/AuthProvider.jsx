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
} from 'firebase/auth';
import { createContext, useEffect, useState, useTransition } from 'react';

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending] = useTransition();

  const getErrorMessage = (error) => {
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

  async function signInAction(previousState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in:', error);
      return { error: getErrorMessage(error) };
    }
  }

  async function signUpAction(previousState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const displayName = formData.get('displayName');

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sign up:', error);
      return { error: getErrorMessage(error) };
    }
  }

  async function forgotPasswordAction(previousState, formData) {
    const email = formData.get('email');

    if (!email) {
      return { error: 'Email is required' };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Failed to send reset email:', error);
      return { error: getErrorMessage(error) };
    }
  }

  async function updateProfileAction(previousState, formData) {
    const displayName = formData.get('displayName');

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
      return { error: getErrorMessage(error) };
    }
  }

  async function changePasswordAction(previousState, formData) {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

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
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Failed to change password:', error);
      return { error: getErrorMessage(error) };
    }
  }

  async function signIn({ email, password }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign in:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function signUp({ email, password, displayName }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to sign up:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Failed to sign out:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Failed to send reset email:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError('');

  const isAuthenticated = !!user;

  const userProfile = user
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

  const value = {
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
