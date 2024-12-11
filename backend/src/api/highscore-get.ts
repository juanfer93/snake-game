import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { data, error } = await supabase
      .from('highscore')
      .select('highscore')
      .limit(1); 

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const highscore = data.length > 0 ? data[0].highscore : 0;

    res.json({ highscore });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error fetching highscore' });
  }
};


