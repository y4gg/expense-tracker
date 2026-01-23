# AGENTS.md - Guidelines for Expense Tracker

Coding guidelines and commands for agentic AI coding agents.

## Build, Lint, and Test Commands

```bash
bun run dev              # Start Next.js dev server
bun run build           # Production build
bun run start           # Start production server
bun run lint            # Run ESLint
bunx tsc --noEmit       # TypeScript type checking
bunx drizzle-kit generate  # Generate migrations
bunx drizzle-kit migrate    # Apply migrations
bunx drizzle-kit studio     # Open Drizzle Studio
bun run test -- path/to/component.test.tsx  # Run single test (add "test": "bun test" to package.json)
```

**Tech Stack**: Bun, Next.js 16.1.4, React 19, PostgreSQL + Drizzle, BetterAuth, tRPC 11, TanStack Query 5

## Project Architecture

```
actions/          # Legacy server actions (reference only)
server/api/routers/  # tRPC procedures (expenses, categories, recurring)
app/              # Next.js App Router (api/, auth/, dashboard/)
components/       # UI components (auth/, dashboard/, expenses/, recurring/, settings/, ui/)
trpc/             # tRPC client/server setup
db/               # Database schema and Drizzle config
lib/              # Utilities (auth, utils)
```

## Code Style Guidelines

### Import Order
1. React/hooks imports
2. Third-party library imports (alphabetical)
3. Local imports using `@/` alias (alphabetical)
4. Type imports (if separated)

### Server Components (Pages)
- Use `async function` declarations
- Next.js 16+: await searchParams before accessing
- Import server caller: `import { getTRPCCaller } from "@/trpc/server"`
- Use `redirect()` from `next/navigation`
- Add `"use client";` when using hooks

### Client Components
- Add `"use client";` as first line
- Define TypeScript interfaces for props
- Use React hooks for state management
- Event handlers: `(e: React.FormEvent) => void`
- Use `toast` from `sonner` for user feedback

### tRPC Procedures (`server/api/routers/*.ts`)
- Add `"use server";` at top
- Import auth from context: `const { ctx } = procedure.use()`
- Use `zod` for input validation
- Throw `TRPCError` with codes: `UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`
- Return plain objects

### Database Schema (`db/schema.ts`)
- Use `pgTable` for PostgreSQL
- Column naming: camelCase in code, snake_case in DB
- Use `text()`, `timestamp()`, `numeric()`, `boolean()`, `pgEnum()`
- Relations via `relations()` function separately
- References: `.references(() => otherTable.id, { onDelete: "cascade" })`

### API Routes (`app/api/auth/*/route.ts`)
- Import `auth` from `@/lib/auth`
- Use `auth.api` methods for auth operations
- Get session: `const session = await auth.api.getSession({ headers: request.headers })`
- Check auth: `if (!session) return NextResponse.json({ error }, { status: 401 })`
- Revoke sessions: Set `revokeOtherSessions: true` on password/email changes

## Naming Conventions
- **Components**: PascalCase (`AddExpenseDialog`)
- **Functions/Procedures**: camelCase (`getExpenses`, `expenses.create`)
- **Interfaces**: PascalCase (`Category`, `ExpenseFormData`)
- **DB Tables**: lowercase singular (`user`, `expense`, `category`)
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case (`change-password-dialog.tsx`, `dashboard/settings/page.tsx`)

## TypeScript
- Explicit types for params and returns
- Inline types for simple props: `{ id: string; name: string }`
- `React.ReactNode` for children, `React.FormEvent` for forms
- Define interfaces for complex props or state
- Avoid `any` - use `unknown` with proper type guards

## Error Handling
- **tRPC**: Throw `TRPCError` with descriptive codes
- **Client**: Use `toast` from `sonner` for user feedback
- **Async**: try/catch with toast, empty catch OK when handled by library
- **API routes**: Return proper HTTP status codes (401, 404, 400)
- **Zod validation**: Show field-level errors with `text-sm text-destructive`

## Styling
- Use `cn()` from `@/lib/utils` for conditional classes
- shadcn/ui in `@/components/ui/`
- Semantic variants over arbitrary values
- Dark mode: `dark:` prefix
- Cards: `rounded-xl shadow-md`
- Danger zones: `border-destructive/50` with red text
- Consistent spacing: `space-y-4` for forms, `space-y-6` for cards

## tRPC Patterns
- **Queries**: `trpc.expenses.getAll.useQuery({ categoryId: "123", type: "income" })`
- **Conditional queries**: `trpc.expenses.getAll.useQuery(enabled && { categoryId: id })`
- **Mutations with invalidation**:
  ```typescript
  const mutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted successfully");
      utils.expenses.invalidate();
    },
  });
  ```
- Always invalidate all affected queries after mutations

## Authentication
- **Server**: Import `auth` from `@/lib/auth`, session via tRPC context
- **Client**: Import `authClient` from `@/lib/auth-client`
- **Sign in**: `authClient.signIn.email({ email, password, callbackURL: "/dashboard" })`
- **Sign up**: `authClient.signUp.email({ email, password, callbackURL: "/dashboard" })`
- **Sign out**: `authClient.signOut()` with redirect to `/auth/signin`
- **Account**: Use BetterAuth API routes with `revokeOtherSessions: true`
- **Password validation**: min 8 chars, uppercase, lowercase, number, special char (zod regex). Requirements NEVER visible - only show errors on validation failure.

## Page Structure
- **Dashboard** (`/dashboard`): Summary with stats
- **Settings** (`/dashboard/settings`): App preferences (theme, recurring)
- **Account** (`/dashboard/account`): User account (password, email, delete)
- Use `Link` from `next/link` for navigation
- Settings link in sidebar, Account in user dropdown

## Component Patterns
- **Forms**: Use `onSubmit={handleSubmit}`, prevent default, zod validation, show errors with `text-sm text-destructive`
- **Dialogs**: Manage open state via parent prop `open={open} onOpenChange={setOpen}`, close on success/error, reset form
- **Sheets**: Use for side panels, add `className="px-4"`
- **Cards**: `CardHeader` with `CardTitle`/`CardDescription`, `CardContent` with spacing

## Important Constraints
- **Server actions**: Use tRPC instead (legacy `actions/` for reference only)
- **Next.js 16**: Always await searchParams before accessing
- **Auth checks**: Every tRPC procedure validates session from context
- **Type safety**: Run `bun run lint && bunx tsc --noEmit` before committing
- **No comments**: Don't add comments unless requested
- **No console.log**: Use toast for user-facing messages

## Security
- Never log or expose passwords/tokens
- Always validate on both client and server side
- Use HTTPS in production
- Revoke other sessions on credential changes (`revokeOtherSessions: true`)
- Cascade delete user data on account deletion
- Use BetterAuth session management
