# Visma eAccounting API Client

A comprehensive TypeScript/JavaScript client for the Visma eAccounting API.

## Features

- 🔐 OAuth2 authentication support
- 📦 Complete API coverage (customers, invoices, suppliers, products, etc.)
- 💪 Written in TypeScript with full type definitions
- 🚀 Promise-based API
- 📄 Automatic request/response handling
- ⚡ Rate limiting support (600 requests per minute)

## Installation

```bash
npm install @visma-eaccounting/client
```

## Quick Start

### Authentication

```typescript
import { VismaEAccounting } from '@visma-eaccounting/client';

// Step 1: Get authorization URL
const authUrl = VismaEAccounting.getAuthorizationUrl({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'ea:api ea:sales offline_access',
  state: 'random-state-string'
});

// Redirect user to authUrl...

// Step 2: Exchange code for token (in your callback handler)
const tokenResponse = await VismaEAccounting.getAccessToken({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/callback',
  code: 'AUTHORIZATION_CODE_FROM_CALLBACK'
});

// Step 3: Initialize client with access token
const visma = new VismaEAccounting({
  accessToken: tokenResponse.access_token
});
```

### Refreshing Tokens

```typescript
const newToken = await VismaEAccounting.refreshAccessToken({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  refreshToken: 'YOUR_REFRESH_TOKEN'
});

visma.setAccessToken(newToken.access_token);
```

## Usage Examples

### Customers

```typescript
// Get all customers
const customers = await visma.customers.getAll({ page: 1, pageSize: 50 });

// Get a single customer
const customer = await visma.customers.get('customer-id');

// Create a customer
const newCustomer = await visma.customers.create({
  name: 'Acme Corporation',
  emailAddress: 'contact@acme.com',
  invoiceCity: 'Stockholm',
  invoiceCountryCode: 'SE',
  phoneNumber: '+46123456789'
});

// Update a customer
const updated = await visma.customers.update('customer-id', {
  name: 'Acme Corporation AB'
});

// Search customers
const results = await visma.customers.search('Acme');
```

### Articles (Products)

```typescript
// Get all articles
const articles = await visma.articles.getAll();

// Create an article
const article = await visma.articles.create({
  name: 'Premium Service',
  articleNumber: 'SVC-001',
  unitPrice: 1000,
  unit: 'hour',
  description: 'Premium consulting service'
});

// Update an article
await visma.articles.update('article-id', {
  unitPrice: 1200
});
```

### Invoices

```typescript
// Create an invoice
const invoice = await visma.invoices.create({
  customerId: 'customer-id',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  invoiceRows: [
    {
      articleId: 'article-id',
      description: 'Premium consulting',
      quantity: 10,
      unitPrice: 1000
    }
  ]
});

// Get all invoices
const invoices = await visma.invoices.getAll();

// Send invoice via email
await visma.invoices.sendEmail('invoice-id', 'customer@email.com');

// Mark as paid
await visma.invoices.markAsPaid('invoice-id', '2024-02-10', 10000);

// Create credit invoice
await visma.invoices.createCredit('invoice-id');
```

### Invoice Drafts

```typescript
// Create a draft
const draft = await visma.invoiceDrafts.create({
  customerId: 'customer-id',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  invoiceRows: [/* ... */]
});

// Convert draft to invoice
const invoice = await visma.invoiceDrafts.convertToInvoice('draft-id');
```

### Suppliers

```typescript
// Create a supplier
const supplier = await visma.suppliers.create({
  name: 'Office Supplies Inc',
  emailAddress: 'billing@officesupplies.com',
  city: 'Gothenburg',
  countryCode: 'SE'
});

// Get all suppliers
const suppliers = await visma.suppliers.getAll();
```

### Supplier Invoices

```typescript
// Create supplier invoice
const supplierInvoice = await visma.supplierInvoices.create({
  supplierId: 'supplier-id',
  invoiceNumber: 'INV-2024-001',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  totalAmount: 5000
});

// Mark as paid
await visma.supplierInvoices.markAsPaid('invoice-id', '2024-02-10', 5000);
```

### Other Resources

```typescript
// Payment terms
const paymentTerms = await visma.paymentTerms.getAll();

// VAT rates
const vatRates = await visma.vatRates.getAll();

// Fiscal years
const currentYear = await visma.fiscalYears.getCurrent();

// Accounts
const accounts = await visma.accounts.getAll();

// Vouchers
const vouchers = await visma.vouchers.getAll();
```

## API Documentation

For complete API documentation, visit the [Visma Developer Portal](https://developer.visma.com/api/eaccounting).

## Rate Limits

The Visma eAccounting API has a rate limit of 600 requests per minute per client and per endpoint.

## TypeScript Support

This package is written in TypeScript and includes complete type definitions. All API responses are fully typed.

```typescript
import { Customer, Article, CustomerInvoice } from '@visma-eaccounting/client';
```

## Error Handling

```typescript
try {
  const customer = await visma.customers.get('invalid-id');
} catch (error) {
  console.error('Error:', error.message);
  console.error('Status:', error.statusCode);
  if (error.errors) {
    console.error('Validation errors:', error.errors);
  }
}
```

## License

MIT
