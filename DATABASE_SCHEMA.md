# SpinCash Rewards Hub - Database Schema

## Overview
This document outlines the complete database schema for the SpinCash Rewards Hub platform.

## Database: PostgreSQL (via Supabase)

---

## Tables

### 1. profiles
User profile information extending Supabase auth.users

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES profiles(id),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
```

### 2. wallets
User wallet and earnings tracking

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  bonus_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  spin_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Trigger to create wallet on profile creation
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_user();
```

### 3. withdrawals
Withdrawal requests and processing

```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  phone_number TEXT NOT NULL,
  payment_method TEXT DEFAULT 'MPESA',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  transaction_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);
```

### 4. transactions
All financial transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'referral_bonus', 'spin_reward', 'quiz_reward', 'video_reward', 'game_reward')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

### 5. referrals
Referral tracking and commissions

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  commission_earned DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_level ON referrals(level);
```

### 6. blogs
Blog posts and articles

```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  category TEXT,
  author_id UUID REFERENCES profiles(id),
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
```

### 7. videos
Educational videos

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  duration TEXT,
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

### 8. video_views
Track user video views for rewards

```sql
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watch_duration INTEGER, -- in seconds
  completed BOOLEAN DEFAULT FALSE,
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Indexes
CREATE INDEX idx_video_views_user_id ON video_views(user_id);
CREATE INDEX idx_video_views_video_id ON video_views(video_id);
```

### 9. spin_history
Spin wheel game history

```sql
CREATE TABLE spin_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_amount DECIMAL(10, 2) NOT NULL,
  spin_type TEXT DEFAULT 'free' CHECK (spin_type IN ('free', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_spin_history_user_id ON spin_history(user_id);
CREATE INDEX idx_spin_history_created_at ON spin_history(created_at DESC);
```

### 10. quiz_questions
Math quiz questions

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
```

### 11. quiz_attempts
User quiz attempts and scores

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  reward_earned DECIMAL(10, 2) DEFAULT 0.00,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_score ON quiz_attempts(score DESC);
CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);
```

### 12. number_game_attempts
Number guessing game attempts

```sql
CREATE TABLE number_game_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guessed_number INTEGER NOT NULL,
  correct_number INTEGER NOT NULL,
  won BOOLEAN DEFAULT FALSE,
  reward_earned DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_number_game_user_id ON number_game_attempts(user_id);
CREATE INDEX idx_number_game_created_at ON number_game_attempts(created_at DESC);
```

### 13. notifications
In-app notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 14. game_settings
Global game configuration

```sql
CREATE TABLE game_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO game_settings (setting_key, setting_value, description) VALUES
  ('spin_wheel', '{"minReward": 1, "maxReward": 100, "spinCost": 10, "dailyLimit": 5}', 'Spin wheel game configuration'),
  ('quiz', '{"rewardPerQuestion": 5, "passingScore": 70, "questionsPerQuiz": 10}', 'Quiz game configuration'),
  ('number_game', '{"minNumber": 1, "maxNumber": 100, "rewardAmount": 50, "attemptsPerDay": 3}', 'Number game configuration'),
  ('referral', '{"level1": 10, "level2": 5, "level3": 3, "level4": 2, "level5": 1}', 'Referral commission percentages');
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
```

### Sample RLS Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all data
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Public can view published blogs
CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (is_published = TRUE);

-- Public can view published videos
CREATE POLICY "Anyone can view published videos" ON videos
  FOR SELECT USING (is_published = TRUE);
```

---

## Functions and Triggers

### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Referral commission calculation
```sql
CREATE OR REPLACE FUNCTION calculate_referral_commission(
  referrer_id UUID,
  amount DECIMAL
)
RETURNS VOID AS $$
DECLARE
  commission_rate DECIMAL;
  commission_amount DECIMAL;
BEGIN
  -- Get commission rate from settings (simplified - use level 1 rate)
  commission_rate := 0.10; -- 10%
  commission_amount := amount * commission_rate;
  
  -- Add to referrer's wallet
  UPDATE wallets
  SET bonus_balance = bonus_balance + commission_amount,
      total_earnings = total_earnings + commission_amount
  WHERE user_id = referrer_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (referrer_id, 'referral_bonus', commission_amount, 'Referral commission');
END;
$$ LANGUAGE plpgsql;
```

---

## Indexes for Performance

All major indexes are included in the table definitions above. Additional composite indexes can be added based on query patterns:

```sql
-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, created_at DESC);
CREATE INDEX idx_referrals_referrer_active ON referrals(referrer_id, is_active);
CREATE INDEX idx_withdrawals_status_date ON withdrawals(status, created_at DESC);
```

---

## Notes

1. **UUID Generation**: Requires `uuid-ossp` extension
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Decimal Precision**: All monetary values use DECIMAL(10, 2) for accuracy

3. **Timestamps**: All tables use TIMESTAMP WITH TIME ZONE for proper timezone handling

4. **Constraints**: CHECK constraints ensure data integrity

5. **Foreign Keys**: CASCADE deletes maintain referential integrity

6. **Indexes**: Strategically placed for common query patterns

7. **RLS**: Implement comprehensive Row Level Security policies for data protection
