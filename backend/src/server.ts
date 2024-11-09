import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';  

const app = express();
const port = 3001;
const highscoreFile = path.resolve(__dirname, '../highscore.json');
console.log('Highscore file path:', highscoreFile);


app.use(cors());

app.use(express.json());

app.get('/api/highscore/get', (req, res) => {
  fs.readFile(highscoreFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading highscore file:', err);  // Log the detailed error
      return res.status(500).json({ error: 'Error reading highscore file', details: err.message });
    }
    res.json(JSON.parse(data));
  });
});


app.post('/api/highscore/post', (req, res) => {
  const { highscore } = req.body;

  fs.readFile(highscoreFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading highscore file' });
    }

    const currentHighscore = JSON.parse(data).highscore;

    if (highscore > currentHighscore) {
      fs.writeFile(highscoreFile, JSON.stringify({ highscore }), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error writing highscore file' });
        }
        res.json({ highscore });
      });
    } else {
      res.json({ highscore: currentHighscore });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
