import { Features } from '@/components/Features';
import { StartTrackingTransactions } from '@/components/StartTrackingTransactions';
import { Welcome } from '@/components/Welcome';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <Welcome />
      <Features />
      <StartTrackingTransactions />
    </div>
  );
}
