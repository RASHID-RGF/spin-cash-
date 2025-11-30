-- Enhanced Video Features Migration
-- Adds ratings, bookmarks, playlists, tags, and improved analytics

-- Video Tags Table (many-to-many relationship)
CREATE TABLE video_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, tag)
);

-- Video Ratings Table
CREATE TABLE video_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Video Bookmarks/Favorites
CREATE TABLE video_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Video Playlists
CREATE TABLE video_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Videos (many-to-many with order)
CREATE TABLE playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES video_playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, video_id)
);

-- Enhanced Video Views (replace/update existing)
ALTER TABLE video_views ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE video_views ADD COLUMN IF NOT EXISTS watch_progress INTEGER DEFAULT 0; -- percentage 0-100
ALTER TABLE video_views ADD COLUMN IF NOT EXISTS total_watch_time INTEGER DEFAULT 0; -- in seconds

-- Video Analytics Table
CREATE TABLE video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_watch_time DECIMAL(5,2) DEFAULT 0, -- in minutes
  completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, date)
);

-- Indexes for performance
CREATE INDEX idx_video_tags_video_id ON video_tags(video_id);
CREATE INDEX idx_video_tags_tag ON video_tags(tag);
CREATE INDEX idx_video_ratings_video_id ON video_ratings(video_id);
CREATE INDEX idx_video_ratings_user_id ON video_ratings(user_id);
CREATE INDEX idx_video_bookmarks_user_id ON video_bookmarks(user_id);
CREATE INDEX idx_video_playlists_user_id ON video_playlists(user_id);
CREATE INDEX idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX idx_playlist_videos_position ON playlist_videos(playlist_id, position);
CREATE INDEX idx_video_analytics_video_date ON video_analytics(video_id, date DESC);

-- Update videos table to include new fields
ALTER TABLE videos ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Function to update video ratings
CREATE OR REPLACE FUNCTION update_video_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos
  SET
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM video_ratings
      WHERE video_id = NEW.video_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM video_ratings
      WHERE video_id = NEW.video_id
    )
  WHERE id = NEW.video_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER update_video_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON video_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_video_rating_stats();

-- Function to update video analytics
CREATE OR REPLACE FUNCTION update_video_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO video_analytics (video_id, date, views, unique_viewers)
  VALUES (
    NEW.video_id,
    CURRENT_DATE,
    1,
    1
  )
  ON CONFLICT (video_id, date)
  DO UPDATE SET
    views = video_analytics.views + 1,
    unique_viewers = (
      SELECT COUNT(DISTINCT user_id)
      FROM video_views
      WHERE video_id = NEW.video_id
      AND DATE(created_at) = CURRENT_DATE
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics updates
CREATE TRIGGER update_video_analytics_trigger
  AFTER INSERT ON video_views
  FOR EACH ROW
  EXECUTE FUNCTION update_video_analytics();

-- Row Level Security Policies

-- Video Tags
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view video tags" ON video_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage video tags" ON video_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Video Ratings
ALTER TABLE video_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view video ratings" ON video_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage own ratings" ON video_ratings FOR ALL USING (auth.uid() = user_id);

-- Video Bookmarks
ALTER TABLE video_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON video_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON video_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Video Playlists
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public playlists" ON video_playlists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own playlists" ON video_playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own playlists" ON video_playlists FOR ALL USING (auth.uid() = user_id);

-- Playlist Videos
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public playlist videos" ON playlist_videos FOR SELECT USING (
  EXISTS (SELECT 1 FROM video_playlists WHERE id = playlist_id AND is_public = true)
);
CREATE POLICY "Users can view own playlist videos" ON playlist_videos FOR SELECT USING (
  EXISTS (SELECT 1 FROM video_playlists WHERE id = playlist_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own playlist videos" ON playlist_videos FOR ALL USING (
  EXISTS (SELECT 1 FROM video_playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- Video Analytics
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view video analytics" ON video_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Update existing video_views RLS
DROP POLICY IF EXISTS "Users can view own video views" ON video_views;
CREATE POLICY "Users can view own video views" ON video_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own video views" ON video_views FOR ALL USING (auth.uid() = user_id);