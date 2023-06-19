'use strict';

const io = require('socket.io-client');
const inquirer = require('inquirer');
const socket = io('http://localhost:3001');
const readline = require('readline');

let currentRoom = '';

socket.on('start', () => {
  inquirer.prompt([
    {
      name: 'name',
      type: 'input',
      message: 'What is your name?',
    },
  ]).then((answer) => {
    const payload = {
      username: answer.name,
    };
    socket.emit('userJoined', payload);
  });
});

socket.on('roomMenu', (payload) => {
  inquirer.prompt([
    {
      name: 'roomChoice',
      type: 'rawlist',
      message: 'Please select a chat room!',
      choices: [
        { name: 'Create Room', value: 1 },
        { name: 'Chat with anyone', value: 2 },
        { name: 'Join Room', value:3 },
      ],
    },
  ]).then((answer) => {
    const selectedOption = answer.roomChoice;
    const roomPayload = { ...payload };
    roomPayload.room = selectedOption;

    switch (selectedOption) {
    case 1:
      console.log('Chat with friends');
      roomPayload.room = selectedOption;
      socket.emit('friends', roomPayload);
      break;
    case 2:
      console.log('Chat with anyone');
      roomPayload.room = selectedOption;
      socket.emit('anyone', roomPayload);
      break;
    case 3:
      inquirer.prompt([
        {
          name: 'roomName',
          type: 'input',
          message: 'Enter room name:',
        },
      ]).then((answer) => {
        const joinPayload = {
          ...payload,
          roomName: answer.roomName,
        };
        socket.emit('joinRoom', joinPayload);
      });
    }
  });
});

socket.on('roomCreated', (payload) => {
  const roomName = payload.roomName;
  currentRoom = roomName;
  console.log(`You have created a room with the name ${roomName}`);
  const joinPayload = {
    ...payload,
    username: payload.username,
  };
  socket.emit('joinRoom', joinPayload);
});

socket.on('roomJoined', (payload) => {
  const roomName = payload.roomName;
  currentRoom = roomName;
  console.log(`You have joined room ${roomName}`);
  startChat(payload.username);
});

function startChat(username){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('line', (input) => {
    const message = input.trim();
    if(message.toLowerCase() === 'exit') {
      socket.emit('leaveChat', { username: username });
      rl.close();
      return;
    }
    else {
      socket.emit('message', { roomName: currentRoom, username: username, message });
    }
  });
}

socket.on('message', (payload) => {
  console.log(`${payload.username}: ${payload.message}`);
});
