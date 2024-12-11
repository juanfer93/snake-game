import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { highscore } = req.body;

  if (typeof highscore !== 'number') {
    return res.status(400).json({ error: 'Invalid highscore' });
  }

  try {
    const { data: currentHighscore, error: fetchError } = await supabase
      .from('highscore')
      .select('highscore')
      .single();

    if (fetchError) throw fetchError;

    if (!currentHighscore || currentHighscore.highscore < highscore) {
      const { error: updateError } = await supabase
        .from('highscore')
        .upsert({ highscore });

      if (updateError) throw updateError;

      res.json({ highscore });
    } else {
      res.json({ highscore: currentHighscore.highscore });
    }
  } catch (error) {
    console.error('Error updating highscore:', error);
    res.status(500).json({ error: 'Error updating highscore' });
  }
};
