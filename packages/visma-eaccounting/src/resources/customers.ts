import { VismaEAccountingClient } from '../client';
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class CustomersResource {
  constructor(private client: VismaEAccountingClient) {}

  /**
   * Get all customers with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    return this.client.get<PaginatedResponse<Customer>>('/v2/customers', params);
  }

  /**
   * Get a single customer by ID
   */
  async get(id: string): Promise<Customer> {
    return this.client.get<Customer>(`/v2/customers/${id}`);
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerRequest): Promise<Customer> {
    return this.client.post<Customer>('/v2/customers', data);
  }

  /**
   * Update an existing customer
   */
  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.client.put<Customer>(`/v2/customers/${id}`, data);
  }

  /**
   * Delete a customer
   */
  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/v2/customers/${id}`);
  }

  /**
   * Search customers by name or customer number
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    return this.client.get<PaginatedResponse<Customer>>('/v2/customers', {
      ...params,
      name: query,
    });
  }
}
