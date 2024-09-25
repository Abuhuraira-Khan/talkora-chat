import { Socket } from 'dgram';
import express from 'express';
import http from 'http';
import { Server} from 'socket.io';
import { configDotenv } from 'dotenv';

configDotenv(); 

const app = express();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods:["GET","POST"],
        credentials:true
    }
})


const userSocketMap ={};

io.on('connection', (socket) => {

    const userId = socket.handshake.query.userId;

    userSocketMap[userId] = socket.id;

    // io.emit() used to sen all online users to the connected user
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
})

export {io, server, app}