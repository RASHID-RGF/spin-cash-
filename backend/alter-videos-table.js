const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function alterVideosTable() {
    try {
        // Add missing columns to videos table
        const { error } = await supabase.rpc('exec_sql', {
            sql: `
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
      `
        });

        if (error) {
            console.error('Error altering table:', error);
        } else {
            console.log('Videos table altered successfully');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

alterVideosTable();