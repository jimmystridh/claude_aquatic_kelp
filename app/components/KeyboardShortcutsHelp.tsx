'use client';

import { useState } from 'react';

interface Shortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[];
  title?: string;
}

export default function KeyboardShortcutsHelp({ shortcuts, title = 'Keyboard Shortcuts' }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
        title="View keyboard shortcuts (Shift+?)"
        aria-label="Keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-800 shadow-sm">
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to close
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
