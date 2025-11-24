# 🎰 SpinCash Rewards Hub - Complete Implementation Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [MPESA Integration](#mpesa-integration)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)

---

## 🌟 Overview

SpinCash Rewards Hub is a comprehensive rewards and referral platform with:
- 5-level referral system
- Multiple earning games (Spin Wheel, Math Quiz, Number Game)
- Educational content (Videos, Blogs)
- MPESA payment integration
- Admin dashboard for complete platform management

---

## ✨ Features

### User Features
- ✅ User authentication (Supabase Auth)
- ✅ Multi-level referral system (5 levels)
- ✅ Wallet management
- ✅ MPESA deposits & withdrawals
- ✅ Spin wheel game
- ✅ Math quiz challenges
- ✅ Number guessing game
- ✅ Educational videos (Forex trading)
- ✅ Blog articles
- ✅ Real-time notifications
- ✅ Transaction history
- ✅ Leaderboard

### Admin Features
- ✅ User management (view, activate/deactivate)
- ✅ Withdrawal approval system
- ✅ Blog management (create, edit, delete)
- ✅ Video management (upload, edit, delete)
- ✅ Game configuration (spin, quiz, number game)
- ✅ Analytics & charts
- ✅ Mass notifications
- ✅ Platform statistics

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Glassmorphism
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: React Query
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payment**: MPESA Daraja API
- **ORM**: Supabase Client

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend)

---

## 📁 Project Structure

```
spincash-rewards-hub-main/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── admin/               # Admin dashboard components
│   │   │   ├── UserManagement.tsx
│   │   │   ├── WithdrawalApproval.tsx
│   │   │   ├── BlogManagement.tsx
│   │   │   ├── VideoManagement.tsx
│   │   │   ├── GameManagement.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Notifications.tsx
│   │   └── ui/                  # Shadcn UI components
│   ├── pages/
│   │   ├── Index.tsx            # Landing page
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── AdminDashboard.tsx   # Admin panel
│   │   └── NotFound.tsx
│   ├── integrations/
│   │   └── supabase/            # Supabase client
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities
│   └── App.tsx
│
├── backend/                      # Backend API
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── wallet.routes.ts
│   │   │   ├── withdrawal.routes.ts
│   │   │   ├── referral.routes.ts
│   │   │   ├── blog.routes.ts
│   │   │   ├── video.routes.ts
│   │   │   ├── game.routes.ts
│   │   │   ├── mpesa.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── services/            # Business logic
│   │   │   └── mpesa.service.ts
│   │   ├── middleware/          # Express middleware
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # Data models
│   │   ├── config/              # Configuration
│   │   └── index.ts             # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── supabase/                     # Supabase migrations
├── public/                       # Static assets
├── DATABASE_SCHEMA.md           # Complete DB schema
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL (via Supabase)
- MPESA Daraja API credentials (for payments)

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env .env.local

# Update .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Run development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your credentials
# See Configuration section below

# Run development server
npm run dev
```

---

## ⚙️ Configuration

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MPESA Daraja API
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

# Payment Settings
MIN_WITHDRAWAL_AMOUNT=100
MAX_WITHDRAWAL_AMOUNT=50000
```

---

## 💾 Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and keys

### 2. Run Database Migrations

Execute the SQL from `DATABASE_SCHEMA.md` in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables (see DATABASE_SCHEMA.md)
-- Create indexes
-- Set up RLS policies
-- Create triggers and functions
```

### 3. Seed Initial Data (Optional)

```sql
-- Create admin user
INSERT INTO profiles (id, full_name, email, is_admin)
VALUES ('your-user-id', 'Admin User', 'admin@spincash.com', true);

-- Add game settings
-- Add sample quiz questions
-- etc.
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Wallet
- `GET /api/wallet/:userId` - Get user wallet
- `POST /api/wallet/add-funds` - Add funds
- `GET /api/wallet/:userId/transactions` - Get transactions

#### Withdrawals
- `GET /api/withdrawals` - Get all withdrawals
- `POST /api/withdrawals` - Create withdrawal request
- `PUT /api/withdrawals/:id/approve` - Approve withdrawal
- `PUT /api/withdrawals/:id/reject` - Reject withdrawal

#### MPESA
- `POST /api/mpesa/deposit` - Initiate deposit
- `POST /api/mpesa/withdraw` - Process withdrawal
- `POST /api/mpesa/callback` - MPESA callback
- `GET /api/mpesa/query/:checkoutRequestId` - Query transaction

#### Games
- `POST /api/games/spin` - Play spin wheel
- `GET /api/games/quiz/questions` - Get quiz questions
- `POST /api/games/quiz/submit` - Submit quiz answers
- `POST /api/games/number-game/play` - Play number game

#### Blogs & Videos
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create blog
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Upload video

#### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/notifications/send` - Send mass notification
- `GET /api/admin/analytics` - Get analytics data

---

## 💳 MPESA Integration

### Setup Daraja API

1. **Register on Daraja Portal**
   - Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create an account
   - Create a new app

2. **Get Credentials**
   - Consumer Key
   - Consumer Secret
   - Passkey (for Lipa Na MPESA Online)

3. **Configure Callback URLs**
   - Set your callback URL in Daraja portal
   - Update `MPESA_CALLBACK_URL` in .env

4. **Test in Sandbox**
   - Use sandbox environment for testing
   - Test phone: 254708374149
   - Test amounts: 1-100000

5. **Go Live**
   - Request production access
   - Update `MPESA_ENVIRONMENT=production`
   - Use real credentials

### MPESA Flow

**Deposits (STK Push):**
1. User initiates deposit
2. Backend calls MPESA STK Push API
3. User receives prompt on phone
4. User enters PIN
5. MPESA sends callback
6. Backend credits user wallet

**Withdrawals (B2C):**
1. User requests withdrawal
2. Admin approves
3. Backend calls MPESA B2C API
4. MPESA processes payment
5. User receives money
6. Backend updates status

---

## 👨‍💼 Admin Dashboard

### Access
Navigate to `/admin` after logging in with an admin account.

### Features

1. **User Management**
   - View all users
   - Search and filter
   - Activate/deactivate accounts
   - View user details and earnings

2. **Withdrawal Approval**
   - View pending withdrawals
   - Approve or reject requests
   - Track withdrawal history

3. **Content Management**
   - Create, edit, delete blogs
   - Upload, manage videos
   - Categorize content

4. **Game Configuration**
   - Set spin wheel rewards
   - Configure quiz settings
   - Adjust number game parameters

5. **Analytics**
   - User growth charts
   - Earnings trends
   - Activity distribution
   - Platform statistics

6. **Notifications**
   - Send mass notifications
   - Target specific user groups
   - Track notification performance

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Backend (Railway/Render)

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Render:**
1. Connect GitHub repository
2. Select backend directory
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Database (Supabase)
- Already hosted on Supabase cloud
- No additional deployment needed
- Set up backups in Supabase dashboard

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **Database Security**
   - Enable Row Level Security (RLS)
   - Use service role key only on backend
   - Validate all inputs

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate MPESA callbacks

4. **User Data**
   - Hash sensitive data
   - Implement GDPR compliance
   - Regular security audits

---

## 📞 Support

For issues or questions:
- Email: support@spincash.com
- Documentation: See DATABASE_SCHEMA.md
- API Docs: /api/docs (when implemented)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Safaricom for MPESA API
- Shadcn for UI components
- React community

---

**Built with ❤️ by the SpinCash Team**
