# 🚀 PeopleFlow - Quick Start Guide

Get your PeopleFlow MVP up and running in 10 minutes!

## 📋 Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git

## ⚡ Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd PeopleFlowClaude

# Install dependencies
npm install
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb peopleflow

# Alternative: Using psql
psql -U postgres
CREATE DATABASE peopleflow;
\q
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and update:
# - DATABASE_URL with your PostgreSQL connection
# - NEXTAUTH_SECRET with a random string
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Your .env should look like:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/peopleflow"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
NODE_ENV="development"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data (15+ employees, departments, locations)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## 🔐 Login Credentials

After seeding, use these accounts:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@company.com | Password123! | Super Admin | Full access |
| hr@company.com | Password123! | HR Admin | People management |
| manager@company.com | Password123! | Manager | Team management |
| employee@company.com | Password123! | Employee | View only |

## 🎯 What's Included

### ✅ Features

- **Authentication** - Secure login with NextAuth
- **Dashboard** - Real-time org metrics and charts
- **People Directory** - Browse, search, filter employees
- **Person Profiles** - Detailed employee information
- **Create/Edit** - Add and manage employee records
- **Org Chart** - Hierarchical reporting structure
- **Departments** - Department overview and stats
- **Responsive** - Works on desktop, tablet, mobile

### 📊 Demo Data

- **15+ Employees** across 5 departments
- **5 Departments**: Engineering, Product, HR, Finance, Marketing
- **4 Locations**: London, Wolverhampton, Chatham, Bengaluru
- **Org Hierarchy**: CEO → VPs → Managers → Engineers
- **Skills, Bio, Reporting lines** - Fully populated

## 🧪 Testing

```bash
# Run E2E tests (Playwright)
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run AI-powered tests (Stagehand)
npm run test:stagehand
```

## 🛠️ Common Tasks

### View Database

```bash
# Open Prisma Studio (GUI)
npm run db:studio
```

### Reset Database

```bash
# Reset and reseed
npm run db:push -- --force-reset
npm run db:seed
```

### Add New User

```bash
# Open Prisma Studio
npm run db:studio

# Or use API after login
```

## 📁 Project Structure

```
PeopleFlowClaude/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login page
│   ├── (dashboard)/       # Protected pages
│   │   ├── dashboard/     # Dashboard
│   │   ├── people/        # People directory
│   │   ├── departments/   # Departments
│   │   └── org-chart/     # Org chart
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                   # Utilities
├── prisma/               # Database
│   ├── schema.prisma     # Schema definition
│   └── seed.ts           # Seed data
└── tests/                # E2E tests
```

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth.js
- **Charts**: Recharts
- **Testing**: Playwright, Stagehand (AI)

## 📚 Key Pages

| URL | Description |
|-----|-------------|
| `/` | Redirects to dashboard (if logged in) |
| `/login` | Login page |
| `/dashboard` | Dashboard with metrics |
| `/people` | People directory (list) |
| `/people/[id]` | Person detail page |
| `/people/new` | Create new person |
| `/departments` | Departments overview |
| `/org-chart` | Organisation chart |

## 🔧 Development Tips

### Hot Reload Issues?

```bash
# Restart dev server
npm run dev
```

### Database Connection Issues?

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql postgresql://username:password@localhost:5432/peopleflow
```

### Port Already in Use?

```bash
# Use different port
PORT=3001 npm run dev
```

### Prisma Client Issues?

```bash
# Regenerate Prisma Client
npm run db:generate
```

## 🚀 Next Steps

1. **Customize** - Update branding, colors, logo
2. **Add Features** - Extend with squads, hiring needs, etc.
3. **Deploy** - Deploy to Vercel, AWS, or Azure
4. **Integrate** - Connect to your HRIS, SSO, etc.

## 📖 Documentation

- [Full Requirements](REQUIREMENTS.md) - Complete specification
- [Testing Guide](tests/README.md) - E2E testing with Playwright & Stagehand
- [README](README.md) - Detailed documentation

## ❓ Troubleshooting

### "Invalid credentials" on login

- Ensure database is seeded: `npm run db:seed`
- Check user exists in Prisma Studio: `npm run db:studio`

### "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### "Database does not exist"

```bash
createdb peopleflow
npm run db:push
npm run db:seed
```

### Charts not rendering

- Check browser console for errors
- Ensure data is loaded (check Network tab)

## 🎉 Success!

You now have a fully functional MVP running!

Try:
1. ✅ Login with demo accounts
2. ✅ Browse people directory
3. ✅ View org chart
4. ✅ Create a new person
5. ✅ Explore the dashboard

## 💬 Need Help?

- Check [README.md](README.md) for detailed docs
- Review [REQUIREMENTS.md](REQUIREMENTS.md) for features
- Check [tests/README.md](tests/README.md) for testing

---

**Built with ❤️ using Next.js, Prisma, and TailwindCSS**
