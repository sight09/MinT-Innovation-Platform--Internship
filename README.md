
<h1 align="center">MInT Innovation Platform</h1>

<p align="center">
	<img src="public/landing_image.png" width="100%" alt="MInT Innovation Platform">
</p>

The MInT Innovation Platform is a role-based ecosystem portal for Ethiopia's Ministry of Innovation and Technology. It provides a shared operating surface for startups, mentors, investors, and MInT administrators to discover opportunities, manage reviews, coordinate engagement, and track startup readiness.

This repository contains the web application, API routes, Prisma data model, seed data, authentication flows, and the local knowledge assistant.

## Product Capabilities

- Public startup discovery and startup detail pages
- Startup registration, email verification, profile completion, submission, and feedback
- Mentor profiles, startup assignments, structured reviews, and questions
- Investor profiles, recommendations, saved startups, and investment interests
- Role-aware dashboards for startups, mentors, investors, and administrators
- MInT administration for users, startups, mentors, investors, knowledge documents, analytics, and audit logs
- Notifications and direct messaging
- Password reset and optional Google sign-in
- AI-assisted platform guidance, startup analysis, and knowledge retrieval

The AI assistant currently runs in local demo mode. It uses a keyword-based knowledge base and response templates; it does not call an external LLM provider.

## Technology

- Next.js `16.3.3` with the App Router
- React `19.2.8` and TypeScript
- Tailwind CSS `4` through the PostCSS plugin
- Prisma `6` with SQLite for local persistence
- NextAuth `5` beta with Prisma Adapter and JWT sessions
- Zod and React Hook Form for validation and forms
- Radix UI primitives, Lucide icons, and Framer Motion
- Recharts for dashboard visualizations
- Resend for optional transactional email delivery

## Requirements

- Node.js `20.9` or newer
- npm
- A local filesystem writable by the application for the SQLite database

The current Prisma datasource is fixed to SQLite at `file:./dev.db` relative to the `prisma` directory. A separate PostgreSQL or MySQL database is not required by the current implementation.

## Local Setup

### 1. Install dependencies

```bash
npm ci
```

Use `npm install` instead when intentionally updating the lockfile.

### 2. Configure environment variables

Create `.env.local` in the repository root:

```env
AUTH_SECRET="replace-with-a-long-random-value"
APP_URL="http://localhost:3000"

# Optional: enables Google sign-in
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Optional: enables real email delivery. Without RESEND_API_KEY,
# verification and reset messages are logged by the development server.
RESEND_API_KEY=""
EMAIL_FROM="onboarding@resend.dev"
```

`AUTH_SECRET` is required for stable NextAuth sessions. `APP_URL` is used when generating password-reset links. Google OAuth and Resend are optional for local development.

### 3. Create the database

Generate the Prisma Client and apply the current schema:

```bash
npx prisma generate
npm run db:push
```

This creates or updates `prisma/dev.db`.

### 4. Seed local demo data (optional)

```bash
npm run db:seed
```

The seed script deletes existing application data before recreating the demo dataset. Run it only against a disposable local database. It creates representative startup, mentor, investor, administrator, review, message, notification, and knowledge-base records.

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seeded Demo Accounts

These accounts are for local development only and must not be reused in a deployed environment.

| Role | Email | Password |
| --- | --- | --- |
| MInT administrator | `admin@mint.gov.et` | `Admin@MInT2025!` |
| Mentor | `dr.ayele.bekele@mint.gov.et` | `Mentor@MInT2025!` |
| Mentor | `selamawit.tadesse@mint.gov.et` | `Mentor@MInT2025!` |
| Investor | `habte.girma@ethiopianventures.com` | `Investor@2025!` |
| Startup | `founder@agromarketai.et` | `Startup@2025!` |
| Startup | `contact@healthbridge.et` | `Startup@2025!` |

## Application Structure

```text
.
├── prisma/
│   ├── schema.prisma       # SQLite schema and domain relations
│   └── seed.ts             # Disposable local demo data
├── public/                 # Static images and branding assets
├── src/
│   ├── app/                # App Router pages, layouts, and API routes
│   │   ├── admin/          # MInT administration console
│   │   ├── dashboard/      # Authenticated role-based workspaces
│   │   ├── api/            # Authentication and application endpoints
│   │   └── ...             # Public, auth, messaging, and resource pages
│   ├── components/        # Feature and layout components
│   ├── lib/                # Auth, Prisma, email, AI, and shared utilities
│   └── types/              # Shared TypeScript and NextAuth declarations
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

### Domain model

The Prisma schema is organized around `User` and role-specific profiles:

- `StartupProfile` with teams, documents, scores, reviews, and investment interests
- `MentorProfile` with assignments, reviews, and questions
- `InvestorProfile` with startup interests and investment preferences
- Cross-cutting records for notifications, messages, audit logs, AI conversations, and knowledge documents

Roles are `STARTUP`, `MINT_MENTOR`, `INVESTOR`, and `MINT_ADMIN`. Account, startup, review, and investment-interest statuses are represented as Prisma enums.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Apply the Prisma schema to the SQLite database |
| `npm run db:seed` | Destructively recreate the local demo dataset |
| `npx prisma studio` | Open the Prisma data browser |
| `npx prisma generate` | Generate the Prisma Client |

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Database Operations

For local schema iteration:

```bash
npm run db:push
npx prisma generate
```

To inspect local records:

```bash
npx prisma studio
```

To reset the disposable SQLite database:

```bash
npx prisma db push --force-reset
npm run db:seed
```

The reset command permanently removes local records. The project currently uses `db push`, not a committed Prisma migration history. Establish a migration workflow before using this repository for production data.

## Authentication and Email

Credentials authentication uses bcrypt password hashes stored in Prisma. Google sign-in is enabled only when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are configured. New Google users are created as pending startups and require administrative review.

When `RESEND_API_KEY` is absent, verification OTPs and password-reset messages are printed to the development server logs. Configure `RESEND_API_KEY`, `EMAIL_FROM`, and `APP_URL` to send real email through Resend.

## Production Considerations

This repository is currently optimized for local development and demonstration. Before production deployment:

- Replace SQLite with an appropriately managed production database and introduce Prisma migrations.
- Replace every seeded password and generate a new `AUTH_SECRET`.
- Configure a verified Resend sender domain and production `APP_URL`.
- Configure and verify Google OAuth redirect URIs if Google sign-in is required.
- Review authorization, file-upload storage, rate limiting, audit retention, and secret management for the deployment environment.
- Run `npm run lint` and `npm run build` in CI before release.

## License and Ownership

No license file is currently included in this repository. Confirm the project's distribution and contribution terms with the owning organization before publishing or redistributing it.
