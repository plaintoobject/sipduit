import { TransactionContext } from '@/context/TransactionProvider';
import { useContext } from 'react';

export function useTransaction() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error('useTransaction must be used within TransactionContext');
  }

  return context;
}
