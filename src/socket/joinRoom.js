const db = require('../config/db');
module.exports = function(io, socket)
{
  socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Người dùng tham gia vào phòng: ${room}`);
    });
};