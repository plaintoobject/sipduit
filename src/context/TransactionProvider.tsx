import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
  type FirestoreError,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Timestamp,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from 'react';

/* eslint-disable react-refresh/only-export-components */

// Transaction type definition
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  value: number;
  userId: string;
  createdAt: Date;
}

// Firestore document type (before conversion)
interface TransactionDocument extends Omit<Transaction, 'id' | 'createdAt'> {
  createdAt: Timestamp;
}

// Action state types for form actions
interface ActionState {
  error?: string;
  success?: boolean;
  id?: string;
  count?: number;
  data?: Transaction[];
  message?: string;
}

// Optimistic action types
type OptimisticAction =
  | { type: 'add'; transaction: Transaction }
  | { type: 'update'; transaction: Transaction }
  | { type: 'delete'; id: string };

// Totals interface
interface TransactionTotals {
  income: number;
  expense: number;
  readonly balance: number;
}

// Transaction context interface
interface TransactionContextType {
  transactions: Transaction[];
  totals: TransactionTotals;
  loading: boolean;
  error: string;
  hasMore: boolean;
  isPending: boolean;
  addTransaction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  editTransaction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteTransaction: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  retrieveTransactions: () => Promise<ActionState>;
  retrieveTransactionsHistory: (
    previousState: ActionState | null,
    formData: FormData,
  ) => Promise<ActionState>;
  loadMoreTransactions: () => Promise<void>;
  clearError: () => void;
}

// Auth hook return type (should be imported from your useAuth hook)
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
}

// Create context with undefined as default
export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const { user }: UseAuthReturn = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [isPending] = useTransition();
  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic<
    Transaction[],
    OptimisticAction
  >(
    transactions,
    (state: Transaction[], action: OptimisticAction): Transaction[] => {
      if (action.type === 'add') {
        return [action.transaction, ...state];
      }
      if (action.type === 'update') {
        return state.map((t) =>
          t.id === action.transaction.id ? { ...t, ...action.transaction } : t,
        );
      }
      if (action.type === 'delete') {
        return state.filter((t) => t.id !== action.id);
      }
      return state;
    },
  );

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q: Query<DocumentData> = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const transactionData: Transaction[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data() as TransactionDocument;
            return {
              id: doc.id,
              type: data.type,
              value: data.value,
              userId: data.userId,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          },
        );

        setTransactions(transactionData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 20);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const loadMoreTransactions = useCallback(async (): Promise<void> => {
    if (!user?.uid || !lastDoc || !hasMore) return;

    try {
      const q: Query<DocumentData> = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(20),
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const newTransactions: Transaction[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data() as TransactionDocument;
          return {
            id: doc.id,
            type: data.type,
            value: data.value,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        },
      );

      setTransactions((prev) => [...prev, ...newTransactions]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Error loading more transactions:', error);
      setError('Failed to load more transactions');
    }
  }, [user?.uid, lastDoc, hasMore]);

  async function addTransaction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const type = formData.get('type') as string | null;
    const valueString = formData.get('value') as string | null;
    const value = valueString ? parseFloat(valueString) : NaN;

    if (!type || !['expense', 'income'].includes(type)) {
      return { error: 'Invalid transaction type' };
    }
    if (!value || value <= 0) {
      return { error: 'Value must be greater than 0' };
    }
    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: type as 'income' | 'expense',
      value,
      userId: user.uid,
      createdAt: new Date(),
    };

    try {
      addOptimisticTransaction({
        type: 'add',
        transaction: newTransaction,
      });

      const docRef: DocumentReference<DocumentData> = await addDoc(
        collection(db, 'transactions'),
        {
          type,
          value,
          userId: user.uid,
          createdAt: serverTimestamp(),
        },
      );

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { error: 'Failed to add transaction' };
    }
  }

  async function editTransaction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const id = formData.get('id') as string | null;
    const type = formData.get('type') as string | null;
    const valueString = formData.get('value') as string | null;
    const value = valueString ? parseFloat(valueString) : NaN;

    if (!id) {
      return { error: 'Transaction ID is required' };
    }
    if (!type || !['expense', 'income'].includes(type)) {
      return { error: 'Invalid transaction type' };
    }
    if (!value || value <= 0) {
      return { error: 'Value must be greater than 0' };
    }

    const updatedTransaction: Transaction = {
      id,
      type: type as 'income' | 'expense',
      value,
      userId: user?.uid || '',
      createdAt: transactions.find((t) => t.id === id)?.createdAt || new Date(),
    };

    try {
      addOptimisticTransaction({
        type: 'update',
        transaction: updatedTransaction,
      });

      await updateDoc(doc(db, 'transactions', id), {
        type,
        value,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { error: 'Failed to update transaction' };
    }
  }

  async function deleteTransaction(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const id = formData.get('id') as string | null;

    if (!id) {
      return { error: 'Transaction ID is required' };
    }

    try {
      addOptimisticTransaction({
        type: 'delete',
        id,
      });

      await deleteDoc(doc(db, 'transactions', id));

      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { error: 'Failed to delete transaction' };
    }
  }

  async function retrieveTransactions(): Promise<ActionState> {
    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    try {
      setLoading(true);
      const q: Query<DocumentData> = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20),
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const transactionData: Transaction[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data() as TransactionDocument;
          return {
            id: doc.id,
            type: data.type,
            value: data.value,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        },
      );

      setTransactions(transactionData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);

      return { success: true, count: transactionData.length };
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      setLoading(false);
      return { error: 'Failed to retrieve transactions' };
    }
  }

  async function retrieveTransactionsHistory(
    _previousState: ActionState | null,
    formData: FormData,
  ): Promise<ActionState> {
    const filterType = formData.get('type') as string | null;
    const startDate = formData.get('startDate') as string | null;
    const endDate = formData.get('endDate') as string | null;

    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    try {
      let q: Query<DocumentData> = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );

      if (filterType && filterType !== 'all') {
        q = query(q, where('type', '==', filterType));
      }

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      let historyData: Transaction[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data() as TransactionDocument;
          return {
            id: doc.id,
            type: data.type,
            value: data.value,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        },
      );

      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        historyData = historyData.filter((transaction: Transaction) => {
          const transactionDate = transaction.createdAt;
          if (start && transactionDate < start) return false;
          if (end && transactionDate > end) return false;
          return true;
        });
      }

      return {
        success: true,
        data: historyData,
        count: historyData.length,
      };
    } catch (error) {
      console.error('Error retrieving transaction history:', error);
      return { error: 'Failed to retrieve transaction history' };
    }
  }

  const totals: TransactionTotals = {
    income: optimisticTransactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + t.value, 0),
    expense: optimisticTransactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.value, 0),
    get balance(): number {
      return this.income - this.expense;
    },
  };

  const value: TransactionContextType = {
    transactions: optimisticTransactions,
    totals,
    loading,
    error,
    hasMore,
    isPending,

    addTransaction,
    editTransaction,
    deleteTransaction,
    retrieveTransactions,
    retrieveTransactionsHistory,
    loadMoreTransactions,

    clearError: () => setError(''),
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
