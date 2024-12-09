import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI as string;

let cachedHighscore: number | null = null; 

const fetchHighscoreFromDb = async () => {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db('gameData');
  const highscoreCollection = db.collection('highscore');
  const highscoreDoc = await highscoreCollection.findOne({});
  await client.close();
  return highscoreDoc?.highscore || 0;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  if (cachedHighscore !== null) {
    return res.json({ highscore: cachedHighscore });
  }

  try {
    cachedHighscore = await fetchHighscoreFromDb();
    res.json({ highscore: cachedHighscore });
  } catch (error) {
    console.error('Error fetching highscore:', error);
    res.status(500).json({ error: 'Error fetching highscore' });
  }
};
