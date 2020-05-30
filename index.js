//Import statements with require because FML
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

//functions
const { addUser, removeUser, getUser, getUserInRoom } = require('./users');

//Port on localhost
const PORT = process.env.PORT || 5000;

//from router.js
const router = require('./router');

//start server and io sockets
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

//* watching socket on connection
io.on('connection', (socket) => {
  //
  // When a socket has Join
  socket.on('join', ({ name, room }, callback) => {
    //
    // destructuring error and user from add user function
    const { error, user } = addUser({
      id: socket.id,
      name,
      room,
    });

    if (error) return callback(error);

    //to let the user know they joined a room
    //admin generated messages = 'message'
    socket.emit('message', {
      user: 'admin',
      text: `${user.name} welcome to the room ${user.room}`,
    });

    //to broadcast to everyone else that a new user has joined
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name} has joined`,
    });

    //if no error, user joins room
    socket.join(user.room);

    // to get room Data
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  //*
  //user generates messages = 'sendMessages'
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', {
      room: user.room,
      text: getUserInRoom(user.room),
    });

    callback();
  });

  //* watching socket on disconnection
  socket.on('disconnect', () => {
    //remove user when disconnecting i.e. refreshing
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} had left`,
      });
    }
  });
});

app.use(router);

const basicCallback = () => console.log(`server has started on port ${PORT}`);

server.listen(PORT, basicCallback);
