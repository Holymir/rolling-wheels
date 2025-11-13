# Backend Setup Guide

This guide will help you set up the backend for the Steel Riders MC Member Portal.

## Overview

The backend is built with:
- **Next.js API Routes** - RESTful API endpoints
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication
- **SQLite** (development) / **PostgreSQL** (production on Railway)
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+ installed
- npm, pnpm, or yarn package manager

## Initial Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# For local development (SQLite)
DATABASE_URL="file:./dev.db"

# For production (PostgreSQL on Railway)
# DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Important:** Generate a secure `NEXTAUTH_SECRET`:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use this online tool:
# https://generate-secret.vercel.app/32
```

### 3. Generate Prisma Client

```bash
npm run db:generate
# or
pnpm db:generate
```

### 4. Create the Database

For SQLite (development):
```bash
npm run db:push
# or
pnpm db:push
```

This creates the `dev.db` file with all tables.

### 5. Seed the Database

Populate the database with demo data:

```bash
npm run db:seed
# or
pnpm db:seed
```

This creates:
- **5 demo users** (admin, john_steel, mike_thunder, jake_rookie, visitor)
- **3 member profiles**
- **3 events**
- **Event RSVPs**
- **Sample payments**
- **5 club rules**

## Demo Credentials

After seeding, you can log in with:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| john_steel | member123 | Member |
| mike_thunder | member123 | Member |
| jake_rookie | prospect123 | Prospect |
| visitor | guest123 | Guest |

## Available Scripts

### Database Management

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (no migrations)
npm run db:push

# Create and run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (caution: deletes all data!)
npm run db:reset
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Database Schema

### Models

- **User** - Authentication and user accounts
- **Member** - Member profile information
- **Event** - Club events (meetings, rides, parties)
- **EventRsvp** - Event attendance tracking
- **Payment** - Dues and financial records
- **Rule** - Club rules and bylaws

## API Endpoints

All endpoints require authentication (except login).

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create member (admin only)
- `GET /api/members/[id]` - Get member details
- `PUT /api/members/[id]` - Update member (admin only)
- `DELETE /api/members/[id]` - Delete member (admin only)

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (admin/member)
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event (admin/member)
- `DELETE /api/events/[id]` - Delete event (admin only)
- `POST /api/events/[id]/rsvp` - RSVP to event
- `DELETE /api/events/[id]/rsvp` - Cancel RSVP

### Payments (Ledger)
- `GET /api/payments` - List payments (filtered by role)
- `POST /api/payments` - Create payment (admin only)
- `GET /api/payments/[id]` - Get payment details
- `PUT /api/payments/[id]` - Update payment (admin only)
- `DELETE /api/payments/[id]` - Delete payment (admin only)

### Rules
- `GET /api/rules` - List all rules
- `POST /api/rules` - Create rule (admin only)
- `GET /api/rules/[id]` - Get rule details
- `PUT /api/rules/[id]` - Update rule (admin only)
- `DELETE /api/rules/[id]` - Delete rule (admin only)

## Production Deployment (Railway)

### 1. Update Database Configuration

In `prisma/schema.prisma`, change the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Set Environment Variables on Railway

```env
DATABASE_URL=<your-railway-postgres-url>
NEXTAUTH_URL=<your-production-url>
NEXTAUTH_SECRET=<your-generated-secret>
```

### 3. Run Migrations

Railway will automatically run migrations on deployment. Or manually:

```bash
npm run db:migrate
```

### 4. Seed Production Database (Optional)

```bash
npm run db:seed
```

## Troubleshooting

### Prisma Client Not Found

```bash
npm run db:generate
```

### Database Connection Errors

1. Check `.env` file exists and has correct `DATABASE_URL`
2. For SQLite, ensure the directory exists
3. For PostgreSQL, verify connection string

### "Table does not exist" Errors

```bash
npm run db:push
# or
npm run db:migrate
```

### Reset Everything

```bash
# Careful: This deletes all data!
npm run db:reset
```

## Switching from SQLite to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/database"
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

That's it! Prisma handles the rest.

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Change default passwords** in production
3. **Use strong `NEXTAUTH_SECRET`** in production
4. **Implement rate limiting** for API routes (recommended)
5. **Enable HTTPS** in production
6. **Review and update CORS** settings if needed

## Next Steps

1. Update the frontend to use the new API endpoints
2. Replace the mock `auth-context.tsx` with NextAuth session provider
3. Add proper error handling and loading states
4. Implement pagination for large datasets
5. Add search and filtering capabilities
6. Set up monitoring and logging

## Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- Check NextAuth docs: https://next-auth.js.org/
- Review the API route handlers in `app/api/`

Happy coding! 🏍️
