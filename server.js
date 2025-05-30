const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());




const questions = require('./questions.json');

app.get('/api/questions', (req, res) => {
  res.json(questions);
});

app.post('/api/submit-score', (req, res) => {
  const { username, score } = req.body;
  const data = { username, score };

  fs.readFile('scores.json', 'utf8', (err, fileData) => {
    const scores = fileData ? JSON.parse(fileData) : [];
    scores.push(data);

    fs.writeFile('scores.json', JSON.stringify(scores, null, 2), () => {
      res.json({ message: 'Score saved!' });
    });
  });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
