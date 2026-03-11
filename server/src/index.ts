// server/src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals';  // add

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/goals', goalsRoutes);  // add

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Taskify server running at http://localhost:${PORT}`);
});