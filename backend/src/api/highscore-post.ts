import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

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

    if (fetchError) {
      if (fetchError.message.includes('No rows')) {
        const { error: insertError } = await supabase
          .from('highscore')
          .insert([{ id: uuidv4(), highscore }]);

        if (insertError) {
          console.error('Error inserting new highscore:', insertError);
          return res.status(500).json({ error: 'Error inserting new highscore' });
        }

        return res.status(201).json({ highscore, message: 'New highscore created' });
      }

      console.error('Error fetching highscore:', fetchError);
      return res.status(500).json({ error: 'Error fetching highscore' });
    }

    if (!currentData) {
      console.error('Unexpected: No data returned and no error.');
      return res.status(500).json({ error: 'Unexpected error fetching highscore' });
    }

    if (currentData.highscore < highscore) {
      const { error: updateError } = await supabase
        .from('highscore')
        .update({ highscore })
        .eq('id', currentData.id);

      if (updateError) {
        console.error('Error updating highscore:', updateError);
        return res.status(500).json({ error: 'Error updating highscore' });
      }

      return res.status(200).json({ highscore, message: 'Highscore updated' });
    }

    return res.status(200).json({
      highscore: currentData.highscore,
      message: 'Highscore not updated (no higher score)',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error' });
  }
};
