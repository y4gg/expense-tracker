# AGENTS.md - Guidelines for Expense Tracker

Coding guidelines and commands for agentic AI coding agents.

## Build, Lint, and Typecheck Commands

```bash
bun run dev              # Start Next.js dev server with Turbopack
bun run build           # Production build
bun run start           # Start production server
bun run lint            # Run ESLint
bunx tsc --noEmit    # TypeScript type checking
bunx drizzle-kit generate  # Generate migrations
bunx drizzle-kit migrate    # Apply migrations
bunx drizzle-kit studio     # Open Drizzle Studio
bun run test            # Run all tests
bun run test:component  # Run single component: bun run test -- path/to/component.test.tsx
```

**Note**: Uses Bun runtime, Next.js 16.1.4, React 19.2.3, PostgreSQL + Drizzle, BetterAuth, tRPC 11, TanStack Query 5.

## Project Architecture

```
actions/          # Legacy server actions (kept for reference)
├── expenses.ts
server/           # tRPC backend
├── api/
│   ├── trpc.ts          # tRPC context with session/auth
│   ├── root.ts          # Root router merging all routers
│   └── routers/
│       ├── expenses.ts    # Expense procedures
│       └── categories.ts # Category procedures
app/              # Next.js App Router
├── api/
│   ├── auth/[...all]/  # BetterAuth API routes
│   └── trpc/[...trpc]/ # tRPC API route handler
├── auth/signin/, auth/signup/
└── dashboard/             # Main app with sidebar layout
    ├── layout.tsx      # Dashboard layout with auth check
    ├── page.tsx        # Dashboard summary (uses tRPC server caller)
    ├── transactions/    # Transaction list (uses tRPC React client)
    ├── categories/     # Category management (uses tRPC React client)
    └── settings/       # Settings page
components/
├── auth/          # Auth components
├── dashboard/      # Sidebar, user dropdown
├── expenses/       # Expense/income components (tRPC client)
├── ui/            # shadcn/ui reusable components
├── theme-provider.tsx
trpc/
├── react.tsx       # React tRPC client
└── provider.tsx    # tRPC + TanStack Query provider
db/
├── index.ts, schema.ts
└── drizzle/         # Database migrations
lib/
├── auth.ts, auth-client.ts, utils.ts
```

## Code Style Guidelines

### Import Order
1. React/hooks imports
2. Third-party library imports (alphabetically grouped)
3. Local imports using `@/` alias (alphabetically grouped)
4. Type imports (if separated)

### Server Components (Pages)
- Use `async function` for component declarations
- Next.js 16+: await searchParams before accessing
- Import server actions OR tRPC caller: `import { getTRPCCaller } from "@/trpc/server"`
- Use `redirect()` from `next/navigation`

### Client Components
- Add `"use client";` as first line
- Define TypeScript interfaces for props
- Use React hooks for state management
- Event handlers: `(e: React.FormEvent) => void`
- Use `toast` from `sonner` for feedback

### tRPC Procedures (`server/api/routers/*.ts`)
- Add `"use server";` at top
- Import auth from context: `const { ctx } = procedure.use()`
- Use `zod` for input validation
- Throw `TRPCError` with proper codes (`UNAUTHORIZED`, `NOT_FOUND`)
- Return plain objects

### tRPC Client Components
- Use `trpc` from `@/trpc/react`
- Queries: `const { data } = trpc.expenses.getAll.useQuery()`
- Mutations with cache invalidation:
  ```typescript
  const mutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      utils.expenses.invalidate();
    },
  });
  ```

### Database Schema (`db/schema.ts`)
- Use `pgTable` for PostgreSQL
- Column naming: camelCase in code, snake_case in DB
- Use `text()`, `timestamp()`, `numeric()`, `boolean()`
- Add indexes as second parameter to `pgTable()`
- Relations via `relations()` function separately
- References: `.references(() => otherTable.id, { onDelete: "cascade" })`

### Naming Conventions
- **Components**: PascalCase (`AddExpenseDialog`, `CategoryList`)
- **Functions/Procedures**: camelCase (`getExpenses`, `expenses.create`)
- **Interfaces**: PascalCase (`Category`, `ExpenseFormData`)
- **DB Tables**: lowercase singular (`user`, `expense`, `category`)
- **Constants**: UPPER_SNAKE_CASE

### TypeScript
- Explicit types for params and returns
- Inline types for simple props: `{ id: string; name: string }`
- `React.ReactNode` for children, `React.FormEvent` for forms
- Avoid `any`

### Error Handling
- **tRPC**: Throw `TRPCError` with descriptive codes
- **Client**: Use `toast` from `sonner`
- **Async**: try/catch with toast
- **Empty catch**: OK when error handled by toast/library

### Styling
- Use `cn()` from `@/lib/utils`
- shadcn/ui in `@/components/ui/`
- Semantic variants over arbitrary values
- Dark mode: `dark:` prefix

## tRPC Patterns

### Queries
- Simple: `trpc.expenses.getAll.useQuery()`
- With filters: `trpc.expenses.getAll.useQuery({ categoryId: "123", type: "income" })`
- Conditional: `trpc.expenses.getAll.useQuery(enabled && { categoryId: id })`

### Mutations
- Create with invalidation:
  ```typescript
  const create = trpc.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Created successfully");
      utils.expenses.invalidate();
      utils.categories.invalidate();
    },
  });
  ```

### Cache Management
- Invalidate related queries after mutations
- Use `trpc.useUtils()` for `invalidate()` helper
- Always invalidate all affected queries

## Authentication
- **Server**: `auth` from `@/lib/auth`
- **Client**: `authClient` from `@/lib/auth-client`
- **Email/password**: `authClient.signIn.email()` and `authClient.signUp.email()`
- **Callbacks**: `callbackURL: "/dashboard"`
- **Sign out**: `authClient.signOut()` with redirect
- **tRPC context**: Session auto-injected

## Important Constraints
- **Server actions**: Use tRPC instead (legacy `actions/` kept for reference)
- **Next.js 16**: Always await searchParams
- **Auth checks**: Every tRPC procedure validates session from context
- **Type safety**: Run `bun run lint && bunx tsc --noEmit` before committing
- **No comments**: Don't add comments unless requested
