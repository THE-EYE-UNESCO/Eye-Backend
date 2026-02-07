import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { reportRoutes } from './routes/reports';
import { adminRoutes } from './routes/admin';
import { responderRoutes } from './routes/responder';
import { storyRoutes } from './routes/stories';
import { DatabaseService } from './services/databaseService';

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/responder', responderRoutes);
app.use('/api/stories', storyRoutes);

app.get('/', (_, res) => {
  res.json({
    message: 'Welcome to The Eye Backend Service',
    version: '1.0.0',
    status: 'online'
  });
});

app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await DatabaseService.getInstance().initialize();

    app.listen(config.port, () => {
      console.log(`🚀 The Eye Backend running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
};

startServer();
