# Expense Tracker

An expense tracking application built with Next.js, Bun, Drizzle, BetterAuth, and shadcn/ui.

## Features

- **Authentication**: Email/password sign up and sign in using BetterAuth
- **Categories**: Create and manage expense categories with custom colors
- **Expenses**: Add, view, and delete expenses with category assignment
- **Filtering**: Filter expenses by category
- **Total Calculation**: Real-time total of all expenses displayed on dashboard

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: BetterAuth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4

## Getting Started

### Prerequisites

- Bun installed
- PostgreSQL running on localhost:5432

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```

3. Run database migrations:
   ```bash
   bunx drizzle-kit migrate
   ```

4. Start development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Login at `/auth/signin`
3. **Dashboard**: Access your expense tracker at `/dashboard`
4. **Add Categories**: Create expense categories with custom colors
5. **Add Expenses**: Log your expenses with amount, description, date, and category
6. **Filter**: Filter expenses by clicking on category badges
7. **Delete**: Remove expenses and categories as needed

## Database Schema

### BetterAuth Tables
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification

### Custom Tables
- `category` - Expense categories (id, name, color, userId)
- `expense` - Expense records (id, amount, description, date, categoryId, userId)

## Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bunx drizzle-kit generate` - Generate migration
- `bunx drizzle-kit migrate` - Apply migrations
- `bunx drizzle-kit studio` - Open Drizzle Studio

## Project Structure

```
├── actions/
│   └── expenses.ts           # Server actions for expenses and categories
├── app/
│   ├── api/auth/[...all]/    # BetterAuth API routes
│   ├── auth/signin/          # Sign in page
│   ├── auth/signup/          # Sign up page
│   └── dashboard/            # Main dashboard
├── components/
│   ├── auth/                 # Authentication components
│   ├── expenses/             # Expense tracker components
│   └── ui/                   # shadcn/ui components
├── db/
│   ├── index.ts              # Database connection
│   └── schema.ts             # Drizzle schema
├── drizzle/                  # Migrations
├── lib/
│   ├── auth.ts               # BetterAuth instance
│   ├── auth-client.ts        # BetterAuth client
│   └── utils.ts              # Utility functions
└── drizzle.config.ts         # Drizzle configuration
```
