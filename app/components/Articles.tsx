'use client';

import { useState, useEffect } from 'react';
import { getArticles, createArticle, deleteArticle, searchArticles } from '@/app/actions/articles';
import type { Article } from '@visma-eaccounting/client';
import { useToast } from './useToast';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const toast = useToast();

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
    loadArticles(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles(1, searchQuery);
  };

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const result = await createArticle({
      name: name.trim(),
      description: (formData.get('description') as string) || undefined,
      articleNumber: (formData.get('articleNumber') as string) || undefined,
      unitPrice,
      unit: (formData.get('unit') as string) || undefined,
    });

    if (result.success) {
      setShowForm(false);
      toast.success('Article created successfully!');
      e.currentTarget.reset();
      loadArticles(currentPage, searchQuery);
    } else {
      toast.error(result.error || 'Failed to create article');
    }
    setSubmitting(false);
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

  if (loading && articles.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <toast.ToastContainer />

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
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Article'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
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

      {showForm && (
        <form onSubmit={handleCreateArticle} className="p-6 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Article</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Consulting Service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Article Number</label>
              <input
                type="text"
                name="articleNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ART-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="1000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
              <input
                type="text"
                name="unit"
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
              {submitting ? 'Creating...' : 'Create Article'}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.articleNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{article.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{article.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.unitPrice !== undefined ? `${article.unitPrice.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.unit || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
