let io = null;

module.exports = {
  init: (server) => {
    io = server;
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  }
};
