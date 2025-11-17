'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getArticles, createArticle, updateArticle, deleteArticle, searchArticles } from '@/app/actions/articles';
import type { Article } from '@visma-eaccounting/client';
import { useToast } from './useToast';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';
import { exportToCSV } from '@/lib/csvExport';
import { useSort, SortIcon } from '@/lib/useSort';
import { useDebounce } from '@/lib/useDebounce';
import StatCard from './StatCard';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { useBulkSelection } from '@/lib/useBulkSelection';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const toast = useToast();
  const { sortedData: sortedArticles, sortKey, sortDirection, handleSort } = useSort(articles, 'name');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  } = useBulkSelection(sortedArticles);

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const isSearching = searchQuery !== debouncedSearchQuery;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      handler: () => {
        toast.info('Refreshing articles...');
        loadArticles(currentPage, debouncedSearchQuery);
      },
      description: 'Refresh articles'
    },
    {
      key: 'n',
      handler: () => {
        setShowForm(true);
        setEditingArticle(null);
      },
      description: 'New article'
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

  const loadArticles = async (page = 1, query = '') => {
    setLoading(true);
    const result = query
      ? await searchArticles(query, page, pageSize)
      : await getArticles(page, pageSize);

    if (result.success && result.data) {
      setArticles(result.data.data);
      setTotalPages(result.data.meta.totalPages);
      setTotalCount(result.data.meta.totalCount);
      setCurrentPage(result.data.meta.currentPage);
    } else {
      toast.error(result.error || 'Failed to load articles');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will be triggered automatically by debounced value
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const name = formData.get('name') as string;
    const unitPriceStr = formData.get('unitPrice') as string;
    const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : undefined;

    // Validation
    if (!name.trim()) {
      toast.error('Article name is required');
      setSubmitting(false);
      return;
    }

    if (unitPrice !== undefined && (isNaN(unitPrice) || unitPrice < 0)) {
      toast.error('Unit price must be a valid positive number');
      setSubmitting(false);
      return;
    }

    const data = {
      name: name.trim(),
      description: (formData.get('description') as string) || undefined,
      articleNumber: (formData.get('articleNumber') as string) || undefined,
      unitPrice,
      unit: (formData.get('unit') as string) || undefined,
    };

    const result = editingArticle
      ? await updateArticle(editingArticle.id!, data)
      : await createArticle(data);

    if (result.success) {
      setShowForm(false);
      setEditingArticle(null);
      toast.success(editingArticle ? 'Article updated successfully!' : 'Article created successfully!');
      e.currentTarget.reset();
      loadArticles(currentPage, searchQuery);
    } else {
      toast.error(result.error || `Failed to ${editingArticle ? 'update' : 'create'} article`);
    }
    setSubmitting(false);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const result = await deleteArticle(id);
    if (result.success) {
      toast.success('Article deleted successfully');
      loadArticles(currentPage, searchQuery);
    } else {
      toast.error(result.error || 'Failed to delete article');
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing articles...');
    loadArticles(currentPage, searchQuery);
  };

  const handleExport = () => {
    exportToCSV(
      articles,
      'articles',
      [
        { key: 'name', header: 'Name' },
        { key: 'articleNumber', header: 'Article Number' },
        { key: 'description', header: 'Description' },
        { key: 'unitPrice', header: 'Unit Price' },
        { key: 'unit', header: 'Unit' },
      ]
    );
    toast.success('Articles exported to CSV');
  };

  const handleBulkDelete = async () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} article${selectedItems.length > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;

    toast.info(`Deleting ${selectedItems.length} article${selectedItems.length > 1 ? 's' : ''}...`);

    let successCount = 0;
    let failCount = 0;

    for (const article of selectedItems) {
      if (article.id) {
        const result = await deleteArticle(article.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }

    clearSelection();
    loadArticles(currentPage, searchQuery);

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} article${successCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} article${failCount > 1 ? 's' : ''}`);
    }
  };

  const handleBulkExport = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    exportToCSV(
      selectedItems,
      'articles-selected',
      [
        { key: 'name', header: 'Name' },
        { key: 'articleNumber', header: 'Article Number' },
        { key: 'description', header: 'Description' },
        { key: 'unitPrice', header: 'Unit Price' },
        { key: 'unit', header: 'Unit' },
      ]
    );
    toast.success(`Exported ${selectedItems.length} article${selectedItems.length > 1 ? 's' : ''} to CSV`);
  };

  // Calculate average unit price
  const averagePrice = useMemo(() => {
    if (articles.length === 0) return 0;
    const total = articles.reduce((sum, article) => sum + (article.unitPrice || 0), 0);
    return total / articles.length;
  }, [articles]);

  if (loading && articles.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <toast.ToastContainer />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Articles"
          value={totalCount}
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Current Page"
          value={articles.length}
          subtitle={`Page ${currentPage} of ${totalPages}`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Avg Unit Price"
          value={averagePrice.toFixed(2)}
          subtitle="Across all articles"
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Articles / Products</h2>
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
            disabled={articles.length === 0}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            title="Export to CSV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
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
          {showForm ? 'Cancel' : '+ Add Article'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by name..."
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
              loadArticles(1, '');
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
              {selectedCount} article{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                title="Export selected articles to CSV"
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
                title="Delete selected articles"
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
            {editingArticle ? 'Edit Article' : 'Create New Article'}
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
                defaultValue={editingArticle?.name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Consulting Service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Article Number</label>
              <input
                type="text"
                name="articleNumber"
                defaultValue={editingArticle?.articleNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ART-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editingArticle?.description || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Detailed description of the product or service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit Price</label>
              <input
                type="number"
                name="unitPrice"
                step="0.01"
                min="0"
                defaultValue={editingArticle?.unitPrice || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
              <input
                type="text"
                name="unit"
                defaultValue={editingArticle?.unit || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="hour, piece, kg, etc."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? (editingArticle ? 'Updating...' : 'Creating...')
                : (editingArticle ? 'Update Article' : 'Create Article')}
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('articleNumber')}
              >
                <div className="flex items-center gap-1">
                  Article #
                  <SortIcon sortKey="articleNumber" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon sortKey="name" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1">
                  Description
                  <SortIcon sortKey="description" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('unitPrice')}
              >
                <div className="flex items-center gap-1">
                  Unit Price
                  <SortIcon sortKey="unitPrice" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('unit')}
              >
                <div className="flex items-center gap-1">
                  Unit
                  <SortIcon sortKey="unit" currentKey={sortKey as string} direction={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected(article)}
                    onChange={() => toggleItem(article)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.articleNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{article.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{article.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.unitPrice !== undefined ? `${article.unitPrice.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.unit || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(article)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => article.id && handleDelete(article.id, article.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new article or product.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + Add Article
              </button>
            </div>
          </div>
        )}
      </div>

      {articles.length > 0 && (
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
