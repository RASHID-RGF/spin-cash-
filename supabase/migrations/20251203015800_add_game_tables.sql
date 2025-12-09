-- Add missing game-related tables

-- Create spin_history table
CREATE TABLE public.spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  spin_type TEXT NOT NULL DEFAULT 'free' CHECK (spin_type IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL,
  reward_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create number_game_attempts table
CREATE TABLE public.number_game_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guessed_number INTEGER NOT NULL CHECK (guessed_number >= 1 AND guessed_number <= 100),
  correct_number INTEGER NOT NULL CHECK (correct_number >= 1 AND correct_number <= 100),
  won BOOLEAN NOT NULL DEFAULT false,
  reward_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.number_game_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spin_history
CREATE POLICY "Users can view their own spin history"
  ON public.spin_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spin history"
  ON public.spin_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all spin history"
  ON public.spin_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view active quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for number_game_attempts
CREATE POLICY "Users can view their own number game attempts"
  ON public.number_game_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create number game attempts"
  ON public.number_game_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all number game attempts"
  ON public.number_game_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on quiz_questions
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample quiz questions
INSERT INTO public.quiz_questions (question, options, correct_answer, category, difficulty) VALUES
('What is the capital of Kenya?', '["Nairobi", "Mombasa", "Kisumu", "Eldoret"]', 'Nairobi', 'Geography', 'easy'),
('Which programming language is used for React?', '["Python", "JavaScript", "Java", "C++"]', 'JavaScript', 'Technology', 'easy'),
('What is 2 + 2?', '["3", "4", "5", "6"]', '4', 'Math', 'easy'),
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 'Mars', 'Science', 'easy'),
('What does HTML stand for?', '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"]', 'Hyper Text Markup Language', 'Technology', 'medium');