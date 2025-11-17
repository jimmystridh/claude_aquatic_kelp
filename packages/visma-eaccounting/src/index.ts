// Main SDK export
export { VismaEAccounting } from './sdk';

// Client export
export { VismaEAccountingClient } from './client';

// Resource exports
export { CustomersResource } from './resources/customers';
export { ArticlesResource } from './resources/articles';
export { InvoicesResource, InvoiceDraftsResource } from './resources/invoices';
export { SuppliersResource, SupplierInvoicesResource } from './resources/suppliers';
export {
  PaymentTermsResource,
  VatRatesResource,
  FiscalYearsResource,
  AccountsResource,
  VouchersResource,
} from './resources/common';

// Type exports
export type {
  // Common types
  PaginationParams,
  PaginatedResponse,
  VismaClientConfig,
  VismaError,
  TokenResponse,
  AuthConfig,

  // Customer types
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Address,

  // Article types
  Article,
  CreateArticleRequest,

  // Invoice types
  InvoiceRow,
  CustomerInvoice,
  CustomerInvoiceDraft,
  CreateInvoiceRequest,

  // Supplier types
  Supplier,
  CreateSupplierRequest,
  SupplierInvoice,

  // Common entity types
  PaymentTerm,
  VatRate,
  FiscalYear,
  Account,
  Voucher,
  VoucherRow,
} from './types';
