import { AlertCircleIcon, CircleArrowRight, MailIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export function FallbackError({ error, resetBoundary }) {
  const code = error.code || error.statusText || 'Unexpected Error';
  const message = error.message
    ? `Error: ${error.message}`
    : 'An unexpected error has occurred. Please try again.';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:min-h-full">
      <div className="mx-auto w-full max-w-4xl space-y-4 lg:space-y-6">
        <Alert variant="destructive" className="space-y-2">
          <AlertCircleIcon className="mt-1 text-neutral-500" />
          <AlertTitle className="scroll-m-20 text-xl font-semibold tracking-tight">
            {code}
          </AlertTitle>
          <AlertDescription className="[&:not:first-child(mt-6)] tracking-tight">
            {message}
          </AlertDescription>
        </Alert>

        <div className="space-y-2 rounded-lg bg-neutral-100 p-4 text-sm">
          <p className="font-medium tracking-tight">
            If the issue persists, you can try the following:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Refresh the page or try again later.</li>
            <li>Clear your browser cache and cookies.</li>
            <li>Ensure your internet connection is stable.</li>
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <MailIcon className="mt-1 size-4" />
          <div>
            <p className="font-medium text-neutral-900">Need help?</p>
            <p className="[&:not:first-child(mt-6)] tracking-tight">
              Contact our support team at{' '}
              <a
                href="mailto:halo.aazis7@gmail.com"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                halo.aazis7@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={resetBoundary}>
            Try Again <CircleArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
