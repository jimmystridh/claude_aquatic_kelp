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

#### Core Functionality
- 📊 **Customer Management** - Full CRUD: Create, Read, Update (Edit), Delete, and search customers
- 📦 **Product/Service Catalog** - Full CRUD: Manage articles with edit, pricing, and descriptions
- 🧾 **Invoice Creation** - Create and send customer invoices with detailed views
- 👥 **Supplier Management** - Full CRUD: Create, edit, delete, and track supplier information
- 🔄 **Real-time Updates** - Instant UI updates after all operations
- 🔒 **Secure Backend** - Next.js server actions for API communication

#### UI/UX Features
- 🔔 **Toast Notifications** - Elegant, non-blocking notifications for all user actions
- 📄 **Pagination** - Efficient data handling with smart pagination (10 items per page)
- 🔍 **Search Functionality** - Real-time search across customers, articles, and suppliers
- ⚡ **Loading States** - Animated skeleton screens for better perceived performance
- 📋 **Invoice Modal** - Detailed invoice view with line items, VAT breakdown, and totals
- ✅ **Form Validation** - Client-side validation with helpful error messages
- 🎯 **Empty States** - Professional empty states with clear call-to-action buttons
- 🔄 **Manual Refresh** - Refresh buttons with spinning animations
- 📱 **Mobile Responsive** - Fully responsive design that works on all screen sizes
- 🎨 **Modern UI** - Clean interface with Tailwind CSS, shadows, and smooth transitions

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

#### Customers Tab
- View all customers with pagination (10 per page)
- Search customers by name in real-time
- **Edit existing customers** - Click Edit to modify customer details
- Create new customers with validation
- Delete existing customers with confirmation
- Country code validation (2-letter codes)
- Email and phone validation
- Refresh data manually with one click

#### Articles Tab
- Browse all products/services with pagination
- Search articles by name
- **Edit existing articles** - Click Edit to modify article details
- Create new articles with descriptions, prices, and units
- Delete articles with confirmation
- Price validation (positive numbers only)
- Auto-populate invoice forms from article data

#### Invoices Tab
- View all customer invoices with pagination
- Create invoices by selecting customers and articles
- Auto-fill line item details from selected article
- View detailed invoice information in modal
  - Line items with quantities and prices
  - VAT breakdown
  - Total amounts
- Send invoices via email
- Status indicators (Paid/Unpaid)
- Date management (invoice date and due date)

#### Suppliers Tab
- View all suppliers with pagination
- Search suppliers by name
- **Edit existing suppliers** - Click Edit to modify supplier details
- Create new suppliers with contact information
- Delete suppliers with confirmation
- Country code validation
- City and contact details management

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
│   │   ├── Suppliers.tsx
│   │   ├── Toast.tsx             # Toast notification UI
│   │   ├── useToast.tsx          # Toast hook
│   │   ├── Pagination.tsx        # Pagination component
│   │   ├── LoadingSkeleton.tsx   # Loading state component
│   │   └── InvoiceModal.tsx      # Invoice detail modal
│   ├── layout.tsx
│   └── page.tsx                   # Main dashboard
├── lib/
│   └── visma.ts                   # Client initialization
└── package.json
```

## Reusable Components

The application includes several reusable components that enhance the user experience:

### Toast Notifications (`useToast` hook)
Elegant, non-blocking notifications with auto-dismiss and manual close options:

```typescript
import { useToast } from './useToast';

const toast = useToast();

// Show notifications
toast.success('Customer created successfully!');
toast.error('Failed to delete article');
toast.info('Refreshing data...');
toast.warning('Validation error');

// Add container to component
<toast.ToastContainer />
```

Features:
- Auto-dismiss after 5 seconds
- Manual close button
- Four types: success, error, info, warning
- Smooth slide-in animation
- Multiple toasts can be displayed simultaneously

### Pagination Component
Smart pagination with truncation and result counting:

```typescript
import Pagination from './Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalCount={totalCount}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
/>
```

Features:
- Page number buttons with smart truncation
- Previous/Next navigation
- "Showing X to Y of Z results" counter
- Mobile-responsive design
- Proper disabled states

### Loading Skeleton
Animated skeleton screens during data loading:

```typescript
import LoadingSkeleton from './LoadingSkeleton';

if (loading && items.length === 0) {
  return <LoadingSkeleton />;
}
```

Features:
- Matches table structure for smooth transition
- Pulse animation effect
- Better perceived performance

### Invoice Modal
Detailed invoice view with full breakdown:

```typescript
import InvoiceModal from './InvoiceModal';

{selectedInvoice && (
  <InvoiceModal
    invoice={selectedInvoice}
    onClose={() => setSelectedInvoice(null)}
  />
)}
```

Features:
- Shows all invoice rows with calculations
- VAT breakdown
- Customer information
- Status badges
- Close on backdrop click or close button

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
