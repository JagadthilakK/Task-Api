require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Server failed to start:', error.message);
  });
};

if (process.env.MONGODB_URI) {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch((error) => {
      console.error('Database connection failed:', error.message);
    });
} else {
  console.log('MONGODB_URI not set. Starting without database connection.');
  startServer();
}
