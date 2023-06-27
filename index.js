const express = require("express");
var http = require("http");
const app = express();
const port = process.env.PORT || 8000;
var server = http.createServer(app);

// var server = serverless(app)
// var io = require("socket.io")(server);

//middlewre
app.use(express.json());

const io = require("socket.io")(server, {
  cors: {
    // origin: "http://localhost:8000",
    methods: ["GET", "POST"],
  },
});

// check the connection of socket from client
let onlineUsers = [];
io.on("connection", (socket) => {
  // socket events will be here
  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log("join-room");
  });

  // send message to clients (who are present in members array)
  socket.on("send-message", (message) => {
    io.to(message.members[0])
    // // if(message.members){
    //   for (let index = 0; index < message.members; index++) {
    //     .to(message.members[1])
        
    //   }
    //   .emit("receive-message", message);
    //   console.log("ini MS "+message.members[1])


    // }
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);
      console.log("send-message jumlah"+message.members.length);
  });

  // clear unread messages
  socket.on("clear-unread-messages", (data) => {
    console.log("clear-unread-messages");
    io.to(data.chat)
      .emit("unread-messages-cleared", data);
  });

  // typing event
  socket.on("typing", (data) => {
    console.log("typing");
    io.to(data.members[0]).emit("started-typing", data);
  });

  // online users

  socket.on("came-online", (userId) => {
    console.log("ada online");
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }

    io.emit("online-users-updated", onlineUsers);
  });

  socket.on("went-offline", (userId) => {
    onlineUsers = onlineUsers.filter((user) => user !== userId);
    io.emit("online-users-updated", onlineUsers);
  });
});

// server.listen(port, "0.0.0.0", () => {
//   console.log("server started");
// });

server.listen(port,function(){
  console.log("Server start at port: 8000");
});