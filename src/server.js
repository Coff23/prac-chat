'use strict';

require('dotenv').config();

const http = require('http').createServer();
const { Server } = require('socket.io');
const io = new Server(http);

const PORT = process.env.PORT || 3002;

const rooms = {};

io.on('connection', (socket) => {
  socket.emit('start');

  socket.on('userJoined', (payload) => {
    socket.emit('roomMenu', payload);
  });

  socket.on('friends', (payload) => {
    const roomName = generateRoomName();
    socket.join(roomName);
    rooms[roomName] = [socket.id];

    console.log(`User ${payload.username} created room ${roomName}`);

    socket.emit('roomCreated', {roomName, username: payload.username});
  });

  socket.on('joinRoom', (payload) => {
    console.log('PAYLOAD', payload);
    const roomName = payload.roomName;
    if(roomName && rooms[roomName]) {
      socket.join(roomName);
      rooms[roomName].push(socket.id);
      console.log(`User ${payload.username} joined room ${roomName}`);
      socket.emit('roomJoined', payload);
    } else {
      console.log(`Room ${roomName} does not exist.`);
    }
  });

  socket.on('message', (payload) => {
    const roomName = payload.roomName;
    const message = payload.message;
    const username = payload.username;

    io.to(roomName).emit('message', { username, message });
  });

  socket.on('leaveChat', (payload) => {
    socket.emit('roomMenu', payload);
  });
});


const generateRoomName = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomName = '';
  for (let i = 0; i < 6; i++) {
    roomName += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomName;
};

function startServer() {
  http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// EXPORTS
module.exports = {
  io,
  start: startServer,
};
