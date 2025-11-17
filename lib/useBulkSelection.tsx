'use client';

import { useState, useMemo } from 'react';

/**
 * Custom hook for managing bulk selection in tables
 * @param items - Array of items to manage selection for
 * @param idKey - Key to use as unique identifier (default: 'id')
 */
export function useBulkSelection<T extends Record<string, any>>(
  items: T[],
  idKey: keyof T = 'id' as keyof T
) {
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  const isSelected = (item: T) => selectedIds.has(item[idKey]);

  const isAllSelected = useMemo(
    () => items.length > 0 && items.every(item => selectedIds.has(item[idKey])),
    [items, selectedIds, idKey]
  );

  const isSomeSelected = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds.size, isAllSelected]
  );

  const toggleItem = (item: T) => {
    const newSelected = new Set(selectedIds);
    const id = item[idKey];

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item[idKey])));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedIds.has(item[idKey]));
  };

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    getSelectedItems,
  };
}
