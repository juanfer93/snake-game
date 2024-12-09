import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI as string;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { highscore } = req.body;

  if (typeof highscore !== 'number') {
    return res.status(400).json({ error: 'Invalid highscore' });
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect(); 
    const db = client.db('gameData');
    const highscoreCollection = db.collection('highscore');

    const currentHighscore = await highscoreCollection.findOne({});
    if (currentHighscore?.highscore < highscore) {
      await highscoreCollection.updateOne(
        {},
        { $set: { highscore } },
        { upsert: true }
      );
      res.json({ highscore });
    } else {
      res.json({ highscore: currentHighscore?.highscore });
    }

    await client.close(); 
  } catch (error) {
    console.error('Error updating highscore:', error);
    res.status(500).json({ error: 'Error updating highscore' });
  }
};
