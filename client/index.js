'use strict';

const io = require('socket.io-client');
const inquirer = require('inquirer');
const socket = io('http://localhost:3001');

socket.on('start', () => {
  inquirer.createPromptModule([
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
  inquirer.createPromptModule([
    {
      name: 'roomChoice',
      type: 'rawlist',
      message: 'Please select a chat room!',
      choices: [
        { name: 'Chat with friends', value: 1 },
        { name: 'Chat with anyone', value: 2 },
      ],
    },
  ]).then((answer) => {
    const selectedOption = answer.roomChoice;
    payload.room = selectedOption;
    switch (selectedOption) {
    case 1:
      console.log('Chat with friends');
      socket.emit('friends', payload);
      break;
    case 2:
      console.log('Chat with anyone');
      socket.emit('anyone', payload);
    }
  });
});

socket.on('roomCreated', (payload) => {
  const roomName = payload.roomName;
  console.log(`You have created a room with the name ${roomName}`);
});
