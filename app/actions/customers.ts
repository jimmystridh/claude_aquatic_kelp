'use server';

import { getVismaClient } from '@/lib/visma';
import type { Customer, CreateCustomerRequest } from '@visma-eaccounting/client';

export async function getCustomers(page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.customers.getAll({ page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customers',
    };
  }
}

export async function getCustomer(id: string) {
  try {
    const client = getVismaClient();
    const customer = await client.customers.get(id);
    return { success: true, data: customer };
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer',
    };
  }
}

export async function createCustomer(data: CreateCustomerRequest) {
  try {
    const client = getVismaClient();
    const customer = await client.customers.create(data);
    return { success: true, data: customer };
  } catch (error) {
    console.error('Failed to create customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    };
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  try {
    const client = getVismaClient();
    const customer = await client.customers.update(id, data);
    return { success: true, data: customer };
  } catch (error) {
    console.error('Failed to update customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer',
    };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const client = getVismaClient();
    await client.customers.delete(id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete customer',
    };
  }
}

export async function searchCustomers(query: string, page = 1, pageSize = 50) {
  try {
    const client = getVismaClient();
    const result = await client.customers.search(query, { page, pageSize });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to search customers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search customers',
    };
  }
}
