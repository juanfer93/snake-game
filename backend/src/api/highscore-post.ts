import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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
    const { data: currentData, error: fetchError } = await supabase
      .from('highscore')
      .select('id, highscore')
      .single();  

    if (fetchError && fetchError.details === 'Results contain 0 rows') {
      const newUUID = uuidv4();  
      const { error: insertError } = await supabase
        .from('highscore')
        .insert([{ id: newUUID, highscore }]);

      if (insertError) {
        console.error('Error inserting new highscore:', insertError);
        throw insertError;
      }

      return res.json({ highscore, message: 'New highscore created' });
    }

    if (currentData && currentData.highscore < highscore) {
      const { error: updateError } = await supabase
        .from('highscore')
        .update({ highscore })
        .eq('id', currentData.id);

      if (updateError) {
        console.error('Error updating highscore:', updateError);
        throw updateError;
      }

      console.log('Response Data:', { highscore, message: 'Highscore updated' });
      return res.json({ highscore, message: 'Highscore updated' });
    }

    return res.json({ highscore: currentData?.highscore, message: 'Highscore not updated' });

  } catch (error) {
    console.error('Error updating highscore:', error);
    return res.status(500).json({ error: 'Error updating highscore' });
  }
};
