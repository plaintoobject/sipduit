import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTransaction } from '@/hooks/useTransaction';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useActionState, useState } from 'react';

export default function Transactions() {
  const {
    transactions,
    totals,
    loading,
    hasMore,
    isPending,
    addTransaction,
    editTransaction,
    deleteTransaction,
    loadMoreTransactions,
  } = useTransaction();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form states
  const [addTransactionState, addTransactionAction, isAddTransactionPending] =
    useActionState(addTransaction, null);
  const [
    editTransactionState,
    editTransactionAction,
    isEditTransactionPending,
  ] = useActionState(editTransaction, null);
  const [_, deleteTransactionAction, _ignored] = useActionState(
    deleteTransaction,
    null,
  );

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.value.toString().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle successful form submissions
  const handleAddSuccess = () => {
    if (addTransactionState?.success) {
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSuccess = () => {
    if (editTransactionState?.success) {
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleEditClick = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  // Add Transaction Dialog
  const AddTransactionDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense transaction to your records.
          </DialogDescription>
        </DialogHeader>
        <form action={addTransactionAction} onSubmit={handleAddSuccess}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Amount</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
                required
              />
            </div>
            {addTransactionState?.error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                {addTransactionState.error}
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAddTransactionPending}>
              {isAddTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Transaction'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Edit Transaction Dialog
  const EditTransactionDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>
        <form action={editTransactionAction} onSubmit={handleEditSuccess}>
          <Input
            type="hidden"
            name="id"
            value={editingTransaction?.id || null}
          />
          <div className="space-y-2">
            <Label htmlFor="edit-type">Transaction Type</Label>
            <Select
              name="type"
              defaultValue={editingTransaction?.type}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-value">Amount</Label>
            <Input
              id="edit-value"
              name="value"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={editingTransaction?.value}
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            {editTransactionState?.error && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-600">
                {editTransactionState.error}
              </p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isEditTransactionPending}>
              {isEditTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Transaction'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Delete Transaction Dialog
  const DeleteTransactionDialog = ({ transaction }: { transaction: any }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
            <div className="mt-3 rounded bg-neutral-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {transaction.type === 'income' ? 'Income' : 'Expense'}
                </span>
                <span
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(transaction.value)}
                </span>
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {formatDate(transaction.createdAt)}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteTransactionAction}>
            <input type="hidden" name="id" value={transaction.id} />
            <AlertDialogAction
              type="submit"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Transaction
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-neutral-200"></div>
          <div className="mb-6 h-32 rounded bg-neutral-200"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-neutral-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight lg:gap-3">
            <DollarSign /> Transactions
          </h1>
          <p className="text-neutral-600">
            Manage your income and expense transactions
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Total Balance
            </CardTitle>
            {totals.balance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totals.balance)}
            </div>
          </CardContent>
        </Card>

        <Card>
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
          </CardContent>
        </Card>

        <Card>
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
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Filters & Search
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Search by amount or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="filter">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expense">Expense Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            All Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <Calendar className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="mb-2 text-lg font-medium">
                {searchTerm || filterType !== 'all'
                  ? 'No matching transactions'
                  : 'No transactions yet'}
              </p>
              <p className="mb-4 text-sm">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first transaction'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`rounded-full p-3 ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
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
                            className={`${
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-xl font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.value)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(transaction)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <DeleteTransactionDialog transaction={transaction} />
                      </div>
                    </div>
                  </div>
                  {index < filteredTransactions.length - 1 && (
                    <Separator className="bg-neutral-100" />
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreTransactions}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Transactions'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditTransactionDialog />
    </div>
  );
}
