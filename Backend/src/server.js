const app = require('./app');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
});
