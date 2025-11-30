-- Alter videos table to match the schema
ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rename url to video_url
ALTER TABLE videos RENAME COLUMN url TO video_url;

-- Drop platform column if exists
ALTER TABLE videos DROP COLUMN IF EXISTS platform;

-- Add trigger for updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();