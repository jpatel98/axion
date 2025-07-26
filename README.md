# Axion Manufacturing ERP

> A cloud-based, multi-tenant SaaS platform designed to be the single source of truth for small to medium-sized manufacturing businesses, specifically those in CNC, VMC, and job-shop environments.

![Axion ERP](https://img.shields.io/badge/Status-In%20Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.16-blue)

## 🎯 Overview

Axion solves the fundamental problem of operational chaos in manufacturing. It replaces disconnected systems (spreadsheets, whiteboards, paper travelers) with one seamless, integrated platform that provides real-time visibility from quote to delivery.

### Key Benefits

- **30% reduction** in lead times
- **25% increase** in capacity utilization  
- **6-month average** ROI timeline
- **Real-time visibility** across all operations

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 with Tailwind CSS
- **Backend**: Supabase Edge Functions (serverless)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Clerk (multi-tenant)
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts (planned)
- **Scheduling**: FullCalendar (planned)

### Key Features

- ✅ **Multi-tenant architecture** with row-level security
- ✅ **Real-time authentication** with Clerk
- ✅ **Modern responsive design** 
- ✅ **Quote-to-job workflow**
- ✅ **Customer management**
- ✅ **Job tracking**
- 🚧 **Production scheduling** (in development)
- 🚧 **Inventory management** (planned)
- 🚧 **Machine integration** (planned)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jpatel98/axion.git
   cd axion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Set up the database**
   
   Run the SQL scripts in order:
   ```bash
   # In your Supabase SQL editor
   # 1. Run database/schema.sql
   # 2. Run database/setup-rls.sql
   # 3. Run database/phase2-schema.sql (if needed)
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
axion/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── v1/            # API v1
│   │   │       ├── customers/ # Customer CRUD
│   │   │       ├── jobs/      # Job management
│   │   │       └── quotes/    # Quote management
│   │   ├── dashboard/         # Main application
│   │   │   ├── customers/     # Customer pages
│   │   │   ├── jobs/          # Job pages
│   │   │   └── quotes/        # Quote pages
│   │   ├── sign-in/           # Authentication pages
│   │   └── sign-up/
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI primitives
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configurations
│   └── middleware.ts         # Next.js middleware
├── database/                 # Database schemas and migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### API Endpoints

#### Authentication
- `POST /api/auth/sync-user` - Sync Clerk user with database

#### Customers
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/[id]` - Get customer
- `PUT /api/v1/customers/[id]` - Update customer
- `DELETE /api/v1/customers/[id]` - Delete customer

#### Quotes
- `GET /api/v1/quotes` - List quotes
- `POST /api/v1/quotes` - Create quote
- `GET /api/v1/quotes/[id]` - Get quote
- `PUT /api/v1/quotes/[id]` - Update quote
- `DELETE /api/v1/quotes/[id]` - Delete quote

#### Jobs
- `GET /api/v1/jobs` - List jobs
- `POST /api/v1/jobs` - Create job
- `GET /api/v1/jobs/[id]` - Get job
- `PUT /api/v1/jobs/[id]` - Update job
- `DELETE /api/v1/jobs/[id]` - Delete job
- `POST /api/v1/jobs/from-quote` - Convert quote to job

## 🗄️ Database Schema

### Core Tables

- **tenants** - Multi-tenant organization data
- **users** - User profiles linked to Clerk
- **customers** - Customer information
- **quotes** - Quote management with line items
- **quote_line_items** - Individual quote line items
- **jobs** - Manufacturing job tracking

### Security

- **Row Level Security (RLS)** enabled on all tables
- **Tenant isolation** enforced at database level
- **JWT-based authentication** through Clerk
- **Service role** for administrative operations

## 🎨 UI/UX

### Design System

- **Color Palette**: Blue/Indigo primary with professional grays
- **Typography**: System fonts with clear hierarchy
- **Icons**: Lucide React for consistency
- **Layout**: Responsive design with mobile-first approach

### Key Pages

1. **Landing Page** - Modern, conversion-optimized homepage
2. **Dashboard** - Real-time metrics and quick actions
3. **Customers** - Contact management with search/filter
4. **Quotes** - Quote creation and management
5. **Jobs** - Production tracking and status updates

## 🔄 Workflow

### Quote-to-Job Process

1. **Customer Creation** - Add customer details
2. **Quote Generation** - Create detailed quotes with line items
3. **Quote Approval** - Customer accepts quote
4. **Job Conversion** - Automatically convert to manufacturing job
5. **Production Tracking** - Monitor progress and costs
6. **Completion** - Mark job complete and track metrics

## 🚧 Development Roadmap

### Phase 1 ✅ (Complete)
- Core authentication and tenant setup
- Basic job board and customer management
- Landing page and dashboard

### Phase 2 ✅ (Complete)  
- Quote management system
- Quote-to-job conversion
- Enhanced customer profiles

### Phase 3 🚧 (In Progress)
- Production scheduling with FullCalendar
- Real-time job status tracking
- Time logging and cost tracking

### Phase 4 📋 (Planned)
- Inventory management
- Machine integration (MTConnect, OPC-UA)
- Advanced analytics and reporting

### Phase 5 📋 (Future)
- Quality control workflows
- Shipping and logistics
- Mobile operator interface

### Phase 6 📋 (Future)
- Business intelligence dashboards
- Third-party integrations (QuickBooks, etc.)
- Advanced forecasting and planning

## 🛠️ Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test API endpoints thoroughly
- Ensure responsive design on all screen sizes

## 📄 License

This is proprietary software. All rights reserved. Not for public distribution or sharing.

## 🙏 Acknowledgments

- **Clerk** for authentication infrastructure
- **Supabase** for backend and database services
- **Next.js** for the excellent React framework
- **Tailwind CSS** for rapid UI development
- **Lucide** for beautiful icons

## 📞 Internal Notes

This is a private development project. All development and deployment decisions are internal.

---

**Built with ❤️ for the manufacturing community**

*Transforming manufacturing operations from chaos to clarity, one job shop at a time.*