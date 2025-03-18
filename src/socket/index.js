const handleValidate = require("./validate");
const handleJoinRoom = require("./joinRoom")
const handleExchangeLocation = require("./exchangeLocation")
module.exports = (io) => {
    
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        handleValidate(io, socket)
        handleJoinRoom(io, socket)
        handleExchangeLocation(io, socket)
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
