'use client';

import { useState, useMemo } from 'react';
import Customers from './components/Customers';
import Articles from './components/Articles';
import Invoices from './components/Invoices';
import Suppliers from './components/Suppliers';
import CommandPalette from './components/CommandPalette';
import { startOAuthFlow } from './actions/auth';

type Tab = 'customers' | 'articles' | 'invoices' | 'suppliers';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('customers');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'customers', label: 'Customers' },
    { id: 'articles', label: 'Articles' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'suppliers', label: 'Suppliers' },
  ];

  // Command palette commands
  const commands = useMemo(() => [
    // Navigation commands
    {
      id: 'nav-customers',
      label: 'Go to Customers',
      description: 'View and manage customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: () => setActiveTab('customers'),
      keywords: ['customers', 'clients', 'contacts'],
    },
    {
      id: 'nav-articles',
      label: 'Go to Articles',
      description: 'Manage products and services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      action: () => setActiveTab('articles'),
      keywords: ['articles', 'products', 'services', 'items'],
    },
    {
      id: 'nav-invoices',
      label: 'Go to Invoices',
      description: 'Create and manage invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => setActiveTab('invoices'),
      keywords: ['invoices', 'bills', 'payments'],
    },
    {
      id: 'nav-suppliers',
      label: 'Go to Suppliers',
      description: 'Manage supplier information',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      action: () => setActiveTab('suppliers'),
      keywords: ['suppliers', 'vendors'],
    },
    // Action commands
    {
      id: 'action-connect',
      label: 'Connect to Visma',
      description: 'Start OAuth authentication flow',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      action: () => startOAuthFlow(),
      keywords: ['connect', 'authenticate', 'login', 'oauth'],
    },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <CommandPalette commands={commands} />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Visma eAccounting Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete API Integration • Press{' '}
                <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">⌘K</kbd>
                {' '}for commands
              </p>
            </div>
            <button
              onClick={() => startOAuthFlow()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Connect to Visma
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'customers' && <Customers />}
            {activeTab === 'articles' && <Articles />}
            {activeTab === 'invoices' && <Invoices />}
            {activeTab === 'suppliers' && <Suppliers />}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-base mb-2">1. Configure OAuth Credentials</h3>
              <p>
                Update your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file
                with your Visma eAccounting OAuth credentials:
              </p>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
{`VISMA_CLIENT_ID=your_client_id
VISMA_CLIENT_SECRET=your_client_secret
VISMA_REDIRECT_URI=http://localhost:3000/api/auth/callback`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">2. Complete OAuth Flow</h3>
              <p>
                Click the "Connect to Visma" button above to start the OAuth authentication flow.
                You'll be redirected to Visma to authorize the application.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">3. Use the Dashboard</h3>
              <p>
                Once authenticated, you can manage your Visma eAccounting data through the tabs above:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Customers:</strong> View, create, and manage customers</li>
                <li><strong>Articles:</strong> Manage products and services</li>
                <li><strong>Invoices:</strong> Create and send customer invoices</li>
                <li><strong>Suppliers:</strong> Manage supplier information</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Features</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Complete TypeScript API client package</li>
                <li>OAuth2 authentication support</li>
                <li>Next.js server actions for secure backend communication</li>
                <li>Full CRUD operations for all major entities</li>
                <li>Rate limiting support (600 req/min)</li>
                <li>Comprehensive type definitions</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Built with Next.js and the Visma eAccounting API |{' '}
            <a
              href="https://developer.visma.com/api/eaccounting"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              API Documentation
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
