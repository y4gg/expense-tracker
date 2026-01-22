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
```

**Testing**: No test framework configured. To add tests: add `"test": "bun test"` to package.json, then run with `bun run test -- path/to/component.test.tsx`.

**Note**: Uses Bun runtime, Next.js 16.1.4, React 19.2.3, PostgreSQL + Drizzle, BetterAuth, tRPC 11, TanStack Query 5.

## Project Architecture

```
actions/          # Legacy server actions (reference only)
server/           # tRPC backend
├── api/
│   ├── trpc.ts, root.ts
│   └── routers/ (expenses, categories, recurring)
app/              # Next.js App Router
├── api/
│   ├── auth/[...all]/  # BetterAuth API
│   │   └── change-password, update-email, delete-account routes
│   └── trpc/[...trpc]/ # tRPC API route handler
├── auth/signin/, auth/signup/
└── dashboard/ (layout, page, settings/, account/)
components/ (auth/, dashboard/, expenses/, recurring/, settings/, ui/)
trpc/ (react.tsx, server.tsx, provider.tsx)
db/ (index.ts, schema.ts, drizzle/)
lib/ (auth.ts, auth-client.ts, utils.ts)
```

## Code Style Guidelines

### Import Order
1. React/hooks imports
2. Third-party library imports (alphabetically grouped)
3. Local imports using `@/` alias (alphabetically grouped)
4. Type imports (if separated)

**Example**:
```typescript
import React from "react";
import { useState } from "react";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
```

### Server Components (Pages)
- Use `async function` for component declarations
- Next.js 16+: await searchParams before accessing
- Import server caller: `import { getTRPCCaller } from "@/trpc/server"`
- Use `redirect()` from `next/navigation`
- Always add `"use client";` when using hooks

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
- Session automatically injected via tRPC context middleware

### tRPC Client Components
- Use `trpc` from `@/trpc/react`
- Queries: `const { data } = trpc.expenses.getAll.useQuery()`
- Mutations with cache invalidation:
  ```typescript
  const mutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted successfully");
      utils.expenses.invalidate();
    },
  });
  ```

### Database Schema (`db/schema.ts`)
- Use `pgTable` for PostgreSQL
- Column naming: camelCase in code, snake_case in DB
- Use `text()`, `timestamp()`, `numeric()`, `boolean()`, `pgEnum()`
- Add indexes as second parameter to `pgTable()`
- Relations via `relations()` function separately
- References: `.references(() => otherTable.id, { onDelete: "cascade" })`

### API Routes (`app/api/auth/*/route.ts`)
- Import `auth` from `@/lib/auth`
- Use `auth.api` methods for auth operations
- Get session: `const session = await auth.api.getSession({ headers: request.headers })`
- Check auth: `if (!session) return NextResponse.json({ error }, { status: 401 })`
- Revoke sessions: Set `revokeOtherSessions: true` on password/email changes

### Naming Conventions
- **Components**: PascalCase (`AddExpenseDialog`, `CategoryList`, `ChangePasswordDialog`)
- **Functions/Procedures**: camelCase (`getExpenses`, `expenses.create`, `addDays`)
- **Interfaces**: PascalCase (`Category`, `ExpenseFormData`, `ChangePasswordDialogProps`)
- **DB Tables**: lowercase singular (`user`, `expense`, `category`, `recurring_transaction`)
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for components (`change-password-dialog.tsx`), pages (`dashboard/settings/page.tsx`)

### TypeScript
- Explicit types for params and returns
- Inline types for simple props: `{ id: string; name: string }`
- `React.ReactNode` for children, `React.FormEvent` for forms
- Define interfaces for complex props or state
- Avoid `any` - use `unknown` with proper type guards if needed

### Error Handling
- **tRPC**: Throw `TRPCError` with descriptive codes
- **Client**: Use `toast` from `sonner` for user feedback
- **Async**: try/catch with toast
- **Empty catch**: OK when error handled by toast/library
- **API routes**: Return proper HTTP status codes (401 unauthorized, 404 not found, 400 bad request)
- **Zod validation**: Show field-level errors with `text-sm text-destructive`

### Styling
- Use `cn()` from `@/lib/utils` for conditional classes
- shadcn/ui in `@/components/ui/`
- Semantic variants over arbitrary values
- Dark mode: `dark:` prefix
- Cards: `rounded-xl shadow-md` for consistency
- Danger zones: `border-destructive/50` with red text
- Consistent spacing: `space-y-4` for form fields, `space-y-6` for cards

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
- Always invalidate all affected queries (expenses, categories, recurring)

## Authentication

### Server Side
- Import: `import { auth } from "@/lib/auth"`
- Session access: Available via tRPC context automatically

### Client Side
- Import: `import { authClient } from "@/lib/auth-client"`
- Sign in: `authClient.signIn.email({ email, password, callbackURL: "/dashboard" })`
- Sign up: `authClient.signUp.email({ email, password, callbackURL: "/dashboard" })`
- Sign out: `authClient.signOut()` with redirect to `/auth/signin`

### Account Management
Use BetterAuth server-side methods via API routes:
- **Change Password**: `auth.api.changePassword()` with `revokeOtherSessions: true`
- **Update Email**: `auth.api.updateEmail()` with `revokeOtherSessions: true`
- **Delete Account**: `auth.api.deleteUser()` for cascade deletion

### Password Validation
Client-side validation with zod: min 8 chars, uppercase, lowercase, number, special char (regex). Requirements NEVER visible - only show errors on validation failure.

## Page Structure

### Dashboard Pages
- **Dashboard** (`/dashboard`): Summary overview with stats
- **Settings** (`/dashboard/settings`): App preferences (theme, recurring)
- **Account** (`/dashboard/account`): User account management (password, email, delete)

### Navigation
- Use `Link` from `next/link` for page navigation
- User dropdown has links to both Settings and Account pages
- Settings link in sidebar for app settings, Account in user dropdown for user settings

## Component Patterns

### Forms
- Use `onSubmit={handleSubmit}` on form elements
- Event handlers: `(e: React.FormEvent) => void`
- Prevent default with `e.preventDefault()`
- Zod validation before submission
- Show validation errors below inputs with `text-sm text-destructive`

### Dialogs
- Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`
- Manage open state via parent prop: `open={open} onOpenChange={setOpen}`
- Close on success/error
- Reset form fields after close

### Sheets
- Use for side panels and addition forms
- Slide from right (default shadcn behavior)
- Add horizontal padding: `className="px-4"`

### Cards
- Consistent styling: `rounded-xl shadow-md`
- Header: `CardHeader` with `CardTitle` and `CardDescription`
- Content: `CardContent` with proper spacing

## Important Constraints

- **Server actions**: Use tRPC instead (legacy `actions/` kept for reference)
- **Next.js 16**: Always await searchParams before accessing
- **Auth checks**: Every tRPC procedure validates session from context
- **Type safety**: Run `bun run lint && bunx tsc --noEmit` before committing
- **No comments**: Don't add comments unless requested
- **No console.log**: Use toast for user-facing messages

## Development Workflow

### Before Committing
1. Run lint: `bun run lint`
2. Run typecheck: `bunx tsc --noEmit`
3. Fix all errors and warnings
4. Test changes manually in dev environment

### Making Changes
1. Use consistent coding patterns from existing code
2. Follow import order and naming conventions
3. Ensure proper error handling and user feedback
4. Maintain consistent styling and spacing
5. Test auth flows (sign in, sign out, session management)

## Testing

When adding tests: choose test framework, add `"test": "bun test"` to package.json, run with `bun run test -- path/to/component.test.tsx` or `bun run test` for all tests. Test auth flows, tRPC procedures, and component interactions. Mock external dependencies appropriately.

## Security Best Practices

- Never log or expose passwords/tokens
- Always validate on both client and server side
- Use HTTPS in production
- Revoke other sessions on credential changes (`revokeOtherSessions: true`)
- Cascade delete user data on account deletion
- Use BetterAuth session management instead of manual handling
