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
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from 'react';

/* eslint-disable react-refresh/only-export-components */
export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [isPending, _] = useTransition();
  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactions,
    (state, action) => {
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

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transactionData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));

        setTransactions(transactionData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const loadMoreTransactions = useCallback(async () => {
    if (!user?.uid || !lastDoc || !hasMore) return;

    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(20),
      );

      const snapshot = await getDocs(q);
      const newTransactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      setTransactions((prev) => [...prev, ...newTransactions]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Error loading more transactions:', error);
      setError('Failed to load more transactions');
    }
  }, [user?.uid, lastDoc, hasMore]);

  async function addTransaction(previousState, formData) {
    const type = formData.get('type');
    const value = parseFloat(formData.get('value'));

    if (!type || !['expense', 'income'].includes(type)) {
      return { error: 'Invalid transaction type' };
    }
    if (!value || value <= 0) {
      return { error: 'Value must be greater than 0' };
    }
    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    const newTransaction = {
      id: crypto.randomUUID(),
      type,
      value,
      userId: user.uid,
      createdAt: new Date(),
    };

    try {
      addOptimisticTransaction({
        type: 'add',
        transaction: newTransaction,
      });

      const docRef = await addDoc(collection(db, 'transactions'), {
        type,
        value,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { error: 'Failed to add transaction' };
    }
  }

  async function editTransaction(previousState, formData) {
    const id = formData.get('id');
    const type = formData.get('type');
    const value = parseFloat(formData.get('value'));

    if (!id) {
      return { error: 'Transaction ID is required' };
    }
    if (!type || !['expense', 'income'].includes(type)) {
      return { error: 'Invalid transaction type' };
    }
    if (!value || value <= 0) {
      return { error: 'Value must be greater than 0' };
    }

    const updatedTransaction = {
      id,
      type,
      value,
      userId: user.uid,
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

  async function deleteTransaction(previousState, formData) {
    const id = formData.get('id');

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

  async function retrieveTransactions() {
    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20),
      );

      const snapshot = await getDocs(q);
      const transactionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      setTransactions(transactionData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);

      return { success: true, count: transactionData.length };
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      setLoading(false);
      return { error: 'Failed to retrieve transactions' };
    }
  }

  async function retrieveTransactionsHistory(previousState, formData) {
    const filterType = formData.get('type');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    if (!user?.uid) {
      return { error: 'User not authenticated' };
    }

    try {
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );

      if (filterType && filterType !== 'all') {
        q = query(q, where('type', '==', filterType));
      }

      const snapshot = await getDocs(q);
      let historyData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        historyData = historyData.filter((transaction) => {
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

  const totals = {
    income: optimisticTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0),
    expense: optimisticTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0),
    get balance() {
      return this.income - this.expense;
    },
  };

  const value = {
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
