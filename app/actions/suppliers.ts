'use server';

import { getVismaClient } from '@/lib/visma';
import type { Supplier, CreateSupplierRequest, SupplierInvoice } from '@visma-eaccounting/client';

export async function getSuppliers(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.suppliers.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
    };
  }
}

export async function getSupplier(id: string) {
  try {
    const client = getVismaClient();
    const supplier = await client.suppliers.get(id);
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Failed to fetch supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch supplier',
    };
  }
}

export async function createSupplier(data: CreateSupplierRequest) {
  try {
    const client = getVismaClient();
    const supplier = await client.suppliers.create(data);
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Failed to create supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create supplier',
    };
  }
}

export async function updateSupplier(id: string, data: Partial<Supplier>) {
  try {
    const client = getVismaClient();
    const supplier = await client.suppliers.update(id, data);
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update supplier',
    };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const client = getVismaClient();
    await client.suppliers.delete(id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete supplier',
    };
  }
}

export async function searchSuppliers(query: string, page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.suppliers.search(query, { page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to search suppliers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search suppliers',
    };
  }
}

// Supplier Invoices
export async function getSupplierInvoices(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.supplierInvoices.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch supplier invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch supplier invoices',
    };
  }
}

export async function createSupplierInvoice(data: Partial<SupplierInvoice>) {
  try {
    const client = getVismaClient();
    const invoice = await client.supplierInvoices.create(data);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to create supplier invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create supplier invoice',
    };
  }
}

export async function markSupplierInvoiceAsPaid(
  id: string,
  paymentDate: string,
  amount: number
) {
  try {
    const client = getVismaClient();
    const invoice = await client.supplierInvoices.markAsPaid(id, paymentDate, amount);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to mark supplier invoice as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark supplier invoice as paid',
    };
  }
}
