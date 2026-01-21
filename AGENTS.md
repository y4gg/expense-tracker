# AGENTS.md - Guidelines for Expense Tracker

Coding guidelines and commands for agentic AI coding agents.

## Build, Lint, and Typecheck Commands

```bash
# Development
bun run dev              # Start Next.js dev server with Turbopack

# Build & Deploy
bun run build           # Production build
bun run start           # Start production server

# Quality Checks
bun run lint            # Run ESLint
bunx tsc --noEmit    # TypeScript type checking (no output generation)

# Database
bunx drizzle-kit generate  # Generate migrations
bunx drizzle-kit migrate    # Apply migrations to database
bunx drizzle-kit studio     # Open Drizzle Studio for DB inspection
```

**Note**: This project uses Bun as package manager and runtime. No test suite is currently configured.

## Project Architecture

```
actions/          # Server actions (root level, NOT in app/)
├── expenses.ts
app/              # Next.js App Router
├── api/auth/[...all]/  # BetterAuth API routes
├── auth/signin/          # Authentication pages
├── auth/signup/
└── dashboard/             # Main application page
components/
├── auth/          # Authentication-related components
├── expenses/       # Expense tracker feature components
└── ui/            # shadcn/ui reusable components
db/
├── index.ts       # PostgreSQL connection (pg + drizzle)
└── schema.ts      # Drizzle ORM schema definitions
lib/
├── auth.ts        # BetterAuth server configuration
├── auth-client.ts # BetterAuth React client
└── utils.ts       # Utility functions (cn helper)
drizzle/          # Database migrations
```

## Code Style Guidelines

### Import Order
1. React/hooks imports
2. Third-party library imports (alphabetically grouped)
3. Local imports using `@/` alias (alphabetically grouped)
4. Type imports (if separated)

### Server Components (Pages)
- Use `async function` for component declarations
- Next.js 16+ requires awaiting searchParams:
  ```typescript
  export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const params = await searchParams;
  }
  ```
- Import server actions directly: `import { getExpenses } from "@/actions/expenses"`
- Use `redirect()` from `next/navigation` for redirects

### Client Components
- Add `"use client";` as the first line (no blank line before)
- Define TypeScript interfaces for props
- Use React hooks for state management
- Use event handlers with proper typing: `(e: React.FormEvent) => void`
- Use `toast` from `sonner` for user feedback

### Server Actions (`actions/*.ts`)
- Add `"use server";` as the first line
- Import `headers` from `next/headers`
- Always validate session at the start:
  ```typescript
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  ```
- For modifications, verify resource ownership:
  ```typescript
  const existing = await db.select().from(table)
    .where(and(eq(table.id, id), eq(table.userId, session.user.id)))
    .limit(1);
  if (!existing.length) {
    throw new Error("Resource not found");
  }
  ```
- Use `nanoid()` for ID generation
- Return success objects: `return { success: true };`
- Throw descriptive errors for auth/not-found cases

### Database Schema (`db/schema.ts`)
- Use `pgTable` for PostgreSQL tables
- Column naming: camelCase in code, snake_case in DB (`userId` -> `user_id`)
- Use appropriate types: `text()`, `timestamp()`, `numeric()`, `boolean()`
- Add indexes as second parameter to `pgTable()`
- Define relations separately using `relations()` function
- References: `.references(() => otherTable.id, { onDelete: "cascade" })`

### Naming Conventions
- **Components**: PascalCase (`AddExpenseDialog`, `CategoryList`)
- **Functions**: camelCase (`getExpenses`, `createCategory`)
- **Interfaces**: PascalCase (`Category`, `ExpenseFormData`)
- **DB Tables**: lowercase singular (`user`, `expense`, `category`)
- **Constants**: UPPER_SNAKE_CASE (rarely used)

### TypeScript Best Practices
- Use explicit types for function parameters and return values
- Use inline types for simple props: `{ id: string; name: string }`
- Use `React.ReactNode` for children props
- Use `React.FormEvent` for form submit handlers
- Avoid `any` - use proper types or `unknown`

### Error Handling
- **Server actions**: Throw errors with descriptive messages
- **Client components**: Use `toast` from `sonner` for error display
- **Async functions**: Use try/catch with toast for user feedback
- **Empty catch blocks**: Acceptable when error is handled by toast/library:
  ```typescript
  } catch {
    toast.error("Failed to save expense");
  }
  ```

### Styling (Tailwind CSS v4)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- shadcn/ui components available in `@/components/ui/`
- Prefer semantic variants over arbitrary values
- Dark mode: use `dark:` prefix

### Authentication Patterns
- **Server**: Use `auth` from `@/lib/auth`
- **Client**: Use `authClient` from `@/lib/auth-client`
- **Email/password auth**: Use `authClient.signIn.email()` and `authClient.signUp.email()`
- **Callbacks**: Pass `callbackURL: "/dashboard"` for redirects
- **Sign out**: Use `authClient.signOut()` with manual redirect

### BetterAuth Configuration
- Located in `lib/auth.ts`
- Uses Drizzle adapter with schema
- Email/password enabled, no email verification required
- Session: 7 days expiration, 1 day update age
- Cookie-based sessions with prefix "better-auth"

### shadcn/ui Components
- Install new components: `bunx shadcn@latest add <component-name>`
- Components located in `@/components/ui/`
- Use appropriate variants: `variant="outline"`, `size="sm"`, etc.

## Tech Stack
- Bun runtime & package manager
- Next.js 16.1.4 with App Router + Turbopack
- React 19.2.3, PostgreSQL + Drizzle ORM
- BetterAuth 1.4.17, shadcn/ui + Tailwind CSS v4
- Sonner for toasts, nanoid for IDs

## Important Constraints
- **Server actions location**: Must be in `actions/` at root level, NOT in `app/actions/`
- **Next.js 16 compatibility**: Always await searchParams before accessing properties
- **Auth checks**: Every server action must validate session and user ownership
- **Type safety**: Run `bun run lint && bunx tsc --noEmit` before committing
- **No comments**: Don't add comments unless explicitly requested
