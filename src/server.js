'use strict';

require('dotenv').config();

const { Server } = require('socket.io');
const PORT = process.env.PORT || 3002;
const io = new Server(PORT);

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

    socket.emit('roomCreated', {roomName});
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

// EXPORTS
module.exports = {
  io,
};
