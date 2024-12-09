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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { highscore } = req.body;

  if (typeof highscore !== 'number') {
    return res.status(400).json({ error: 'Invalid highscore' });
  }

  try {
    const client = await connectToDatabase();
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
  } catch (error) {
    res.status(500).json({ error: 'Error updating highscore' });
  }
};
