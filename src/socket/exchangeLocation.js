const db = require('../config/db');
module.exports = function (io, socket) {
  
  socket.on('sendLocation', (room, lngLat) => {
    socket.broadcast.to(room).emit('receiveLocation', lngLat);
  });
  socket.on('updateStatus', room => {
    socket.broadcast.to(room).emit('updateStatus', true);
  })
};