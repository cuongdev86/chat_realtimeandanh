const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors()); // Cho phép tất cả các nguồn truy cập

const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Lưu trữ thông tin người dùng và socket ID

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Xử lý khi người dùng đăng nhập và gán thông tin người dùng vào socket ID
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    // Lắng nghe sự kiện gửi tin nhắn
    socket.on('sendMessage', (data) => {
        console.log('Message received from user', data.senderId, 'to', data.receiverId);
        if (data.receiverId === null) {
            // Gửi cho tất cả người dùng
            io.emit('receiveMessage', data);
        } else {
            // Gửi cho người nhận cụ thể
            const targetSocketId = users[data.receiverId];
            if (targetSocketId) {
                io.to(targetSocketId).emit('receiveMessage', data);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Xóa người dùng khỏi danh sách khi ngắt kết nối
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

server.listen(3000,'0.0.0.0', () => {
    console.log('Listening on port 3000');
});