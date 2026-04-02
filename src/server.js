const { createServer } = require('./app');

const { server, config } = createServer();

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Stop the other server or set PORT to a free port.`);
    process.exitCode = 1;
    return;
  }

  console.error(error);
  process.exitCode = 1;
});

server.listen(config.port, config.host, () => {
  console.log(`${config.appName} server ready at http://${config.host}:${config.port}`);
  console.log(`Private runtime data: ${config.dataFile}`);
});
