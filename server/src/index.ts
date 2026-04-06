// server/src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/goals', goalsRoutes);
app.use('/ai', aiRoutes);

/** Public health checks — no auth; safe for load balancers / uptime monitors */
const publicHealthHandler: express.RequestHandler = (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'taskify-api' });
};

app.get('/health', publicHealthHandler);
app.get('/public/health', publicHealthHandler);

app.listen(PORT, () => {
  console.log(`Taskify server running at http://localhost:${PORT}`);
});