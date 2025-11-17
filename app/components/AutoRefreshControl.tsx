'use client';

import { useState } from 'react';
import { useAutoRefresh } from '@/lib/useAutoRefresh';

interface AutoRefreshControlProps {
  onRefresh: () => void | Promise<void>;
}

export default function AutoRefreshControl({ onRefresh }: AutoRefreshControlProps) {
  const { enabled, interval, timeFormatted, toggle, setInterval: setRefreshInterval } = useAutoRefresh(onRefresh);
  const [showSettings, setShowSettings] = useState(false);

  const intervalOptions = [
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '2 minutes', value: 120000 },
    { label: '5 minutes', value: 300000 },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          enabled
            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
        }`}
        title={enabled ? `Auto-refresh every ${interval / 1000}s` : 'Auto-refresh disabled'}
      >
        <svg
          className={`w-4 h-4 ${enabled ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {enabled && <span className="text-xs font-medium">{timeFormatted()}</span>}
      </button>

      {showSettings && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSettings(false)}
          />

          {/* Settings dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">Auto-refresh</span>
                <button
                  onClick={toggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Interval</label>
                {intervalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRefreshInterval(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      interval === option.value
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {enabled && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Next refresh in {timeFormatted()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
