'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from '@/app/actions/customers';
import type { Customer } from '@visma-eaccounting/client';
import { useToast } from './useToast';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';
import { exportToCSV } from '@/lib/csvExport';
import { useSort, SortIcon } from '@/lib/useSort';
import { useDebounce } from '@/lib/useDebounce';
import StatCard from './StatCard';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { useBulkSelection } from '@/lib/useBulkSelection';
import { useRecentItems } from '@/lib/useRecentItems';
import RecentItems from './RecentItems';
import AutoRefreshControl from './AutoRefreshControl';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const toast = useToast();
  const { sortedData: sortedCustomers, sortKey, sortDirection, handleSort } = useSort(customers, 'name');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addRecentItem } = useRecentItems();

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
  } = useBulkSelection(sortedCustomers);

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const isSearching = searchQuery !== debouncedSearchQuery;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      handler: () => {
        handleRefresh();
      },
      description: 'Refresh customers'
    },
    {
      key: 'n',
      handler: () => {
        setShowForm(true);
        setEditingCustomer(null);
      },
      description: 'New customer'
    },
    {
      key: 'Escape',
      handler: () => {
        if (showForm) {
          handleCancelEdit();
        }
      },
      description: 'Close form'
    },
    {
      key: '/',
      handler: () => {
        searchInputRef.current?.focus();
      },
      description: 'Focus search'
    }
  ]);

  const loadCustomers = async (page = 1, query = '') => {
    setLoading(true);
    const result = query
      ? await searchCustomers(query, page, pageSize)
      : await getCustomers(page, pageSize);

    if (result.success && result.data) {
      setCustomers(result.data.data);
      setTotalPages(result.data.meta.totalPages);
      setTotalCount(result.data.meta.totalCount);
      setCurrentPage(result.data.meta.currentPage);
    } else {
      toast.error(result.error || 'Failed to load customers');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will be triggered automatically by debounced value
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      emailAddress: formData.get('email') as string,
      phoneNumber: formData.get('phone') as string,
      invoiceCity: formData.get('city') as string,
      invoiceCountryCode: (formData.get('country') as string).toUpperCase(),
    };

    // Basic validation
    if (!data.name.trim()) {
      toast.error('Customer name is required');
      setSubmitting(false);
      return;
    }

    if (data.invoiceCountryCode && data.invoiceCountryCode.length !== 2) {
      toast.error('Country code must be 2 letters (e.g., SE, NO, DK)');
      setSubmitting(false);
      return;
    }

    const result = editingCustomer
      ? await updateCustomer(editingCustomer.id!, data)
      : await createCustomer(data);

    if (result.success) {
      setShowForm(false);
      setEditingCustomer(null);
      toast.success(editingCustomer ? 'Customer updated successfully!' : 'Customer created successfully!');

      // Track recent item
      if (result.data) {
        addRecentItem({
          id: result.data.id || editingCustomer?.id || '',
          name: data.name,
          type: 'customer',
          action: editingCustomer ? 'edited' : 'created',
        });
      }

      e.currentTarget.reset();
      loadCustomers(currentPage, searchQuery);
    } else {
      toast.error(result.error || `Failed to ${editingCustomer ? 'update' : 'create'} customer`);
    }
    setSubmitting(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);

    // Track recent view
    if (customer.id) {
      addRecentItem({
        id: customer.id,
        name: customer.name,
        type: 'customer',
        action: 'viewed',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const result = await deleteCustomer(id);
    if (result.success) {
      toast.success('Customer deleted successfully');
      loadCustomers(currentPage, searchQuery);
    } else {
      toast.error(result.error || 'Failed to delete customer');
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing customers...');
    loadCustomers(currentPage, searchQuery);
  };

  const handleExport = () => {
    exportToCSV(
      customers,
      'customers',
      [
        { key: 'name', header: 'Name' },
        { key: 'emailAddress', header: 'Email' },
        { key: 'phoneNumber', header: 'Phone' },
        { key: 'invoiceCity', header: 'City' },
        { key: 'invoiceCountryCode', header: 'Country Code' },
        { key: 'customerNumber', header: 'Customer Number' },
      ]
    );
    toast.success('Customers exported to CSV');
  };

  const handleBulkDelete = async () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} customer${selectedItems.length > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;

    toast.info(`Deleting ${selectedItems.length} customer${selectedItems.length > 1 ? 's' : ''}...`);

    let successCount = 0;
    let failCount = 0;

    for (const customer of selectedItems) {
      if (customer.id) {
        const result = await deleteCustomer(customer.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }

    clearSelection();
    loadCustomers(currentPage, searchQuery);

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} customer${successCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} customer${failCount > 1 ? 's' : ''}`);
    }
  };

  const handleBulkExport = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    exportToCSV(
      selectedItems,
      'customers-selected',
      [
        { key: 'name', header: 'Name' },
        { key: 'emailAddress', header: 'Email' },
        { key: 'phoneNumber', header: 'Phone' },
        { key: 'invoiceCity', header: 'City' },
        { key: 'invoiceCountryCode', header: 'Country Code' },
        { key: 'customerNumber', header: 'Customer Number' },
      ]
    );
    toast.success(`Exported ${selectedItems.length} customer${selectedItems.length > 1 ? 's' : ''} to CSV`);
  };

  if (loading && customers.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <toast.ToastContainer />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Customers"
          value={totalCount}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Current Page"
          value={customers.length}
          subtitle={`Page ${currentPage} of ${totalPages}`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Search Results"
          value={debouncedSearchQuery ? totalCount : '-'}
          subtitle={debouncedSearchQuery || 'No active search'}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Items */}
      <RecentItems type="customer" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Customers</h2>
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
            disabled={customers.length === 0}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            title="Export to CSV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <KeyboardShortcutsHelp
            shortcuts={[
              { key: 'R', description: 'Refresh customers' },
              { key: 'N', description: 'New customer' },
              { key: '/', description: 'Focus search' },
              { key: 'Esc', description: 'Close form' }
            ]}
          />
          <AutoRefreshControl onRefresh={handleRefresh} />
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
              loadCustomers(1, '');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Bulk Actions Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">
              {selectedCount} customer{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                title="Export selected customers to CSV"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </div>
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                title="Delete selected customers"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
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
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={editingCustomer?.name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={editingCustomer?.emailAddress || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="contact@acme.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingCustomer?.phoneNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+46 123 456 789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">City</label>
              <input
                type="text"
                name="city"
                defaultValue={editingCustomer?.invoiceCity || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Stockholm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Country Code</label>
              <input
                type="text"
                name="country"
                placeholder="SE"
                maxLength={2}
                defaultValue={editingCustomer?.invoiceCountryCode || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">2-letter code (SE, NO, DK, etc.)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? (editingCustomer ? 'Updating...' : 'Creating...')
                : (editingCustomer ? 'Update Customer' : 'Create Customer')}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon sortKey="name" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('emailAddress')}
              >
                <div className="flex items-center gap-1">
                  Email
                  <SortIcon sortKey="emailAddress" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('phoneNumber')}
              >
                <div className="flex items-center gap-1">
                  Phone
                  <SortIcon sortKey="phoneNumber" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('invoiceCity')}
              >
                <div className="flex items-center gap-1">
                  City
                  <SortIcon sortKey="invoiceCity" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('invoiceCountryCode')}
              >
                <div className="flex items-center gap-1">
                  Country
                  <SortIcon sortKey="invoiceCountryCode" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected(customer)}
                    onChange={() => toggleItem(customer)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.emailAddress || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phoneNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.invoiceCity || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.invoiceCountryCode || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => customer.id && handleDelete(customer.id, customer.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new customer.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + Add Customer
              </button>
            </div>
          </div>
        )}
      </div>

      {customers.length > 0 && (
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
