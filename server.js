// filepath: backend/server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const allowedOrigins = [
  'https://lakesregionjr.com/video.html',
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: false,
  optsionsSuccessStatus: 200,
};


// Replace with your actual MongoDB Atlas connection string
const uri = 'mongodb+srv://isandhage1:Celtics12#@lakesregionjr.u0s4cew.mongodb.net/?retryWrites=true&w=majority&appName=LakesRegionJR';
const client = new MongoClient(uri);

let db;
let statsCollection;

async function connectDB() {
  await client.connect();
  db = client.db('videoData'); // Use your database name
  statsCollection = db.collection('stats');
  console.log('Connected to MongoDB');
}
connectDB();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Get stats
app.get('/api/stats', async (req, res) => {
  const stats = await statsCollection.findOne({ _id: 'main' }) || { likes: 0, views: 0 };
  res.json(stats);
});

// Increment views
app.post('/api/view', async (req, res) => {
  const result = await statsCollection.findOneAndUpdate(
    { _id: 'main' },
    { $inc: { views: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  res.json({ views: result.value.views });
});

// Increment likes
app.post('/api/like', async (req, res) => {
  const result = await statsCollection.findOneAndUpdate(
    { _id: 'main' },
    { $inc: { likes: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  res.json({ likes: result.value.likes });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));