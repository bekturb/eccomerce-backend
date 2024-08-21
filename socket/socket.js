const { Server } =  require("socket.io");
const http = require("http");
const express = require("express");
const winston = require('winston');

const app = express();

const servers = http.createServer(app);

const io = new Server(servers, {
    cors: {
        origin:["http://localhost:3000"],
        methods:["GET", "POST"]
    }
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

io.on("connection", (socket) => {
    winston.info("A user connected");

        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        });

        const messages = {};

        socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
            const message = createMessage({ senderId, receiverId, text, images });
        
            const user = getUser(receiverId);            
        
            if (!messages[receiverId]) {
              messages[receiverId] = [message];

            } else {
              messages[receiverId].push(message);
            }
        
            io.to(user?.socketId).emit("getMessage", message);
          });

          socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
            const user = getUser(senderId);
        
            if (messages[senderId]) {
              const message = messages[senderId].find(
                (message) =>
                  message.receiverId === receiverId && message.id === messageId
              );
              if (message) {
                message.seen = true;
        
                io.to(user?.socketId).emit("messageSeen", {
                  senderId,
                  receiverId,
                  messageId,
                });
              }
            }
          });

          socket.on("updateLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {   
                     
            io.emit("getLastMessage", {
              lastMessage,
              lastMessageId,
              conversationId
            });
          });

          socket.on("disconnect", () => {
            console.log(`a user disconnected!`);
            removeUser(socket.id);
            io.emit("getUsers", users);
          });
})

module.exports = {app, io, servers};