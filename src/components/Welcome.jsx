import { ArrowRight, HelpCircle } from 'lucide-react';
import { useLocation } from 'wouter';

import { Button } from './ui/button';

export function Welcome() {
  const [_, navigate] = useLocation();

  const handleGetStarted = () => navigate('/dashboard');
  const handleFaqs = () => navigate('/faqs');
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-4 py-12 text-center md:min-h-full">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Expenses?{' '}
          <span className="font-light text-neutral-600 italic">sip, duit</span>{' '}
          the solution!
        </h1>
        <p className="[&:not:first-child(mt-6)] text-lg text-neutral-600 md:text-xl">
          The simple way to manage your expenses with ease and clarity
        </p>
        <div className="mt-6 flex flex-col items-center space-y-4 md:flex-row md:items-baseline md:justify-center md:gap-x-3">
          <Button
            onClick={handleGetStarted}
            variant="default"
            size="md"
            className="w-full px-4 py-3 md:w-1/2"
          >
            Get started <ArrowRight />
          </Button>
          <Button
            onClick={handleFaqs}
            variant="outline"
            size="md"
            className="w-full px-4 py-3 md:w-1/2"
          >
            FAQs <HelpCircle />
          </Button>
        </div>
      </div>
    </div>
  );
}
