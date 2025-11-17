'use server';

import { getVismaClient } from '@/lib/visma';
import type { CustomerInvoice, CreateInvoiceRequest } from '@visma-eaccounting/client';

export async function getInvoices(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.invoices.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoices',
    };
  }
}

export async function getInvoice(id: string) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoices.get(id);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice',
    };
  }
}

export async function createInvoice(data: CreateInvoiceRequest) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoices.create(data);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice',
    };
  }
}

export async function updateInvoice(id: string, data: Partial<CustomerInvoice>) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoices.update(id, data);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice',
    };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const client = getVismaClient();
    await client.invoices.delete(id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete invoice',
    };
  }
}

export async function sendInvoiceEmail(id: string, emailAddress?: string) {
  try {
    const client = getVismaClient();
    await client.invoices.sendEmail(id, emailAddress);
    return { success: true };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invoice email',
    };
  }
}

export async function markInvoiceAsPaid(id: string, paymentDate: string, amount: number) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoices.markAsPaid(id, paymentDate, amount);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to mark invoice as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark invoice as paid',
    };
  }
}

export async function createCreditInvoice(invoiceId: string) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoices.createCredit(invoiceId);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to create credit invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create credit invoice',
    };
  }
}

// Invoice Drafts
export async function getInvoiceDrafts(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.invoiceDrafts.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch invoice drafts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice drafts',
    };
  }
}

export async function createInvoiceDraft(data: CreateInvoiceRequest) {
  try {
    const client = getVismaClient();
    const draft = await client.invoiceDrafts.create(data);
    return { success: true, data: draft };
  } catch (error) {
    console.error('Failed to create invoice draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice draft',
    };
  }
}

export async function convertDraftToInvoice(id: string) {
  try {
    const client = getVismaClient();
    const invoice = await client.invoiceDrafts.convertToInvoice(id);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to convert draft to invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert draft to invoice',
    };
  }
}
