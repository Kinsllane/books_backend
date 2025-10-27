import { app, initializeAPI } from './app';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initializeAPI();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();