const { Server } =  require("socket.io");
const http = require("http");
const express = require("express");
const winston = require('winston');

const app = express();

const servers = http.createServer(app);
const clientUrl = process.env.CLIENT_URL

const io = new Server(servers, {
    cors: {
        origin:[clientUrl],
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

const createMessage = ({ senderId, receiverId, text, images, seen }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen,
});

io.on("connection", (socket) => {
    winston.info("A user connected");

        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        });

        const messages = {};

        socket.on("sendMessage", ({ senderId, receiverId, text, images, seen }) => {
            const message = createMessage({ senderId, receiverId, text, images, seen });
        
            const user = getUser(receiverId);         
        
            if (!messages[receiverId]) {
              messages[receiverId] = [message];

            } else {
              messages[receiverId].push(message);
            }
        
            io.to(user?.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
              senderId,
              isRead: false,
              date: new Date(),
            })
          });

          socket.on("addConversation", ({conversation, userId}) => {    
            const user = getUser(userId);
           io.to(user?.socketId).emit("getConversation", conversation)
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

          socket.on("disconnect", () => {
            console.log(`a user disconnected!`);
            removeUser(socket.id);
            io.emit("getUsers", users);
          });
})

module.exports = {app, io, servers};