import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { globalErrorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import onboardingRoutes from './routes/onboarding.routes';
import servicesRoutes from './routes/services.routes';
import searchRoutes from './routes/search.routes';
import appointmentsRoutes from './routes/appointments.routes';
import scheduleRoutes from './routes/schedule.routes';
import masterSettingsRoutes from './routes/master-settings.routes';
import notificationsRoutes from './routes/notifications.routes';
import reviewsRoutes from './routes/reviews.routes';
import portfolioRoutes from './routes/portfolio.routes';
import dashboardRoutes from './routes/dashboard.routes';
import favoritesRoutes from './routes/favorites.routes';

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/master-settings', masterSettingsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/favorites', favoritesRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
    });
  });

  // Global error handler
  app.use(globalErrorHandler);

  return app;
};
