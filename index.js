const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('we have a new connection');

  socket.on('disconnection', () => {
    console.log('user had left');
  });
});

app.use(router);

const basicCallback = () => console.log(`server has started on port ${PORT}`);

server.listen(PORT, basicCallback);
