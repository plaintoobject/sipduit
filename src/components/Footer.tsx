import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="mt-auto border-t-neutral-200 bg-neutral-50/30">
      <div className="py-8 sm:py-12">
        <div className="pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-muted-foreground text-sm tracking-tight">
              &copy; {new Date().getFullYear()} sip, duit. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 md:justify-end">
              <Link
                to="/privacy"
                className="transition-colors hover:text-neutral-700"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="transition-colors hover:text-neutral-700"
              >
                Terms of Service
              </Link>
              <Link
                to="/help"
                className="transition-colors hover:text-neutral-700"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
