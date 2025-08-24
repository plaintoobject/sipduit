import { List } from '@/components/List';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useList } from '@/hooks/useList';
import { DollarSign, Gift, LayoutDashboard, LineChart } from 'lucide-react';

export function Features() {
  const featuresData = [
    {
      title: 'Dashboard',
      description:
        'Manage your expenses easily with an intuitive dashboard that gives you complete control over your financial data',
      icon: LayoutDashboard,
    },
    {
      title: 'Transactions',
      description:
        'Create and track your income and expense effortlessly with just a few clicks - simple, fast, and reliable',
      icon: DollarSign,
    },
    {
      title: 'Analytics',
      description:
        'Let the system analyze your spending patterns and provide valuable insights to improve your financial habits',
      icon: LineChart,
    },
    {
      title: 'Free',
      description:
        'Enjoy all premium features completely free - no subscriptions, no hidden fees, just pure value',
      icon: Gift,
    },
  ];

  const { list: features } = useList(featuresData);

  const renderFeatureList = (feature) => (
    <Card key={feature.title} className="bg-background/95 cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1 text-xl font-semibold text-neutral-900 lg:gap-3">
          {<feature.icon />} {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="leading-relaxed text-neutral-600">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto w-full py-12">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
          Everything you need to manage expenses
        </h2>
        <p className="[&:not:first-child(mt-6)] text-lg text-balance text-neutral-600">
          Powerful features designed to make expense tracking simple and
          effective
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <List
          items={features}
          renderItem={renderFeatureList}
          keyExtractor={(item) => item.title}
          className="grid grid-cols-1 items-baseline gap-3 md:grid-cols-2"
        />
      </div>
    </div>
  );
}
