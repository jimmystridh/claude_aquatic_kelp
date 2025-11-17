'use client';

import { useState, useEffect } from 'react';
import { getArticles, createArticle, deleteArticle } from '@/app/actions/articles';
import type { Article } from '@visma-eaccounting/client';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    const result = await getArticles();
    if (result.success && result.data) {
      setArticles(result.data.data);
    } else {
      setError(result.error || 'Failed to load articles');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await createArticle({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      articleNumber: formData.get('articleNumber') as string,
      unitPrice: parseFloat(formData.get('unitPrice') as string),
      unit: formData.get('unit') as string,
    });

    if (result.success) {
      setShowForm(false);
      loadArticles();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const result = await deleteArticle(id);
    if (result.success) {
      loadArticles();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading articles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Articles / Products</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Article'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateArticle} className="p-4 bg-gray-50 rounded space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Article Number</label>
            <input
              type="text"
              name="articleNumber"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price</label>
              <input
                type="number"
                name="unitPrice"
                step="0.01"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                placeholder="hour, piece, etc."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Article
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Article Number</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Unit Price</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t">
                <td className="px-4 py-2">{article.articleNumber || '-'}</td>
                <td className="px-4 py-2">{article.name}</td>
                <td className="px-4 py-2">{article.description || '-'}</td>
                <td className="px-4 py-2">{article.unitPrice?.toFixed(2) || '-'}</td>
                <td className="px-4 py-2">{article.unit || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => article.id && handleDelete(article.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">No articles found</div>
        )}
      </div>
    </div>
  );
}
