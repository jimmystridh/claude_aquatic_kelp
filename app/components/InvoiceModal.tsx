'use client';

import type { CustomerInvoice } from '@visma-eaccounting/client';

interface InvoiceModalProps {
  invoice: CustomerInvoice;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Invoice #{invoice.invoiceNumber}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <p className="mt-1 text-sm text-gray-900">{invoice.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`mt-1 inline-flex px-2 py-1 rounded text-xs font-semibold ${
                        invoice.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                      <p className="mt-1 text-sm text-gray-900">{invoice.invoiceDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <p className="mt-1 text-sm text-gray-900">{invoice.dueDate}</p>
                    </div>
                    {invoice.currencyCode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <p className="mt-1 text-sm text-gray-900">{invoice.currencyCode}</p>
                      </div>
                    )}
                    {invoice.ourReference && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Our Reference</label>
                        <p className="mt-1 text-sm text-gray-900">{invoice.ourReference}</p>
                      </div>
                    )}
                    {invoice.yourReference && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Your Reference</label>
                        <p className="mt-1 text-sm text-gray-900">{invoice.yourReference}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Invoice Rows</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoice.invoiceRows.map((row, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.description}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.quantity}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.unitPrice.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {((row.totalAmount || (row.quantity * row.unitPrice))).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Subtotal (excl. VAT)</span>
                      <span className="text-sm text-gray-900">{invoice.totalAmountExcludingVat?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">VAT</span>
                      <span className="text-sm text-gray-900">{invoice.totalVatAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">{invoice.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {invoice.note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{invoice.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
