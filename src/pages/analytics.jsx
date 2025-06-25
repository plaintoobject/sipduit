import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransaction } from '@/hooks/useTransaction';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Filter,
  PieChart as PieChartIcon,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Analytics() {
  const { transactions, totals, loading } = useTransaction();
  const [timeRange, setTimeRange] = useState('30');
  const [chartType, setChartType] = useState('line');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format compact currency for charts
  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rp${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rp${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const daysAgo = new Date(
      now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000,
    );

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= daysAgo;
    });
  }, [transactions, timeRange]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Group transactions by date
    const dailyData = {};
    const monthlyData = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Daily data
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { date: dayKey, income: 0, expense: 0, net: 0 };
      }

      if (transaction.type === 'income') {
        dailyData[dayKey].income += transaction.value;
      } else {
        dailyData[dayKey].expense += transaction.value;
      }
      dailyData[dayKey].net =
        dailyData[dayKey].income - dailyData[dayKey].expense;

      // Monthly data
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          net: 0,
        };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.value;
      } else {
        monthlyData[monthKey].expense += transaction.value;
      }
      monthlyData[monthKey].net =
        monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    // Convert to arrays and sort
    const dailyArray = Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const monthlyArray = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    return { dailyArray, monthlyArray };
  }, [filteredTransactions]);

  // Pie chart data
  const pieData = [
    { name: 'Income', value: totals.income, color: '#22c55e' },
    { name: 'Expenses', value: totals.expense, color: '#ef4444' },
  ];

  // Calculate trends
  const calculateTrend = (data) => {
    if (data.length < 2) return { trend: 0, isPositive: true };

    const recent = data.slice(-7); // Last 7 data points
    const older = data.slice(-14, -7); // Previous 7 data points

    const recentAvg =
      recent.reduce((sum, item) => sum + item.net, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, item) => sum + item.net, 0) / older.length;

    const trend =
      older.length > 0
        ? ((recentAvg - olderAvg) / Math.abs(olderAvg)) * 100
        : 0;

    return {
      trend: Math.abs(trend),
      isPositive: trend >= 0,
    };
  };

  const trendData = calculateTrend(analyticsData.dailyArray);

  // Calculate statistics for the period
  const periodStats = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'income',
    );
    const expenseTransactions = filteredTransactions.filter(
      (t) => t.type === 'expense',
    );

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.value, 0);
    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + t.value,
      0,
    );
    const netIncome = totalIncome - totalExpense;

    const avgIncome =
      incomeTransactions.length > 0
        ? totalIncome / incomeTransactions.length
        : 0;
    const avgExpense =
      expenseTransactions.length > 0
        ? totalExpense / expenseTransactions.length
        : 0;

    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netIncome,
      avgIncome,
      avgExpense,
      savingsRate,
      transactionCount: filteredTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
    };
  }, [filteredTransactions]);

  // Chart component based on type
  const renderChart = () => {
    const data =
      parseInt(timeRange) <= 31
        ? analyticsData.dailyArray
        : analyticsData.monthlyArray;

    if (data.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-neutral-500">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-30" />
            <p>No data available for the selected period</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={parseInt(timeRange) <= 31 ? 'date' : 'month'}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    });
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'short',
                    year: '2-digit',
                  });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID');
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  });
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={parseInt(timeRange) <= 31 ? 'date' : 'month'}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    });
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'short',
                    year: '2-digit',
                  });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID');
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  });
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={parseInt(timeRange) <= 31 ? 'date' : 'month'}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    });
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'short',
                    year: '2-digit',
                  });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={(value) => {
                  if (parseInt(timeRange) <= 31) {
                    return new Date(value).toLocaleDateString('id-ID');
                  }
                  return new Date(value + '-01').toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  });
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', r: 3 }}
                name="Net Income"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-neutral-200"></div>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded bg-neutral-200"></div>
            ))}
          </div>
          <div className="mb-6 h-80 rounded bg-neutral-200"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-64 rounded bg-neutral-200"></div>
            <div className="h-64 rounded bg-neutral-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <Activity className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-neutral-600">
            Detailed insights into your financial patterns and trends
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Net Income
            </CardTitle>
            {periodStats.netIncome >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                periodStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(periodStats.netIncome)}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-neutral-600">
              {trendData.isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              )}
              <span>{trendData.trend.toFixed(1)}% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Savings Rate
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {periodStats.savingsRate.toFixed(1)}%
            </div>
            <div className="mt-2">
              <Progress
                value={Math.max(0, Math.min(100, periodStats.savingsRate))}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Avg Transaction
            </CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (periodStats.totalIncome + periodStats.totalExpense) /
                  Math.max(1, periodStats.transactionCount),
              )}
            </div>
            <div className="mt-2 text-xs text-neutral-600">
              {periodStats.transactionCount} total transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Transaction Volume
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodStats.transactionCount}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-600">
              <span>{periodStats.incomeCount} income</span>
              <span>{periodStats.expenseCount} expenses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5" />
            Financial Trend - Last {timeRange} days
          </CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <PieChartIcon className="h-5 w-5" />
              Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totals.income > 0 || totals.expense > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Income</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(totals.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Expenses</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(totals.expense)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-500">
                <PieChartIcon className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p>No data to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Target className="h-5 w-5" />
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Savings Rate</span>
                  <span
                    className={`font-medium ${
                      periodStats.savingsRate >= 20
                        ? 'text-green-600'
                        : periodStats.savingsRate >= 10
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {periodStats.savingsRate >= 20
                      ? 'Excellent'
                      : periodStats.savingsRate >= 10
                        ? 'Good'
                        : 'Needs Improvement'}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, periodStats.savingsRate))}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transaction Consistency</span>
                  <span
                    className={`font-medium ${
                      periodStats.transactionCount >= 10
                        ? 'text-green-600'
                        : periodStats.transactionCount >= 5
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {periodStats.transactionCount >= 10
                      ? 'Active'
                      : periodStats.transactionCount >= 5
                        ? 'Moderate'
                        : 'Low'}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (periodStats.transactionCount / 20) * 100,
                  )}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Income Stability</span>
                  <span
                    className={`font-medium ${
                      periodStats.incomeCount >= 5
                        ? 'text-green-600'
                        : periodStats.incomeCount >= 2
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {periodStats.incomeCount >= 5
                      ? 'Stable'
                      : periodStats.incomeCount >= 2
                        ? 'Moderate'
                        : 'Unstable'}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (periodStats.incomeCount / 10) * 100)}
                  className="h-2"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    ((Math.min(100, Math.max(0, periodStats.savingsRate)) *
                      0.4 +
                      Math.min(100, (periodStats.transactionCount / 20) * 100) *
                        0.3 +
                      Math.min(100, (periodStats.incomeCount / 10) * 100) *
                        0.3) /
                      100) *
                      100,
                  )}
                </div>
                <div className="text-sm text-neutral-600">Overall Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
