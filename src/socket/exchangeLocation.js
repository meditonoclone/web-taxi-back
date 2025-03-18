const db = require('../config/db');
module.exports = function (io, socket) {
  socket.on('sendLocation', ({ roomId, latitude, longitude }) => {
    socket.to(roomId).emit('receiveLocation', { latitude, longitude });
  });
};