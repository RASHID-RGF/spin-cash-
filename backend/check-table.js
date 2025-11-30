const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Table exists, sample data:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTable();