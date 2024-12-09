import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));

const port = process.env.PORT;
const mongoUri = process.env.MONGODB_URI as string;

MongoClient.connect(mongoUri)
  .then((client) => {
    console.log('Connected to MongoDB');
    const db = client.db('gameData');
    const highscoreCollection = db.collection('highscore');

    app.get('/api/highscore/get', async (req, res) => {
      try {
        const highscoreDoc = await highscoreCollection.findOne({});
        res.json({ highscore: highscoreDoc?.highscore || 0 });
      } catch (err) {
        res.status(500).json({ error: 'Error fetching highscore' });
      }
    });

    app.post('/api/highscore/post', async (req, res) => {
      const { highscore } = req.body;
      try {
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
      } catch (err) {
        res.status(500).json({ error: 'Error updating highscore' });
      }
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
