var app = require("express")();
const cors = require("cors");
const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const PORT = 8080;
app.use(cors());
httpServer.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
let connection = 0;
const socketHistory = {};

io.on("connection", (socket) => {
  connection++;
  let socketRoom;

  console.log("new client connected " + socket.id + " " + connection);

  socket.on("join", (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
    socketRoom = room;
    socket.emit("joinResponse", socketHistory[room]);
    console.log(socketHistory);
  });

  socket.on("chat", (data) => {
    // const { message, room } = data;
    // console.log(`msg: ${message}, room: ${room}`);

    socket.broadcast.to(socketRoom).emit("chat", data.message);
    socketHistory[socketRoom] = socketHistory[socketRoom]
      ? [data.message, ...socketHistory[socketRoom]]
      : [data.message];
    console.log(socketHistory);
  });
  socket.on("switch", (data) => {
    const { prevRoom, nextRoom } = data;
    if (prevRoom) socket.leave(prevRoom);
    if (nextRoom) socket.join(nextRoom);
    socketRoom = nextRoom;
    socket.emit("joinResponse", socketHistory[room]);
    console.log(socketHistory);
  });

  socket.on("disconnect", () => {
    console.log(socketHistory);
    connection--;
    console.log("Sorry! User is unfortunately disconnected");
  });
});
