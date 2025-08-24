import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircleIcon, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { Link } from 'wouter';

export default function Login() {
  const { signInAction } = useAuth();
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="mx-auto flex w-full max-w-md flex-col items-center justify-center p-4 sm:p-6">
        <div className="flex items-center">
          <h1 className="scroll-m-20 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            sip, duit.
          </h1>
        </div>
        <div className="pt-8 pb-4 text-center sm:pt-12 lg:pt-16">
          <h2 className="scroll-m-20 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Welcome back!
          </h2>
          <p className="[&:not:first-child(mt-6)] text-sm tracking-tight sm:text-base">
            Please sign in to continue.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
        <form action={formAction} className="space-y-4 md:space-y-5">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Unable to sign in.</AlertTitle>
              <AlertDescription>
                <p>{state.error}</p>
              </AlertDescription>
            </Alert>
          )}
          <div className="ms:space-y-2 space-y-1">
            <Label htmlFor="email" className="text-sm sm:text-base">
              Email
            </Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">
              Password
            </Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs tracking-tight sm:text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="underline underline-offset-2">
              Create account
            </Link>
          </p>
        </form>
      </main>
      <footer className="mx-auto w-full max-w-md px-4 pt-8 sm:px-6 sm:pt-12 lg:pt-16">
        <div className="flex items-center">
          <p className="text-muted-foreground text-center text-xs tracking-tight sm:text-sm">
            By clicking sign in you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2">
              terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline underline-offset-2">
              privacy policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
