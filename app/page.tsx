'use client';

import { useState } from 'react';
import Customers from './components/Customers';
import Articles from './components/Articles';
import Invoices from './components/Invoices';
import Suppliers from './components/Suppliers';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Visma eAccounting Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete API Integration
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
