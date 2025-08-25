const { server } = require('./app');
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
