# 🚀 SpinCash Backend API

## Overview
Node.js/Express backend API for SpinCash Rewards Hub with MPESA integration.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

Create a `.env` file with:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
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

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Wallet
```
GET  /api/wallet/:userId
POST /api/wallet/add-funds
GET  /api/wallet/:userId/transactions
```

### Withdrawals
```
GET /api/withdrawals
POST /api/withdrawals
PUT /api/withdrawals/:id/approve
PUT /api/withdrawals/:id/reject
```

### MPESA
```
POST /api/mpesa/deposit
POST /api/mpesa/withdraw
POST /api/mpesa/callback
GET  /api/mpesa/query/:checkoutRequestId
```

### Games
```
POST /api/games/spin
GET  /api/games/quiz/questions
POST /api/games/quiz/submit
POST /api/games/number-game/play
```

### Blogs & Videos
```
GET    /api/blogs
POST   /api/blogs
GET    /api/blogs/:id
PUT    /api/blogs/:id
DELETE /api/blogs/:id

GET    /api/videos
POST   /api/videos
GET    /api/videos/:id
DELETE /api/videos/:id
```

### Admin
```
GET  /api/admin/stats
GET  /api/admin/users
PUT  /api/admin/users/:id/toggle-status
GET  /api/admin/withdrawals
POST /api/admin/notifications/send
GET  /api/admin/analytics
```

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── config/          # Configuration
│   └── index.ts         # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## MPESA Integration

### Testing in Sandbox

1. Use test credentials from Daraja portal
2. Test phone number: `254708374149`
3. Test amounts: 1-100000 KES

### Going to Production

1. Get production credentials
2. Update `MPESA_ENVIRONMENT=production`
3. Set production callback URL
4. Test thoroughly before launch

## Development

```bash
# Run with auto-reload
npm run dev

# Type checking
tsc --noEmit

# Build
npm run build
```

## Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Render
1. Connect GitHub repo
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables

## Security

- All routes should be protected with authentication
- Use HTTPS in production
- Validate all inputs
- Rate limit API endpoints
- Secure MPESA callbacks

## License

MIT
