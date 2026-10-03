# JudesCart

A full-stack e-commerce and lucky draw platform built with Next.js, Express.js, TypeScript, and MongoDB.

## Architecture

- **User Storefront (`/user`)**: Next.js App Router, Tailwind CSS, Better-Auth integration, Razorpay checkout, product catalog, customer orders, and lucky draw portal.
- **Admin Dashboard (`/admin`)**: Next.js App Router, Lucide icons, full catalog management (categories, subcategories, brands, variations, products), draw campaigns, orders management, coupon management, and analytics.
- **Backend API (`/backend`)**: Express.js, Prisma ORM, MongoDB, Better-Auth, Cloudinary upload, Razorpay payment processing, order lifecycle handling, and lucky draw algorithms.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- Cloudinary account (for image uploads)
- Razorpay account (for payments)

### Running Locally

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Admin Dashboard**:
   ```bash
   cd admin
   npm install
   npm run dev
   ```

3. **User Storefront**:
   ```bash
   cd user
   npm install
   npm run dev
   ```
