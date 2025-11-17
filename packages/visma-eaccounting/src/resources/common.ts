import { VismaEAccountingClient } from '../client';
import {
  PaymentTerm,
  VatRate,
  FiscalYear,
  Account,
  Voucher,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class PaymentTermsResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all payment terms
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<PaymentTerm>> {
    return this.client.get<PaginatedResponse<PaymentTerm>>('/v2/paymentterms', params);
  }

  /**
   * Get a single payment term by ID
   */
  async get(id: string): Promise<PaymentTerm> {
    return this.client.get<PaymentTerm>(`/v2/paymentterms/${id}`);
  }

  /**
   * Create a new payment term
   */
  async create(data: Partial<PaymentTerm>): Promise<PaymentTerm> {
    return this.client.post<PaymentTerm>('/v2/paymentterms', data);
  }

  /**
   * Update an existing payment term
   */
  async update(id: string, data: Partial<PaymentTerm>): Promise<PaymentTerm> {
    return this.client.put<PaymentTerm>(`/v2/paymentterms/${id}`, data);
  }

  /**
   * Delete a payment term
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/paymentterms/${id}`);
  }
}

export class VatRatesResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all VAT rates
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<VatRate>> {
    return this.client.get<PaginatedResponse<VatRate>>('/v2/vatrates', params);
  }

  /**
   * Get a single VAT rate by ID
   */
  async get(id: string): Promise<VatRate> {
    return this.client.get<VatRate>(`/v2/vatrates/${id}`);
  }
}

export class FiscalYearsResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all fiscal years
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<FiscalYear>> {
    return this.client.get<PaginatedResponse<FiscalYear>>('/v2/fiscalyears', params);
  }

  /**
   * Get a single fiscal year by ID
   */
  async get(id: string): Promise<FiscalYear> {
    return this.client.get<FiscalYear>(`/v2/fiscalyears/${id}`);
  }

  /**
   * Get the current fiscal year
   */
  async getCurrent(): Promise<FiscalYear> {
    return this.client.get<FiscalYear>('/v2/fiscalyears/current');
  }
}

export class AccountsResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all accounts
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Account>> {
    return this.client.get<PaginatedResponse<Account>>('/v2/accounts', params);
  }

  /**
   * Get a single account by ID
   */
  async get(id: string): Promise<Account> {
    return this.client.get<Account>(`/v2/accounts/${id}`);
  }

  /**
   * Create a new account
   */
  async create(data: Partial<Account>): Promise<Account> {
    return this.client.post<Account>('/v2/accounts', data);
  }

  /**
   * Update an existing account
   */
  async update(id: string, data: Partial<Account>): Promise<Account> {
    return this.client.put<Account>(`/v2/accounts/${id}`, data);
  }

  /**
   * Delete an account
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/accounts/${id}`);
  }
}

export class VouchersResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all vouchers with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Voucher>> {
    return this.client.get<PaginatedResponse<Voucher>>('/v2/vouchers', params);
  }

  /**
   * Get a single voucher by ID
   */
  async get(id: string): Promise<Voucher> {
    return this.client.get<Voucher>(`/v2/vouchers/${id}`);
  }

  /**
   * Create a new voucher
   */
  async create(data: Partial<Voucher>): Promise<Voucher> {
    return this.client.post<Voucher>('/v2/vouchers', data);
  }

  /**
   * Update an existing voucher
   */
  async update(id: string, data: Partial<Voucher>): Promise<Voucher> {
    return this.client.put<Voucher>(`/v2/vouchers/${id}`, data);
  }

  /**
   * Delete a voucher
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/vouchers/${id}`);
  }
}
