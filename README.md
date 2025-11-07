# PeopleFlow - People & Organisation Management MVP

A modern web application for managing people, organisational structure, and employee lifecycle.

## 🚀 Features (MVP)

- ✅ **Authentication** - Secure login with role-based access control
- ✅ **People Directory** - Browse, search, and manage employee records
- ✅ **Organisation Chart** - Visualize reporting structure and hierarchy
- ✅ **Dashboard** - Key metrics and insights at a glance
- ✅ **Responsive UI** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Playwright + Stagehand (AI-powered)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or pnpm

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PeopleFlowClaude
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb peopleflow
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/peopleflow"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-random-secret>"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 5. Initialize Database

Run Prisma migrations and seed data:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Test Credentials

After seeding, you can log in with:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Password123! | Super Admin |
| hr@company.com | Password123! | HR Admin |
| manager@company.com | Password123! | Manager |
| employee@company.com | Password123! | Employee |

## 📁 Project Structure

```
PeopleFlowClaude/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed data
├── tests/                # E2E and integration tests
└── public/               # Static assets
```

## 🗄️ Database Schema

### Core Entities

- **User** - Authentication accounts with roles
- **Person** - Employee records with full details
- **Department** - Organisational departments
- **Location** - Office locations
- **AuditLog** - Change tracking

### Relationships

- Person → Manager (self-referential, reporting line)
- Person → Department (department membership)
- Person → Location (office location)
- Person ↔ User (optional link to auth account)

## 🧪 Testing

### E2E Tests with Playwright

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run Stagehand AI tests
npm run test:stagehand
```

See [tests/README.md](tests/README.md) for detailed testing guide.

## 🔧 Development

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Create migration
npm run db:migrate

# Reset database
npm run db:push -- --force-reset
npm run db:seed
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### People
- `GET /api/people` - List all people
- `GET /api/people/:id` - Get person details
- `POST /api/people` - Create person
- `PATCH /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person (soft)

### Departments
- `GET /api/departments` - List departments

### Locations
- `GET /api/locations` - List locations

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard metrics

## 🚢 Deployment

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL="<production-db-url>"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<strong-secret>"
NODE_ENV="production"
```

### Build

```bash
npm run build
npm start
```

### Docker (Optional)

```bash
docker build -t peopleflow .
docker run -p 3000:3000 peopleflow
```

## 🔒 Security

- Passwords hashed with bcrypt
- Session-based authentication with NextAuth
- Role-based access control (RBAC)
- SQL injection protection via Prisma
- XSS protection via React
- CSRF protection via NextAuth

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📖 Documentation

- [Requirements Specification](REQUIREMENTS.md) - Full product requirements
- [Testing Guide](tests/README.md) - E2E testing with Playwright & Stagehand
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql postgresql://username:password@localhost:5432/peopleflow
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run db:generate

# Clear Prisma cache
rm -rf node_modules/.prisma
npm run db:generate
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📄 License

MIT

## 💬 Support

For questions or issues:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Requirements Specification](REQUIREMENTS.md)
- Consult the [Testing Guide](tests/README.md)

---

**Built with ❤️ using Next.js, Prisma, and TailwindCSS**
