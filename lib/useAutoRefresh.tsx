'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutoRefreshConfig {
  enabled: boolean;
  interval: number; // in milliseconds
}

export function useAutoRefresh(onRefresh: () => void | Promise<void>) {
  const [config, setConfig] = useState<AutoRefreshConfig>({
    enabled: false,
    interval: 30000, // 30 seconds default
  });
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auto-refresh-config');
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load auto-refresh config:', error);
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('auto-refresh-config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save auto-refresh config:', error);
    }
  }, [config]);

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (!config.enabled) {
      setTimeUntilRefresh(0);
      return;
    }

    // Reset countdown
    setTimeUntilRefresh(config.interval);

    // Countdown timer (updates every second)
    countdownRef.current = window.setInterval(() => {
      setTimeUntilRefresh((prev) => {
        const next = prev - 1000;
        return next <= 0 ? config.interval : next;
      });
    }, 1000);

    // Refresh interval
    intervalRef.current = window.setInterval(() => {
      onRefresh();
      setTimeUntilRefresh(config.interval);
    }, config.interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [config, onRefresh]);

  const toggle = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setInterval = useCallback((interval: number) => {
    setConfig((prev) => ({ ...prev, interval }));
  }, []);

  const enable = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: true }));
  }, []);

  const disable = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: false }));
  }, []);

  // Format time until refresh
  const timeFormatted = useCallback(() => {
    if (!config.enabled || timeUntilRefresh === 0) return '';

    const seconds = Math.floor(timeUntilRefresh / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, [config.enabled, timeUntilRefresh]);

  return {
    config,
    enabled: config.enabled,
    interval: config.interval,
    timeUntilRefresh,
    timeFormatted,
    toggle,
    setInterval,
    enable,
    disable,
  };
}
