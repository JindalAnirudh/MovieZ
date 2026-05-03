import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8000;

app.get('/', (req, res) => {
  res.send('Minimal server is running!');
});

app.listen(port, () => {
  console.log(`Minimal server running on port ${port}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});
