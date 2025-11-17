'use client';

import { useState, useEffect, useMemo } from 'react';
import { getInvoices, createInvoice, sendInvoiceEmail } from '@/app/actions/invoices';
import { getCustomers } from '@/app/actions/customers';
import { getArticles } from '@/app/actions/articles';
import type { CustomerInvoice, Customer, Article } from '@visma-eaccounting/client';
import { useToast } from './useToast';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';
import InvoiceModal from './InvoiceModal';
import PrintInvoice from './PrintInvoice';
import { exportToCSV } from '@/lib/csvExport';
import { useSort, SortIcon } from '@/lib/useSort';
import StatCard from './StatCard';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { useBulkSelection } from '@/lib/useBulkSelection';

export default function Invoices() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<CustomerInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const toast = useToast();

  // Filter invoices based on status
  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return invoice.isPaid === true;
    if (statusFilter === 'unpaid') return invoice.isPaid !== true;
    return true;
  });

  // Apply sorting to filtered invoices
  const { sortedData: sortedInvoices, sortKey, sortDirection, handleSort } = useSort(filteredInvoices, 'customerName');

  // Bulk selection
  const {
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    getSelectedItems
  } = useBulkSelection(sortedInvoices);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      handler: () => {
        handleRefresh();
      },
      description: 'Refresh invoices'
    },
    {
      key: 'n',
      handler: () => {
        setShowForm(true);
      },
      description: 'New invoice'
    },
    {
      key: 'Escape',
      handler: () => {
        if (showForm) {
          setShowForm(false);
        } else if (selectedInvoice) {
          setSelectedInvoice(null);
        } else if (printInvoice) {
          setPrintInvoice(null);
        }
      },
      description: 'Close form/modal'
    },
    {
      key: 'f',
      handler: () => {
        // Cycle through filter states
        if (statusFilter === 'all') {
          setStatusFilter('paid');
        } else if (statusFilter === 'paid') {
          setStatusFilter('unpaid');
        } else {
          setStatusFilter('all');
        }
      },
      description: 'Cycle filter (All/Paid/Unpaid)'
    }
  ]);

  const loadData = async (page = 1) => {
    setLoading(true);

    const [invoicesResult, customersResult, articlesResult] = await Promise.all([
      getInvoices(page, pageSize),
      getCustomers(1, 100),
      getArticles(1, 100),
    ]);

    if (invoicesResult.success && invoicesResult.data) {
      setInvoices(invoicesResult.data.data);
      setTotalPages(invoicesResult.data.meta.totalPages);
      setTotalCount(invoicesResult.data.meta.totalCount);
      setCurrentPage(invoicesResult.data.meta.currentPage);
    } else {
      toast.error(invoicesResult.error || 'Failed to load invoices');
    }

    if (customersResult.success && customersResult.data) {
      setCustomers(customersResult.data.data);
    }

    if (articlesResult.success && articlesResult.data) {
      setArticles(articlesResult.data.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const customerId = formData.get('customerId') as string;
    const articleId = formData.get('articleId') as string;
    const description = formData.get('description') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const unitPrice = parseFloat(formData.get('unitPrice') as string);

    // Validation
    if (!customerId) {
      toast.error('Please select a customer');
      setSubmitting(false);
      return;
    }

    if (!articleId) {
      toast.error('Please select an article');
      setSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      setSubmitting(false);
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      setSubmitting(false);
      return;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Unit price must be a valid number');
      setSubmitting(false);
      return;
    }

    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await createInvoice({
      customerId,
      invoiceDate,
      dueDate,
      invoiceRows: [
        {
          articleId,
          description,
          quantity,
          unitPrice,
        },
      ],
    });

    if (result.success) {
      setShowForm(false);
      toast.success('Invoice created successfully!');
      e.currentTarget.reset();
      loadData(currentPage);
    } else {
      toast.error(result.error || 'Failed to create invoice');
    }
    setSubmitting(false);
  };

  const handleSendEmail = async (id: string, customerName: string) => {
    const result = await sendInvoiceEmail(id);
    if (result.success) {
      toast.success(`Invoice sent to ${customerName}`);
    } else {
      toast.error(result.error || 'Failed to send invoice');
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing invoices...');
    loadData(currentPage);
  };

  const handleExport = () => {
    exportToCSV(
      sortedInvoices,
      'invoices',
      [
        { key: 'invoiceNumber', header: 'Invoice #' },
        { key: 'customerName', header: 'Customer' },
        { key: 'invoiceDate', header: 'Invoice Date' },
        { key: 'dueDate', header: 'Due Date' },
        { key: 'totalAmount', header: 'Total Amount' },
        { key: 'isPaid', header: 'Paid' },
      ]
    );
    toast.success('Invoices exported to CSV');
  };

  const handleBulkExport = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    exportToCSV(
      selectedItems,
      'invoices-selected',
      [
        { key: 'invoiceNumber', header: 'Invoice #' },
        { key: 'customerName', header: 'Customer' },
        { key: 'invoiceDate', header: 'Invoice Date' },
        { key: 'dueDate', header: 'Due Date' },
        { key: 'totalAmount', header: 'Total Amount' },
        { key: 'isPaid', header: 'Paid' },
      ]
    );
    toast.success(`Exported ${selectedItems.length} invoice${selectedItems.length > 1 ? 's' : ''} to CSV`);
  };

  const handleViewInvoice = (invoice: CustomerInvoice) => {
    setSelectedInvoice(invoice);
  };

  // Calculate invoice statistics
  const paidCount = useMemo(() => invoices.filter(inv => inv.isPaid).length, [invoices]);
  const unpaidCount = useMemo(() => invoices.filter(inv => !inv.isPaid).length, [invoices]);
  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [invoices]);

  if (loading && invoices.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <toast.ToastContainer />

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {printInvoice && (
        <PrintInvoice
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={totalCount}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Paid Invoices"
          value={paidCount}
          subtitle={`${((paidCount/invoices.length)*100 || 0).toFixed(0)}% paid`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidCount}
          subtitle={`${((unpaidCount/invoices.length)*100 || 0).toFixed(0)}% unpaid`}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={totalRevenue.toFixed(2)}
          subtitle="All invoices"
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Customer Invoices</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handleExport}
            disabled={sortedInvoices.length === 0}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            title="Export to CSV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Invoice'}
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <span className="text-sm font-medium text-gray-700 flex items-center">Filter by status:</span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Paid ({invoices.filter((inv) => inv.isPaid === true).length})
        </button>
        <button
          onClick={() => setStatusFilter('unpaid')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'unpaid'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unpaid ({invoices.filter((inv) => inv.isPaid !== true).length})
        </button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">
              {selectedCount} invoice{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                title="Export selected invoices to CSV"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </div>
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                title="Clear selection"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateInvoice} className="p-6 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Invoice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Article <span className="text-red-500">*</span>
              </label>
              <select
                name="articleId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => {
                  const article = articles.find((a) => a.id === e.target.value);
                  if (article) {
                    const form = e.target.form;
                    if (form) {
                      (form.elements.namedItem('description') as HTMLInputElement).value =
                        article.description || article.name;
                      (form.elements.namedItem('unitPrice') as HTMLInputElement).value =
                        article.unitPrice?.toString() || '0';
                    }
                  }
                }}
              >
                <option value="">Select an article</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.name} - {article.unitPrice?.toFixed(2) || '0'}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Invoice line description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                required
                step="0.01"
                min="0.01"
                defaultValue="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unitPrice"
                required
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  title={isAllSelected ? 'Deselect all' : 'Select all'}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center gap-1">
                  Invoice #
                  <SortIcon sortKey="invoiceNumber" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center gap-1">
                  Customer
                  <SortIcon sortKey="customerName" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('invoiceDate')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon sortKey="invoiceDate" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  Due Date
                  <SortIcon sortKey="dueDate" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalAmount')}
              >
                <div className="flex items-center gap-1">
                  Total
                  <SortIcon sortKey="totalAmount" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('isPaid')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon sortKey="isPaid" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected(invoice)}
                    onChange={() => toggleItem(invoice)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{invoice.invoiceNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.customerName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoiceDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.totalAmount?.toFixed(2) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewInvoice(invoice)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setPrintInvoice(invoice)}
                    className="text-green-600 hover:text-green-900 mr-3"
                    title="Print Invoice"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => invoice.id && handleSendEmail(invoice.id, invoice.customerName || 'customer')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {invoices.length === 0 ? 'No invoices found' : `No ${statusFilter} invoices found`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {invoices.length === 0
                ? 'Get started by creating a new invoice.'
                : `Try changing the filter to see other invoices.`}
            </p>
            {invoices.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  + Create Invoice
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
