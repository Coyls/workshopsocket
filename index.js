const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'))

let users = []
let rooms = ["Chat_room_1", "Chat_room_2", "Chat_room_3"]

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.emit('userId', socket.id, rooms)
    socket.join(rooms[0]);
    socket.emit('roomCreation', rooms)
    socket.emit('usersConnect', users)

    socket.on('user', userData => {
        users.push(userData)
        io.emit('usersConnect', users)

        let usersInSameRoom = []

        users.forEach(user => {
            if (user.room === userData.room) {
                usersInSameRoom.push(user)
            }
        })

        io.to(userData.room).emit('participants', usersInSameRoom)
        io.to(userData.room).emit('connect message', `${userData.name} vient de se connecter dans ${userData.room}`)
    })

    socket.on('chat message', msg => {
        io.to(msg.room).emit('chat message', msg);
    });

    socket.on('isWriting', userData => {
        io.to(userData.room).emit('isWriting', userData)
    })

    socket.on('changeRoom', (roomId, userData) => {
        io.emit('usersConnect', users)
        socket.join(roomId);
        socket.leave(userData.room)

        const index = users.findIndex(user => user.userId === userData.userId)
        users[index].room = roomId

        let usersInSameRoom = []
        let usersInLastRoom = []

        users.forEach(user => {
            if (user.room === roomId) {
                usersInSameRoom.push(user)
            }
            if (user.room === userData.room) {
                usersInLastRoom.push(user)
            }
        })

        io.to(userData.room).emit('participants', usersInLastRoom)
        io.to(userData.room).emit('connect message', `${userData.name} vient de se déconnecter de ${userData.room}`)
        io.to(roomId).emit('participants', usersInSameRoom)
        io.to(roomId).emit('connect message', `${userData.name} vient de se connecter dans ${roomId}`)
    })

    socket.on('audioMessage', (audioMessage, userData) => {
        io.to(userData.room).emit('audioMessage', audioMessage, userData)
    })


    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.userId === socket.id)

        if (index !== -1) {
            io.to(users[index].room).emit('participants', users)
            io.to(users[index].room).emit('connect message', ` ${users[index].name} vient de se déconnecter de ${users[index].room}`)
            users.splice(index, 1)
        }

        io.emit('usersConnect', users)

    })
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});