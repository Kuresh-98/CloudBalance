import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import costsRouter from './routes/costs';
import resourcesRouter from './routes/resources';
import recommendationsRouter from './routes/recommendations';
import teamsRouter from './routes/teams';
import devRouter from './routes/dev';
import authRouter from './routes/auth';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/costs', requireAuth, costsRouter);
app.use('/api/resources', requireAuth, resourcesRouter);
app.use('/api/recommendations', requireAuth, recommendationsRouter);
app.use('/api/teams', requireAuth, teamsRouter);
app.use('/api/dev', devRouter);

// Liveness health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

