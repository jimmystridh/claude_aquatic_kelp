import { VismaEAccountingClient } from '../client';
import {
  CustomerInvoice,
  CustomerInvoiceDraft,
  CreateInvoiceRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class InvoicesResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all invoices with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<CustomerInvoice>> {
    return this.client.get<PaginatedResponse<CustomerInvoice>>('/v2/customerinvoices', params);
  }

  /**
   * Get a single invoice by ID
   */
  async get(id: string): Promise<CustomerInvoice> {
    return this.client.get<CustomerInvoice>(`/v2/customerinvoices/${id}`);
  }

  /**
   * Create a new invoice
   */
  async create(data: CreateInvoiceRequest): Promise<CustomerInvoice> {
    return this.client.post<CustomerInvoice>('/v2/customerinvoices', data);
  }

  /**
   * Update an existing invoice
   */
  async update(id: string, data: Partial<CustomerInvoice>): Promise<CustomerInvoice> {
    return this.client.put<CustomerInvoice>(`/v2/customerinvoices/${id}`, data);
  }

  /**
   * Delete an invoice
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/customerinvoices/${id}`);
  }

  /**
   * Get invoice as PDF
   */
  async getPdf(id: string): Promise<Blob> {
    return this.client.get<Blob>(`/v2/customerinvoices/${id}/pdf`);
  }

  /**
   * Send invoice via email
   */
  async sendEmail(id: string, emailAddress?: string): Promise<void> {
    return this.client.post<void>(`/v2/customerinvoices/${id}/send`, {
      emailAddress,
    });
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, paymentDate: string, amount: number): Promise<CustomerInvoice> {
    return this.client.post<CustomerInvoice>(`/v2/customerinvoices/${id}/payment`, {
      paymentDate,
      amount,
    });
  }

  /**
   * Create credit invoice
   */
  async createCredit(invoiceId: string): Promise<CustomerInvoice> {
    return this.client.post<CustomerInvoice>(`/v2/customerinvoices/${invoiceId}/credit`, {});
  }
}

export class InvoiceDraftsResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all invoice drafts with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<CustomerInvoiceDraft>> {
    return this.client.get<PaginatedResponse<CustomerInvoiceDraft>>(
      '/v2/customerinvoicedrafts',
      params
    );
  }

  /**
   * Get a single invoice draft by ID
   */
  async get(id: string): Promise<CustomerInvoiceDraft> {
    return this.client.get<CustomerInvoiceDraft>(`/v2/customerinvoicedrafts/${id}`);
  }

  /**
   * Create a new invoice draft
   */
  async create(data: CreateInvoiceRequest): Promise<CustomerInvoiceDraft> {
    return this.client.post<CustomerInvoiceDraft>('/v2/customerinvoicedrafts', data);
  }

  /**
   * Update an existing invoice draft
   */
  async update(id: string, data: Partial<CustomerInvoiceDraft>): Promise<CustomerInvoiceDraft> {
    return this.client.put<CustomerInvoiceDraft>(`/v2/customerinvoicedrafts/${id}`, data);
  }

  /**
   * Delete an invoice draft
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/customerinvoicedrafts/${id}`);
  }

  /**
   * Convert draft to invoice
   */
  async convertToInvoice(id: string): Promise<CustomerInvoice> {
    return this.client.post<CustomerInvoice>(`/v2/customerinvoicedrafts/${id}/convert`, {});
  }
}
