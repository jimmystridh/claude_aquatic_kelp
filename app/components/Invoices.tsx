'use client';

import { useState, useEffect } from 'react';
import { getInvoices, createInvoice, sendInvoiceEmail } from '@/app/actions/invoices';
import { getCustomers } from '@/app/actions/customers';
import { getArticles } from '@/app/actions/articles';
import type { CustomerInvoice, Customer, Article } from '@visma-eaccounting/client';
import { useToast } from './useToast';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';
import InvoiceModal from './InvoiceModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const toast = useToast();

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

  const handleViewInvoice = (invoice: CustomerInvoice) => {
    setSelectedInvoice(invoice);
  };

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
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Invoice'}
        </button>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
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
        {invoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + Create Invoice
              </button>
            </div>
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
