import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import forumRoutes from './routes/forum.js';
import { CreditConfig } from './models/CreditConfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);

// Database Connection Handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discussion_forum';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    
    // Check if the credit configuration exists in the database. If not, seed a default document.
    const configCount = await CreditConfig.countDocuments();
    if (configCount === 0) {
      await CreditConfig.create({ baseCredit: 1, commonDifference: 2 });
      console.log(' Dynamic Credit Engine Rules initialized and seeded in DB (AP: 1, 3, 5, 7...)');
    }

    app.listen(PORT, () => {
      console.log(` Full-Stack Forum Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });