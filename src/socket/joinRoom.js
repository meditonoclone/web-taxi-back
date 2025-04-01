const db = require('../config/db');
module.exports = function(io, socket)
{
  socket.on('joinRoom', (room, message, accept) => {
      socket.join(room);
      if(message)
      {
        io.to(room).emit('message', message);
      }
      if(accept)
      {
        socket.to(room).emit('accept', true);
      }
      console.log(`Người dùng tham gia vào phòng: ${room}`);
    });
};