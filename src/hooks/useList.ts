import { useState } from 'react';

export function useList(initialList = []) {
  const [list, setList] = useState(initialList);

  const addItem = (item) => setList((prev) => [...prev, item]);
  const removeItem = (index) =>
    setList((prev) => prev.filter((_, i) => i !== index));
  const updateItem = (index, newItem) =>
    setList((prev) => prev.map((item, i) => (i === index ? newItem : item)));
  const clearList = () => setList([]);

  return {
    list,
    addItem,
    removeItem,
    updateItem,
    clearList,
    setList,
  };
}
