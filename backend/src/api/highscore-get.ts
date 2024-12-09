import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI as string;
let client: MongoClient | null = null;

const connectToDatabase = async () => {
  if (client) return client;
  client = new MongoClient(mongoUri);
  await client.connect();
  return client;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('gameData');
    const highscoreCollection = db.collection('highscore');
    const highscoreDoc = await highscoreCollection.findOne({});
    res.json({ highscore: highscoreDoc?.highscore || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching highscore' });
  }
};
