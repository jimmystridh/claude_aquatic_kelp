'use client';

import { useState, useEffect } from 'react';
import { getInvoices, createInvoice, sendInvoiceEmail } from '@/app/actions/invoices';
import { getCustomers } from '@/app/actions/customers';
import { getArticles } from '@/app/actions/articles';
import type { CustomerInvoice, Customer, Article } from '@visma-eaccounting/client';

export default function Invoices() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [invoicesResult, customersResult, articlesResult] = await Promise.all([
      getInvoices(),
      getCustomers(),
      getArticles(),
    ]);

    if (invoicesResult.success && invoicesResult.data) {
      setInvoices(invoicesResult.data.data);
    } else {
      setError(invoicesResult.error || 'Failed to load invoices');
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
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await createInvoice({
      customerId: formData.get('customerId') as string,
      invoiceDate,
      dueDate,
      invoiceRows: [
        {
          articleId: formData.get('articleId') as string,
          description: formData.get('description') as string,
          quantity: parseFloat(formData.get('quantity') as string),
          unitPrice: parseFloat(formData.get('unitPrice') as string),
        },
      ],
    });

    if (result.success) {
      setShowForm(false);
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleSendEmail = async (id: string, email?: string) => {
    const result = await sendInvoiceEmail(id, email);
    if (result.success) {
      alert('Invoice sent successfully!');
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading invoices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Invoices</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Invoice'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateInvoice} className="p-4 bg-gray-50 rounded space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer *</label>
            <select
              name="customerId"
              required
              className="w-full px-3 py-2 border rounded"
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
            <label className="block text-sm font-medium mb-1">Article *</label>
            <select
              name="articleId"
              required
              className="w-full px-3 py-2 border rounded"
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
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <input
              type="text"
              name="description"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                required
                step="0.01"
                defaultValue="1"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price *</label>
              <input
                type="number"
                name="unitPrice"
                required
                step="0.01"
                defaultValue="0"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Invoice
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Invoice #</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="px-4 py-2">{invoice.invoiceNumber || '-'}</td>
                <td className="px-4 py-2">{invoice.customerName || '-'}</td>
                <td className="px-4 py-2">{invoice.invoiceDate}</td>
                <td className="px-4 py-2">{invoice.dueDate}</td>
                <td className="px-4 py-2">{invoice.totalAmount?.toFixed(2) || '-'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      invoice.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      invoice.id && handleSendEmail(invoice.id)
                    }
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">No invoices found</div>
        )}
      </div>
    </div>
  );
}
