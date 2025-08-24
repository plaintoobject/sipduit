import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, totals, loading } = useTransaction();
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [_, navigate] = useLocation();

  const handleAddTransactions = () => navigate('/transactions');

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);
  const displayTransactions = showAllTransactions
    ? transactions
    : recentTransactions;

  // Calculate percentage for expense vs income
  const expensePercentage =
    totals.income > 0 ? (totals.expense / totals.income) * 100 : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: number | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <div className="animate-pulse">
          <div className="mb-2 h-8 w-64 rounded bg-neutral-200"></div>
          <div className="mb-8 h-4 w-32 rounded bg-neutral-200"></div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-32 rounded bg-neutral-200"></div>
            <div className="h-32 rounded bg-neutral-200"></div>
            <div className="h-32 rounded bg-neutral-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          👋 Welcome back, {user?.displayName || 'User'}
        </h1>
        <p className="text-neutral-600">
          Here's an overview of your financial activity
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Balance */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.balance)}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-neutral-600">
              {totals.balance >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span>
                {totals.balance >= 0 ? 'Positive' : 'Negative'} balance
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.income)}
            </div>
            <div className="mt-2 text-xs text-neutral-600">
              {transactions.filter((t) => t.type === 'income').length}{' '}
              transactions
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.expense)}
            </div>
            <div className="mt-2 text-xs text-neutral-600">
              {transactions.filter((t) => t.type === 'expense').length}{' '}
              transactions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense vs Income Progress */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5" />
            Spending Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Expenses vs Income</span>
              <span className="font-medium">
                {Math.round(expensePercentage)}%
              </span>
            </div>
            <Progress
              value={Math.min(expensePercentage, 100)}
              className="h-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-neutral-600">Income</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(totals.income)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-neutral-600">Expenses</div>
              <div className="font-semibold text-red-600">
                {formatCurrency(totals.expense)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showAllTransactions ? 'Show Less' : 'View All'}
          </Button>
        </CardHeader>
        <CardContent>
          {displayTransactions.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">No transactions yet</p>
              <p className="text-sm">Start by adding your first transaction</p>
              <Button
                className="mt-4"
                size="sm"
                onClick={handleAddTransactions}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              transaction.type === 'income'
                                ? 'default'
                                : 'secondary'
                            }
                            className={`text-xs ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                          >
                            {transaction.type === 'income'
                              ? 'Income'
                              : 'Expense'}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.value)}
                    </div>
                  </div>
                  {index < displayTransactions.length - 1 && (
                    <Separator className="bg-neutral-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              className="flex h-12 items-center gap-3"
              variant="secondary"
              onClick={handleAddTransactions}
            >
              <Plus className="h-5 w-5" />
              Add Income
            </Button>
            <Button
              variant="destructive"
              className="flex h-12 items-center gap-3"
              onClick={handleAddTransactions}
            >
              <Plus className="h-5 w-5" />
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
