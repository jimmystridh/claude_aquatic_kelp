'use client';

import { useState, useEffect, useCallback } from 'react';

interface RecentItem {
  id: string;
  name: string;
  timestamp: number;
  type: 'customer' | 'article' | 'supplier' | 'invoice';
  action: 'viewed' | 'edited' | 'created';
}

const MAX_RECENT_ITEMS = 20;
const STORAGE_KEY = 'visma-recent-items';

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load recent items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as RecentItem[];
        // Filter out old items (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = items.filter(item => item.timestamp > thirtyDaysAgo);
        setRecentItems(filtered);
      }
    } catch (error) {
      console.error('Failed to load recent items:', error);
    }
  }, []);

  // Save recent items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
    } catch (error) {
      console.error('Failed to save recent items:', error);
    }
  }, [recentItems]);

  // Add or update a recent item
  const addRecentItem = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    setRecentItems((prev) => {
      // Remove existing entry for this item if it exists
      const filtered = prev.filter(
        (i) => !(i.id === item.id && i.type === item.type)
      );

      // Add new entry at the beginning
      const newItem: RecentItem = {
        ...item,
        timestamp: Date.now(),
      };

      // Keep only the most recent MAX_RECENT_ITEMS
      return [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  // Get recent items by type
  const getRecentByType = useCallback(
    (type: RecentItem['type']) => {
      return recentItems.filter((item) => item.type === type);
    },
    [recentItems]
  );

  // Get recent items by action
  const getRecentByAction = useCallback(
    (action: RecentItem['action']) => {
      return recentItems.filter((item) => item.action === action);
    },
    [recentItems]
  );

  // Clear all recent items
  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Clear recent items by type
  const clearRecentByType = useCallback((type: RecentItem['type']) => {
    setRecentItems((prev) => prev.filter((item) => item.type !== type));
  }, []);

  return {
    recentItems,
    addRecentItem,
    getRecentByType,
    getRecentByAction,
    clearRecentItems,
    clearRecentByType,
  };
}
