# Visma eAccounting API Integration

A complete Visma eAccounting API integration built with Next.js, featuring a custom TypeScript npm package and a full-featured dashboard for managing accounting data.

## Project Structure

This project consists of two main parts:

1. **NPM Package** (`/packages/visma-eaccounting`): A complete TypeScript client library for the Visma eAccounting API
2. **Next.js Application**: A web dashboard that uses the npm package with server actions for secure API communication

## Features

### NPM Package Features

- 🔐 **OAuth2 Authentication** - Complete OAuth flow implementation
- 📦 **Complete API Coverage** - All major endpoints implemented:
  - Customers
  - Articles (Products/Services)
  - Customer Invoices & Invoice Drafts
  - Suppliers & Supplier Invoices
  - Payment Terms
  - VAT Rates
  - Fiscal Years
  - Accounts
  - Vouchers
- 💪 **TypeScript First** - Full type definitions for all API responses
- 🚀 **Promise-based API** - Modern async/await support
- ⚡ **Rate Limiting Ready** - Built for Visma's 600 req/min limit
- 🛠 **Comprehensive CRUD** - Create, Read, Update, Delete operations for all entities

### Dashboard Features

- 📊 **Customer Management** - Create, view, and manage customers
- 📦 **Product/Service Catalog** - Manage articles with pricing
- 🧾 **Invoice Creation** - Create and send customer invoices
- 👥 **Supplier Management** - Track and manage suppliers
- 🔄 **Real-time Updates** - Instant UI updates after operations
- 🎨 **Modern UI** - Clean, responsive interface with Tailwind CSS
- 🔒 **Secure Backend** - Next.js server actions for API communication

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Visma eAccounting account
- Visma Developer App credentials

### 1. Get Visma API Credentials

1. Go to [Visma Developer Portal](https://developer.visma.com)
2. Create a new application
3. Note down your Client ID and Client Secret
4. Set the redirect URI to `http://localhost:3000/api/auth/callback`

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Configuration

Update the `.env.local` file in the root directory:

```env
VISMA_CLIENT_ID=your_client_id_here
VISMA_CLIENT_SECRET=your_client_secret_here
VISMA_REDIRECT_URI=http://localhost:3000/api/auth/callback

# After OAuth flow, you'll add:
VISMA_ACCESS_TOKEN=
VISMA_REFRESH_TOKEN=
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Complete OAuth Authentication

1. Click the "Connect to Visma" button
2. Log in to your Visma account
3. Authorize the application
4. You'll be redirected back to the dashboard

**Note:** In production, you should store the access and refresh tokens in a database. The current implementation stores them in environment variables for simplicity.

## Usage

### Using the Dashboard

The dashboard provides tabs for managing different resources:

- **Customers Tab**: View all customers, create new customers, and delete existing ones
- **Articles Tab**: Manage products and services with pricing information
- **Invoices Tab**: Create invoices by selecting customers and articles
- **Suppliers Tab**: Manage supplier information

### Using the NPM Package Directly

You can also use the Visma eAccounting client package independently:

```typescript
import { VismaEAccounting } from '@visma-eaccounting/client';

// Initialize the client
const visma = new VismaEAccounting({
  accessToken: 'your_access_token'
});

// Get all customers
const customers = await visma.customers.getAll({ page: 1, pageSize: 50 });

// Create a customer
const newCustomer = await visma.customers.create({
  name: 'Acme Corporation',
  emailAddress: 'contact@acme.com',
  invoiceCity: 'Stockholm',
  invoiceCountryCode: 'SE'
});

// Create an invoice
const invoice = await visma.invoices.create({
  customerId: 'customer-id',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  invoiceRows: [
    {
      articleId: 'article-id',
      description: 'Consulting services',
      quantity: 10,
      unitPrice: 1000
    }
  ]
});

// Send invoice via email
await visma.invoices.sendEmail('invoice-id', 'customer@email.com');
```

## Server Actions

The application uses Next.js server actions for secure backend communication:

- `app/actions/auth.ts` - OAuth authentication handlers
- `app/actions/customers.ts` - Customer management actions
- `app/actions/articles.ts` - Article management actions
- `app/actions/invoices.ts` - Invoice management actions
- `app/actions/suppliers.ts` - Supplier management actions

## API Package Documentation

See the [package README](./packages/visma-eaccounting/README.md) for detailed API documentation.

## Project Architecture

```
claude_aquatic_kelp/
├── packages/
│   └── visma-eaccounting/        # NPM package
│       ├── src/
│       │   ├── client.ts          # Base API client
│       │   ├── sdk.ts             # Main SDK class
│       │   ├── types.ts           # TypeScript definitions
│       │   └── resources/         # API resource classes
│       │       ├── customers.ts
│       │       ├── articles.ts
│       │       ├── invoices.ts
│       │       ├── suppliers.ts
│       │       └── common.ts
│       ├── package.json
│       └── README.md
├── app/
│   ├── actions/                   # Server actions
│   │   ├── auth.ts
│   │   ├── customers.ts
│   │   ├── articles.ts
│   │   ├── invoices.ts
│   │   └── suppliers.ts
│   ├── api/
│   │   └── auth/callback/         # OAuth callback
│   ├── components/                # React components
│   │   ├── Customers.tsx
│   │   ├── Articles.tsx
│   │   ├── Invoices.tsx
│   │   └── Suppliers.tsx
│   ├── layout.tsx
│   └── page.tsx                   # Main dashboard
├── lib/
│   └── visma.ts                   # Client initialization
└── package.json
```

## Building for Production

```bash
# Build the NPM package
cd packages/visma-eaccounting
npm run build

# Build the Next.js app
cd ../..
npm run build

# Start production server
npm start
```

## API Rate Limits

The Visma eAccounting API has a rate limit of **600 requests per minute** per client and per endpoint. The client handles this automatically, but be mindful when making bulk operations.

## TypeScript Support

The project is fully typed with TypeScript. All API responses include complete type definitions:

```typescript
import type { Customer, Article, CustomerInvoice } from '@visma-eaccounting/client';
```

## Error Handling

All API calls are wrapped with try-catch blocks and return structured error responses:

```typescript
const result = await createCustomer(customerData);

if (result.success) {
  console.log('Customer created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Security Considerations

- Never commit `.env.local` with real credentials
- Store tokens securely in a database in production
- Use HTTPS in production
- Implement proper session management
- Validate all user inputs

## Resources

- [Visma eAccounting API Documentation](https://developer.visma.com/api/eaccounting)
- [Visma Developer Portal](https://developer.visma.com)
- [Visma Community](https://community.visma.com/t5/Visma-eAccounting-API/ct-p/IN_MA_eAccountingAPI)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
