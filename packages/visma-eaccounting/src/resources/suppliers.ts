import { VismaEAccountingClient } from '../client';
import {
  Supplier,
  CreateSupplierRequest,
  SupplierInvoice,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class SuppliersResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all suppliers with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Supplier>> {
    return this.client.get<PaginatedResponse<Supplier>>('/v2/suppliers', params);
  }

  /**
   * Get a single supplier by ID
   */
  async get(id: string): Promise<Supplier> {
    return this.client.get<Supplier>(`/v2/suppliers/${id}`);
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierRequest): Promise<Supplier> {
    return this.client.post<Supplier>('/v2/suppliers', data);
  }

  /**
   * Update an existing supplier
   */
  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return this.client.put<Supplier>(`/v2/suppliers/${id}`, data);
  }

  /**
   * Delete a supplier
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/suppliers/${id}`);
  }

  /**
   * Search suppliers by name or supplier number
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Supplier>> {
    return this.client.get<PaginatedResponse<Supplier>>('/v2/suppliers', {
      ...params,
      name: query,
    });
  }
}

export class SupplierInvoicesResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all supplier invoices with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<SupplierInvoice>> {
    return this.client.get<PaginatedResponse<SupplierInvoice>>('/v2/supplierinvoices', params);
  }

  /**
   * Get a single supplier invoice by ID
   */
  async get(id: string): Promise<SupplierInvoice> {
    return this.client.get<SupplierInvoice>(`/v2/supplierinvoices/${id}`);
  }

  /**
   * Create a new supplier invoice
   */
  async create(data: Partial<SupplierInvoice>): Promise<SupplierInvoice> {
    return this.client.post<SupplierInvoice>('/v2/supplierinvoices', data);
  }

  /**
   * Update an existing supplier invoice
   */
  async update(id: string, data: Partial<SupplierInvoice>): Promise<SupplierInvoice> {
    return this.client.put<SupplierInvoice>(`/v2/supplierinvoices/${id}`, data);
  }

  /**
   * Delete a supplier invoice
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/supplierinvoices/${id}`);
  }

  /**
   * Mark supplier invoice as paid
   */
  async markAsPaid(
    id: string,
    paymentDate: string,
    amount: number
  ): Promise<SupplierInvoice> {
    return this.client.post<SupplierInvoice>(`/v2/supplierinvoices/${id}/payment`, {
      paymentDate,
      amount,
    });
  }
}
