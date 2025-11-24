# 🚀 SpinCash Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Access the Admin Dashboard

The admin dashboard is now available at:
```
http://localhost:5173/admin
```

**Note**: You need to be logged in with an admin account to access this page.

---

### Step 2: Set Admin Privileges

To make your account an admin:

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your user row
4. Set `is_admin` column to `true`
5. Save changes

Or run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

---

### Step 3: Explore Admin Features

Once logged in as admin, you can:

#### 👥 **User Management** Tab
- View all registered users
- Search users by name, email, or phone
- View detailed user information
- Activate/deactivate user accounts

#### 💰 **Withdrawals** Tab
- See pending withdrawal requests
- Approve withdrawals (triggers MPESA payment)
- Reject withdrawals with reason
- Track withdrawal history

#### 📝 **Blogs** Tab
- Create new blog posts
- Edit existing blogs
- Delete blogs
- Add categories and images

#### 🎥 **Videos** Tab
- Upload educational videos
- Add video details (title, description, category)
- Manage video library
- Delete videos

#### 🎮 **Games** Tab
- Configure Spin Wheel settings
  - Min/max rewards
  - Spin cost
  - Daily limits
- Set Quiz parameters
  - Reward per question
  - Passing score
  - Questions per quiz
- Adjust Number Game settings
  - Number range
  - Reward amount
  - Daily attempts

#### 📊 **Analytics** Tab
- View user growth charts
- Track platform earnings
- See activity distribution
- Monitor key metrics

#### 🔔 **Notifications** Tab
- Send mass notifications
- Target specific user groups:
  - All users
  - Active users (last 7 days)
  - Inactive users (7+ days)
- Follow best practices guide

---

### Step 4: Create Sample Data

#### Create a Blog Post

1. Go to **Blogs** tab
2. Click **New Blog**
3. Fill in:
   - Title: "Getting Started with Forex Trading"
   - Category: "Forex"
   - Excerpt: "Learn the basics of forex trading"
   - Content: Your blog content
   - Image URL: (optional)
4. Click **Create Blog**

#### Upload a Video

1. Go to **Videos** tab
2. Click **Upload Video**
3. Fill in:
   - Title: "Forex Basics - Lesson 1"
   - Category: "Forex Basics"
   - Video URL: YouTube or direct video link
   - Thumbnail URL: (optional)
   - Duration: "10:30"
   - Description: Video description
4. Click **Upload Video**

---

### Step 5: Test User Features

#### As a Regular User:

1. **Logout** from admin account
2. **Sign up** a new account (or use existing)
3. View the **User Dashboard** at `/dashboard`
4. See your:
   - Wallet balance
   - Referral link
   - Activity menu

---

## 🎨 UI Features

### Glassmorphism Design
- Frosted glass effect on cards
- Backdrop blur
- Transparent backgrounds
- Smooth animations

### Gradient Backgrounds
- Animated floating orbs
- Blue + Purple + Green color scheme
- Dynamic gradient text

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

### Icons
- Lucide React icons throughout
- Consistent icon sizing
- Color-coded by function

---

## 🔧 Backend Setup (Optional)

If you want to run the backend API:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run development server
npm run dev
```

Backend will run on `http://localhost:3001`

---

## 📱 MPESA Integration (Production)

### For Testing:
Currently using placeholders. To enable real MPESA:

1. **Get Daraja API Credentials**
   - Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create an app
   - Get Consumer Key & Secret

2. **Update Backend .env**
   ```env
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_PASSKEY=your_passkey
   MPESA_SHORTCODE=174379
   MPESA_ENVIRONMENT=sandbox
   ```

3. **Test in Sandbox**
   - Use test phone: 254708374149
   - Test amounts: 1-100000

---

## 🗄️ Database Tables

All tables are defined in `DATABASE_SCHEMA.md`. Key tables:

- **profiles** - User information
- **wallets** - User balances
- **withdrawals** - Withdrawal requests
- **transactions** - All financial transactions
- **referrals** - Referral tracking
- **blogs** - Blog posts
- **videos** - Video content
- **spin_history** - Spin game records
- **quiz_attempts** - Quiz results
- **notifications** - User notifications

---

## 🎯 Next Steps

### Immediate:
1. ✅ Set up admin account
2. ✅ Explore admin dashboard
3. ✅ Create sample content
4. ✅ Test user features

### Short-term:
1. 📝 Add more blog posts
2. 🎥 Upload educational videos
3. 🎮 Configure game settings
4. 👥 Invite test users

### Long-term:
1. 💳 Set up MPESA integration
2. 📊 Monitor analytics
3. 🚀 Deploy to production
4. 📱 Add mobile app (optional)

---

## 🆘 Troubleshooting

### Admin Dashboard Not Loading?
- Check if you're logged in
- Verify `is_admin = true` in database
- Check browser console for errors

### Can't Create Content?
- Verify Supabase connection
- Check RLS policies
- Ensure proper permissions

### Styling Issues?
- Clear browser cache
- Check Tailwind CSS is working
- Verify all dependencies installed

---

## 📚 Documentation

- **README.md** - Complete setup guide
- **DATABASE_SCHEMA.md** - Full database schema
- **PROJECT_STRUCTURE.md** - Architecture overview
- **QUICK_START.md** - This file

---

## 💡 Tips

1. **Use Dark Mode** - The UI is optimized for dark backgrounds
2. **Test on Mobile** - Responsive design works great on phones
3. **Check Analytics** - Monitor user growth and engagement
4. **Regular Backups** - Export Supabase data regularly
5. **Security First** - Never commit .env files

---

## 🎉 You're All Set!

Your SpinCash Rewards Hub is ready to use. Start by:

1. Setting up your admin account
2. Creating some content
3. Inviting users
4. Monitoring growth

**Need Help?** Check the full documentation in README.md

---

**Happy Building! 🚀**
