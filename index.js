'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 3002;
const { io } = require('./src/server');

io.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
