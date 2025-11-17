'use client';

import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '@/app/actions/customers';
import type { Customer } from '@visma-eaccounting/client';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    const result = await getCustomers();
    if (result.success && result.data) {
      setCustomers(result.data.data);
    } else {
      setError(result.error || 'Failed to load customers');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await createCustomer({
      name: formData.get('name') as string,
      emailAddress: formData.get('email') as string,
      phoneNumber: formData.get('phone') as string,
      invoiceCity: formData.get('city') as string,
      invoiceCountryCode: formData.get('country') as string,
    });

    if (result.success) {
      setShowForm(false);
      loadCustomers();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const result = await deleteCustomer(id);
    if (result.success) {
      loadCustomers();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading customers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateCustomer} className="p-4 bg-gray-50 rounded space-y-4">
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country Code</label>
              <input
                type="text"
                name="country"
                placeholder="SE"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Customer
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">City</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t">
                <td className="px-4 py-2">{customer.name}</td>
                <td className="px-4 py-2">{customer.emailAddress || '-'}</td>
                <td className="px-4 py-2">{customer.phoneNumber || '-'}</td>
                <td className="px-4 py-2">{customer.invoiceCity || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => customer.id && handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">No customers found</div>
        )}
      </div>
    </div>
  );
}
