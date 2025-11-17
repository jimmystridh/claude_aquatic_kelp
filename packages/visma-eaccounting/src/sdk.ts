import { VismaEAccountingClient } from './client';
import { CustomersResource } from './resources/customers';
import { ArticlesResource } from './resources/articles';
import { InvoicesResource, InvoiceDraftsResource } from './resources/invoices';
import { SuppliersResource, SupplierInvoicesResource } from './resources/suppliers';
import {
  PaymentTermsResource,
  VatRatesResource,
  FiscalYearsResource,
  AccountsResource,
  VouchersResource,
} from './resources/common';
import { VismaClientConfig } from './types';

/**
 * Main SDK class for Visma eAccounting API
 */
export class VismaEAccounting {
  private client: VismaEAccountingClient;

  public customers: CustomersResource;
  public articles: ArticlesResource;
  public invoices: InvoicesResource;
  public invoiceDrafts: InvoiceDraftsResource;
  public suppliers: SuppliersResource;
  public supplierInvoices: SupplierInvoicesResource;
  public paymentTerms: PaymentTermsResource;
  public vatRates: VatRatesResource;
  public fiscalYears: FiscalYearsResource;
  public accounts: AccountsResource;
  public vouchers: VouchersResource;

  constructor(config: VismaClientConfig) {
    this.client = new VismaEAccountingClient(config);

    // Initialize all resource endpoints
    this.customers = new CustomersResource(this.client);
    this.articles = new ArticlesResource(this.client);
    this.invoices = new InvoicesResource(this.client);
    this.invoiceDrafts = new InvoiceDraftsResource(this.client);
    this.suppliers = new SuppliersResource(this.client);
    this.supplierInvoices = new SupplierInvoicesResource(this.client);
    this.paymentTerms = new PaymentTermsResource(this.client);
    this.vatRates = new VatRatesResource(this.client);
    this.fiscalYears = new FiscalYearsResource(this.client);
    this.accounts = new AccountsResource(this.client);
    this.vouchers = new VouchersResource(this.client);
  }

  /**
   * Set or update the access token
   */
  setAccessToken(token: string): void {
    this.client.setAccessToken(token);
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | undefined {
    return this.client.getAccessToken();
  }

  /**
   * Get OAuth2 authorization URL
   */
  static getAuthorizationUrl(params: {
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
  }): string {
    return VismaEAccountingClient.getAuthorizationUrl(params);
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }) {
    return VismaEAccountingClient.getAccessToken(params);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }) {
    return VismaEAccountingClient.refreshAccessToken(params);
  }
}
