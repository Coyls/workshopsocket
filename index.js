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
let rooms = ["Chat room 1", "Chat room 2"]

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.emit('userId', socket.id, rooms)
    socket.join(rooms[0]);

    // console.log(socket)

    socket.on('user', login => {
        users.push(login)

        let userInSameRoom = []

        users.forEach(user => {
            if (user.room === login.room) {
                userInSameRoom.push(user)
            }
        })

        io.to(login.room).emit('participants', userInSameRoom)
        io.to(login.room).emit('connect message', `${login.name} vient de se connecter dans ${login.room}`)
    })

    socket.on('chat message', msg => {
        io.to(msg.room).emit('chat message', msg);
    });

    socket.on('isWriting', login => {
        io.to(login.room).emit('isWriting', login)
    })

    socket.on('changeRoom', (roomId, login) => {
        socket.join(roomId);
        socket.leave(login.room)

        const index = users.findIndex(user => user.userId === login.userId)
        users[index].room = roomId
        console.log(users)

        // -- A refactor car dupliquer -- //
        let userInSameRoom = []
        let userInLastRoom = []

        users.forEach(user => {
            if (user.room === roomId) {
                userInSameRoom.push(user)
            }
            if (user.room === login.room) {
                userInLastRoom.push(user)
            }
        })

        io.to(login.room).emit('participants', userInLastRoom)
        io.to(login.room).emit('connect message', `${login.name} vient de se déconnecter de ${login.room}`)
        io.to(roomId).emit('participants', userInSameRoom)
        io.to(roomId).emit('connect message', `${login.name} vient de se connecter dans ${roomId}`)
        // ---------------------------------- //
    })

    socket.on('audioMessage', (audioMessage, login) => {
        io.to(login.room).emit('audioMessage', audioMessage, login)
    })


    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.userId === socket.id)

        if (index !== -1) {
            io.to(users[index].room).emit('participants', users)
            io.to(users[index].room).emit('connect message', ` ${users[index].name} vient de se déconnecter de ${users[index].room}`)
            users.splice(index, 1)
        }

    })
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});