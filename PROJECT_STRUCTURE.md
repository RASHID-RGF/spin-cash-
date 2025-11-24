# 📊 SpinCash Rewards Hub - Complete Project Structure

## 🎯 Overview
This document provides a complete visualization of the project structure, file organization, and component relationships.

---

## 📂 Complete Directory Tree

```
spincash-rewards-hub-main/
│
├── 📁 src/                                    # Frontend React Application
│   ├── 📁 components/
│   │   ├── 📁 admin/                         # Admin Dashboard Components
│   │   │   ├── UserManagement.tsx           # User CRUD & status management
│   │   │   ├── WithdrawalApproval.tsx       # Approve/reject withdrawals
│   │   │   ├── BlogManagement.tsx           # Blog CRUD operations
│   │   │   ├── VideoManagement.tsx          # Video upload & management
│   │   │   ├── GameManagement.tsx           # Game settings configuration
│   │   │   ├── Analytics.tsx                # Charts & statistics
│   │   │   └── Notifications.tsx            # Mass notification system
│   │   │
│   │   └── 📁 ui/                            # Shadcn UI Components (49 files)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── ... (42 more components)
│   │
│   ├── 📁 pages/                             # Application Pages
│   │   ├── Index.tsx                        # Landing page
│   │   ├── Login.tsx                        # User login
│   │   ├── Signup.tsx                       # User registration
│   │   ├── Dashboard.tsx                    # User dashboard
│   │   ├── AdminDashboard.tsx               # Admin control panel
│   │   └── NotFound.tsx                     # 404 page
│   │
│   ├── 📁 integrations/
│   │   └── 📁 supabase/
│   │       ├── client.ts                    # Supabase client instance
│   │       └── types.ts                     # Database types
│   │
│   ├── 📁 hooks/                             # Custom React Hooks
│   │   ├── use-toast.ts                     # Toast notifications
│   │   └── use-mobile.tsx                   # Mobile detection
│   │
│   ├── 📁 lib/                               # Utilities
│   │   └── utils.ts                         # Helper functions
│   │
│   ├── App.tsx                              # Main app component
│   ├── main.tsx                             # React entry point
│   ├── index.css                            # Global styles
│   └── vite-env.d.ts                        # Vite types
│
├── 📁 backend/                                # Node.js/Express Backend
│   ├── 📁 src/
│   │   ├── 📁 routes/                        # API Route Handlers
│   │   │   ├── auth.routes.ts               # Authentication routes
│   │   │   ├── user.routes.ts               # User management
│   │   │   ├── wallet.routes.ts             # Wallet operations
│   │   │   ├── withdrawal.routes.ts         # Withdrawal requests
│   │   │   ├── referral.routes.ts           # Referral tracking
│   │   │   ├── blog.routes.ts               # Blog CRUD
│   │   │   ├── video.routes.ts              # Video management
│   │   │   ├── game.routes.ts               # Game logic
│   │   │   ├── mpesa.routes.ts              # MPESA integration
│   │   │   └── admin.routes.ts              # Admin operations
│   │   │
│   │   ├── 📁 services/                      # Business Logic Layer
│   │   │   ├── mpesa.service.ts             # MPESA Daraja API
│   │   │   ├── wallet.service.ts            # Wallet operations
│   │   │   ├── referral.service.ts          # Referral calculations
│   │   │   └── notification.service.ts      # Push notifications
│   │   │
│   │   ├── 📁 controllers/                   # Route Controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── game.controller.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── 📁 middleware/                    # Express Middleware
│   │   │   ├── auth.middleware.ts           # JWT verification
│   │   │   ├── admin.middleware.ts          # Admin role check
│   │   │   ├── validation.middleware.ts     # Input validation
│   │   │   └── error.middleware.ts          # Error handling
│   │   │
│   │   ├── 📁 models/                        # Data Models
│   │   │   ├── user.model.ts
│   │   │   ├── wallet.model.ts
│   │   │   ├── transaction.model.ts
│   │   │   └── game.model.ts
│   │   │
│   │   ├── 📁 config/                        # Configuration
│   │   │   ├── database.config.ts           # DB connection
│   │   │   ├── mpesa.config.ts              # MPESA settings
│   │   │   └── app.config.ts                # App settings
│   │   │
│   │   └── index.ts                         # Express app entry
│   │
│   ├── package.json                         # Backend dependencies
│   ├── tsconfig.json                        # TypeScript config
│   ├── .env.example                         # Environment template
│   └── .gitignore
│
├── 📁 supabase/                               # Supabase Configuration
│   ├── 📁 migrations/                        # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_rls_policies.sql
│   │
│   └── config.toml                          # Supabase config
│
├── 📁 public/                                 # Static Assets
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│
├── 📄 Configuration Files
│   ├── package.json                         # Frontend dependencies
│   ├── tsconfig.json                        # TypeScript config
│   ├── tsconfig.app.json                    # App TS config
│   ├── tsconfig.node.json                   # Node TS config
│   ├── vite.config.ts                       # Vite configuration
│   ├── tailwind.config.ts                   # Tailwind CSS config
│   ├── postcss.config.js                    # PostCSS config
│   ├── components.json                      # Shadcn config
│   ├── eslint.config.js                     # ESLint rules
│   └── .gitignore
│
├── 📄 Documentation
│   ├── README.md                            # Main documentation
│   ├── DATABASE_SCHEMA.md                   # Complete DB schema
│   ├── PROJECT_STRUCTURE.md                 # This file
│   └── API_DOCUMENTATION.md                 # API reference
│
└── 📄 Other Files
    ├── .env                                 # Environment variables
    ├── .env.example                         # Env template
    ├── bun.lockb                            # Bun lock file
    ├── package-lock.json                    # NPM lock file
    └── index.html                           # HTML entry point
```

---

## 🎨 Component Architecture

### Frontend Component Hierarchy

```
App
├── BrowserRouter
│   ├── Routes
│   │   ├── Index (Landing Page)
│   │   │   ├── Hero Section
│   │   │   ├── Features Grid
│   │   │   ├── How It Works
│   │   │   └── CTA Section
│   │   │
│   │   ├── Login
│   │   │   ├── Login Form
│   │   │   └── Social Auth Buttons
│   │   │
│   │   ├── Signup
│   │   │   ├── Registration Form
│   │   │   └── Referral Code Input
│   │   │
│   │   ├── Dashboard (User)
│   │   │   ├── Stats Cards
│   │   │   ├── Wallet Overview
│   │   │   ├── Referral Link
│   │   │   └── Activity Menu
│   │   │
│   │   └── AdminDashboard
│   │       ├── Header
│   │       ├── Stats Grid (8 cards)
│   │       └── Tabs
│   │           ├── UserManagement
│   │           │   ├── Search Bar
│   │           │   ├── Users Table
│   │           │   └── User Details Dialog
│   │           │
│   │           ├── WithdrawalApproval
│   │           │   ├── Stats Cards
│   │           │   ├── Withdrawals Table
│   │           │   └── Approve/Reject Dialogs
│   │           │
│   │           ├── BlogManagement
│   │           │   ├── Create Blog Button
│   │           │   ├── Blog Cards Grid
│   │           │   └── Edit Blog Dialog
│   │           │
│   │           ├── VideoManagement
│   │           │   ├── Upload Video Button
│   │           │   ├── Video Cards Grid
│   │           │   └── Edit Video Dialog
│   │           │
│   │           ├── GameManagement
│   │           │   ├── Spin Settings
│   │           │   ├── Quiz Settings
│   │           │   └── Number Game Settings
│   │           │
│   │           ├── Analytics
│   │           │   ├── Key Metrics
│   │           │   ├── User Growth Chart
│   │           │   ├── Earnings Chart
│   │           │   ├── Activity Pie Chart
│   │           │   └── Platform Stats
│   │           │
│   │           └── Notifications
│   │               ├── Send Notification Form
│   │               └── Best Practices Guide
│   │
│   ├── Toaster (Toast Notifications)
│   └── Sonner (Alternative Toasts)
```

---

## 🔄 Data Flow Architecture

### User Registration & Referral Flow

```
User Signup
    ↓
[Frontend: Signup.tsx]
    ↓
Supabase Auth.signUp()
    ↓
[Database: auth.users]
    ↓
Trigger: create_profile
    ↓
[Database: profiles]
    ↓
Generate referral_code
    ↓
Trigger: create_wallet
    ↓
[Database: wallets]
    ↓
If referred_by exists:
    ↓
[Database: referrals]
    ↓
Calculate commission
    ↓
Update referrer wallet
```

### MPESA Deposit Flow

```
User Initiates Deposit
    ↓
[Frontend: Wallet Component]
    ↓
POST /api/mpesa/deposit
    ↓
[Backend: mpesa.routes.ts]
    ↓
mpesaService.stkPush()
    ↓
[MPESA Daraja API]
    ↓
User receives STK prompt
    ↓
User enters PIN
    ↓
MPESA processes payment
    ↓
POST /api/mpesa/callback
    ↓
[Backend: Callback Handler]
    ↓
Update transaction status
    ↓
Credit user wallet
    ↓
[Database: wallets, transactions]
    ↓
Send notification to user
```

### Withdrawal Approval Flow

```
User Requests Withdrawal
    ↓
[Frontend: Dashboard]
    ↓
Create withdrawal request
    ↓
[Database: withdrawals]
    ↓
Status: pending
    ↓
Admin Views Request
    ↓
[Admin: WithdrawalApproval]
    ↓
Admin Approves
    ↓
POST /api/mpesa/withdraw
    ↓
mpesaService.b2cPayment()
    ↓
[MPESA Daraja API]
    ↓
MPESA sends money
    ↓
Callback received
    ↓
Update withdrawal status
    ↓
Deduct from user wallet
    ↓
Send confirmation notification
```

---

## 🗄️ Database Entity Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:1)
wallets
    ↓ (1:many)
transactions

profiles
    ↓ (1:many as referrer)
referrals
    ↑ (many:1 as referred)
profiles

profiles
    ↓ (1:many)
withdrawals

profiles
    ↓ (1:many)
spin_history

profiles
    ↓ (1:many)
quiz_attempts

profiles
    ↓ (1:many)
video_views
    ↑ (many:1)
videos

profiles
    ↓ (1:many)
notifications

blogs
    ↑ (many:1)
profiles (author)
```

---

## 🎮 Game Logic Flow

### Spin Wheel

```
User clicks Spin
    ↓
Check spin_points >= cost
    ↓
Deduct spin points
    ↓
Generate random reward
    ↓
Add to wallet balance
    ↓
Record in spin_history
    ↓
Update wallet stats
    ↓
Show animation & result
```

### Math Quiz

```
User starts quiz
    ↓
Fetch random questions
    ↓
User answers questions
    ↓
Calculate score
    ↓
If score >= passing:
    ↓
Calculate reward
    ↓
Add to wallet
    ↓
Record in quiz_attempts
    ↓
Show results
```

---

## 🔐 Security Layers

```
Frontend
    ↓
[Supabase RLS Policies]
    ↓
[JWT Token Verification]
    ↓
Backend API
    ↓
[Auth Middleware]
    ↓
[Admin Role Check]
    ↓
[Input Validation]
    ↓
Database Operations
    ↓
[Row Level Security]
```

---

## 📱 Responsive Design Breakpoints

```
Mobile First Approach:

xs:  < 640px   (Mobile)
sm:  640px+    (Large Mobile)
md:  768px+    (Tablet)
lg:  1024px+   (Desktop)
xl:  1280px+   (Large Desktop)
2xl: 1536px+   (Extra Large)
```

---

## 🎨 Design System

### Color Palette

```
Primary:    Blue (#3b82f6)
Secondary:  Purple (#a855f7)
Accent:     Green (#10b981)
Warning:    Yellow (#f59e0b)
Error:      Red (#ef4444)
Success:    Green (#22c55e)

Background: Gradient (Slate → Purple → Slate)
Cards:      Glassmorphism (bg-white/10, backdrop-blur)
Text:       White/Gray scale
```

### Typography

```
Headings:   font-bold, gradient text
Body:       font-normal, text-gray-300
Small:      text-sm, text-gray-400
```

### Spacing

```
Cards:      p-4, p-6
Sections:   py-8, py-12
Gaps:       gap-4, gap-6, gap-8
```

---

## 🚀 Performance Optimizations

1. **Code Splitting**
   - React.lazy() for routes
   - Dynamic imports for heavy components

2. **Image Optimization**
   - WebP format
   - Lazy loading
   - Responsive images

3. **Caching**
   - React Query for data caching
   - Service worker for offline support

4. **Bundle Size**
   - Tree shaking
   - Minification
   - Compression (gzip/brotli)

---

## 📊 Monitoring & Analytics

```
Frontend Monitoring:
- Sentry (Error tracking)
- Google Analytics (User behavior)
- Vercel Analytics (Performance)

Backend Monitoring:
- Morgan (Request logging)
- Custom error logging
- Performance metrics

Database:
- Supabase Dashboard
- Query performance
- Storage usage
```

---

## 🔄 CI/CD Pipeline

```
Git Push
    ↓
GitHub Actions
    ↓
Run Tests
    ↓
Build Frontend
    ↓
Deploy to Vercel
    ↓
Build Backend
    ↓
Deploy to Railway
    ↓
Run Migrations
    ↓
Health Check
    ↓
Notify Team
```

---

## 📝 Development Workflow

1. **Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Development**
   - Write code
   - Test locally
   - Update documentation

3. **Commit**
   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Pull Request**
   - Create PR
   - Code review
   - Merge to main

5. **Deployment**
   - Auto-deploy on merge
   - Monitor logs
   - Verify functionality

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
