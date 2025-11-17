'use client';

import { useRecentItems } from '@/lib/useRecentItems';

interface RecentItemsProps {
  type: 'customer' | 'article' | 'supplier' | 'invoice';
  onItemClick?: (id: string) => void;
}

export default function RecentItems({ type, onItemClick }: RecentItemsProps) {
  const { getRecentByType, clearRecentByType } = useRecentItems();
  const recentItems = getRecentByType(type);

  if (recentItems.length === 0) {
    return null;
  }

  const typeLabels = {
    customer: 'Customers',
    article: 'Articles',
    supplier: 'Suppliers',
    invoice: 'Invoices',
  };

  const actionIcons = {
    viewed: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    edited: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    created: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  };

  const actionColors = {
    viewed: 'text-blue-600 bg-blue-50',
    edited: 'text-green-600 bg-green-50',
    created: 'text-purple-600 bg-purple-50',
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent {typeLabels[type]}
        </h3>
        <button
          onClick={() => clearRecentByType(type)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title="Clear recent items"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {recentItems.slice(0, 5).map((item) => (
          <div
            key={`${item.id}-${item.timestamp}`}
            onClick={() => onItemClick?.(item.id)}
            className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`p-1 rounded ${actionColors[item.action]}`}>
                {actionIcons[item.action]}
              </div>
              <span className="text-sm text-gray-700 truncate font-medium">
                {item.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {getTimeAgo(item.timestamp)}
            </span>
          </div>
        ))}
      </div>
      {recentItems.length > 5 && (
        <p className="text-xs text-gray-500 text-center mt-2">
          +{recentItems.length - 5} more
        </p>
      )}
    </div>
  );
}
