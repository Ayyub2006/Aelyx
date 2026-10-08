import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Mini School ERP API is running' });
});

// Routes
app.use('/api/auth', authRoutes);

// We will add more routes and error handling middleware later

export default app;
