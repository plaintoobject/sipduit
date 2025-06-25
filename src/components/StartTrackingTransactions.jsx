import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

import { Button } from './ui/button';

export function StartTrackingTransactions() {
  const [_, navigate] = useLocation();

  const handleStartTrackingTransactions = () => navigate('/transactions');
  return (
    <div className="flex justify-center py-12">
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-semibold text-neutral-900">
          Ready to get started?
        </h3>
        <Button onClick={handleStartTrackingTransactions}>
          <ArrowRight /> Start Tracking Transactions
        </Button>
      </div>
    </div>
  );
}
