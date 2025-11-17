'use client';

import type { CustomerInvoice } from '@visma-eaccounting/client';
import { useEffect } from 'react';

interface PrintInvoiceProps {
  invoice: CustomerInvoice;
  onClose: () => void;
}

export default function PrintInvoice({ invoice, onClose }: PrintInvoiceProps) {
  useEffect(() => {
    // Automatically print when component mounts
    const timer = setTimeout(() => {
      window.print();
      // Close after printing or if user cancels
      onClose();
    }, 500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="print:block hidden">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-invoice, .print-invoice * {
            visibility: visible;
          }
          .print-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>

      <div className="print-invoice p-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <div className="mt-2 text-gray-600">
            <p>Invoice #: {invoice.invoiceNumber}</p>
            <p>Date: {invoice.invoiceDate}</p>
            <p>Due Date: {invoice.dueDate}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h2>
          <p className="text-gray-700 font-medium">{invoice.customerName}</p>
        </div>

        {/* Invoice Details */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${invoice.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                {invoice.isPaid ? 'PAID' : 'UNPAID'}
              </span>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{invoice.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-200">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold">{invoice.totalAmount?.toFixed(2)}</span>
            </div>
            {invoice.isPaid && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 font-semibold text-center">PAID</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-600 text-center">
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
}
