const db = require('../config/db');
module.exports = function(io, socket)
{
  socket.on('joinRoom', (room, message) => {
      socket.join(room);
      if(message)
      {
        io.to(room).emit('message', message);
      }
      console.log(`Người dùng tham gia vào phòng: ${room}`);
    });
};