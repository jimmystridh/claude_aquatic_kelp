// Common Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  meta: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  data: T[];
}

// Authentication Types
export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface VismaClientConfig {
  apiUrl?: string;
  accessToken?: string;
  onTokenRefresh?: (newToken: TokenResponse) => void | Promise<void>;
}

// Customer Types
export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface Customer {
  id?: string;
  customerNumber?: string;
  corporateIdentityNumber?: string;
  contactPersonEmail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  currencyCode?: string;
  emailAddress?: string;
  emailAddressInvoice?: string;
  invoiceCity?: string;
  invoiceCountryCode?: string;
  invoicePostalCode?: string;
  invoiceStreetAddress1?: string;
  invoiceStreetAddress2?: string;
  isPrivatePerson?: boolean;
  name: string;
  isActive?: boolean;
  accountNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bic?: string;
  iban?: string;
  ourReference?: string;
  paymentTermsId?: string;
  phoneNumber?: string;
  yourReference?: string;
  deliveryCustomerName?: string;
  deliveryAddress1?: string;
  deliveryAddress2?: string;
  deliveryCity?: string;
  deliveryCountryCode?: string;
  deliveryPostalCode?: string;
  terms?: string;
  note?: string;
  isBlocked?: boolean;
  creditLimit?: number;
  createdUtc?: string;
  modifiedUtc?: string;
}

export interface CreateCustomerRequest {
  name: string;
  customerNumber?: string;
  corporateIdentityNumber?: string;
  emailAddress?: string;
  invoiceCity?: string;
  invoiceCountryCode?: string;
  invoicePostalCode?: string;
  invoiceStreetAddress1?: string;
  invoiceStreetAddress2?: string;
  isPrivatePerson?: boolean;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

// Article (Product) Types
export interface Article {
  id?: string;
  articleNumber?: string;
  description?: string;
  name: string;
  unitPrice?: number;
  unitAbbreviation?: string;
  unit?: string;
  isActive?: boolean;
  vatRateId?: string;
  accountNumber?: string;
  createdUtc?: string;
  modifiedUtc?: string;
  isStockItem?: boolean;
  stockBalance?: number;
  stockAccountNumber?: string;
  costPrice?: number;
}

export interface CreateArticleRequest {
  name: string;
  articleNumber?: string;
  description?: string;
  unitPrice?: number;
  unit?: string;
  vatRateId?: string;
  accountNumber?: string;
  isStockItem?: boolean;
  costPrice?: number;
}

// Invoice Types
export interface InvoiceRow {
  articleId?: string;
  articleNumber?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  vatRateId?: string;
  accountNumber?: string;
  totalAmountExcludingVat?: number;
  totalVatAmount?: number;
  totalAmount?: number;
  unit?: string;
  lineNumber?: number;
}

export interface CustomerInvoice {
  id?: string;
  invoiceNumber?: number;
  customerId: string;
  customerName?: string;
  invoiceDate: string;
  dueDate: string;
  deliveryDate?: string;
  currencyCode?: string;
  ourReference?: string;
  yourReference?: string;
  invoiceRows: InvoiceRow[];
  totalAmount?: number;
  totalVatAmount?: number;
  totalAmountExcludingVat?: number;
  totalRoundingAmount?: number;
  isPaid?: boolean;
  isCreditInvoice?: boolean;
  isRotRutInvoice?: boolean;
  rotRutType?: string;
  rotRutAmount?: number;
  terms?: string;
  note?: string;
  invoiceText?: string;
  status?: string;
  createdUtc?: string;
  modifiedUtc?: string;
  salesDocumentAttachments?: string[];
  voucherNumber?: number;
}

export interface CustomerInvoiceDraft extends CustomerInvoice {
  isDraft: true;
}

export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  deliveryDate?: string;
  currencyCode?: string;
  ourReference?: string;
  yourReference?: string;
  invoiceRows: InvoiceRow[];
  terms?: string;
  note?: string;
  invoiceText?: string;
  rotRutType?: string;
}

// Supplier Types
export interface Supplier {
  id?: string;
  supplierNumber?: string;
  name: string;
  corporateIdentityNumber?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  currencyCode?: string;
  bankAccountNumber?: string;
  bic?: string;
  iban?: string;
  ourReference?: string;
  yourReference?: string;
  paymentTermsId?: string;
  isActive?: boolean;
  createdUtc?: string;
  modifiedUtc?: string;
}

export interface CreateSupplierRequest {
  name: string;
  supplierNumber?: string;
  corporateIdentityNumber?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  isActive?: boolean;
}

// Supplier Invoice Types
export interface SupplierInvoice {
  id?: string;
  supplierNumber?: string;
  supplierId: string;
  supplierName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  currencyCode?: string;
  totalAmount: number;
  totalVatAmount?: number;
  rotRutAmount?: number;
  isPaid?: boolean;
  createdUtc?: string;
  modifiedUtc?: string;
}

// Payment Terms Types
export interface PaymentTerm {
  id?: string;
  name: string;
  nameEnglish?: string;
  numberOfDays: number;
  isActive?: boolean;
  createdUtc?: string;
  modifiedUtc?: string;
}

// VAT Rate Types
export interface VatRate {
  id?: string;
  name: string;
  ratePercentage: number;
  isActive?: boolean;
  createdUtc?: string;
  modifiedUtc?: string;
}

// Fiscal Year Types
export interface FiscalYear {
  id?: string;
  startDate: string;
  endDate: string;
  isLocked?: boolean;
  createdUtc?: string;
  modifiedUtc?: string;
}

// Account Types
export interface Account {
  id?: string;
  number: string;
  name: string;
  isActive?: boolean;
  isSummaryAccount?: boolean;
  vatRateId?: string;
  createdUtc?: string;
  modifiedUtc?: string;
}

// Voucher Types
export interface VoucherRow {
  accountNumber: string;
  debitAmount?: number;
  creditAmount?: number;
  transactionText?: string;
}

export interface Voucher {
  id?: string;
  voucherNumber?: number;
  voucherDate: string;
  voucherText?: string;
  voucherRows: VoucherRow[];
  createdUtc?: string;
  modifiedUtc?: string;
}

// Error Types
export interface VismaError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
