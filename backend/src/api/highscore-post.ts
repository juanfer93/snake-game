import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI as string;

export default async (req: VercelRequest, res: VercelResponse) => {
  const { highscore } = req.body;

  try {
    const client = await MongoClient.connect(mongoUri);
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

    client.close();
  } catch (error) {
    res.status(500).json({ error: 'Error updating highscore' });
  }
};
