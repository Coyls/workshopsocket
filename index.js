const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'))

let users = [];

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.emit('userId', socket.id, "generalChat")
    socket.join('generalChat');


    socket.on('user', login => {
        users.push(login)
        console.log(login)
        io.to(login.room).emit('participants' , users)
        io.to(login.room).emit('connect message', `${login.name} vient de se connecter dans ${login.room}`)
    })

    socket.on('chat message', msg => {
        io.to(msg.room).emit('chat message', msg);
    });

    socket.on('isWriting', login => {
        io.to(login.room).emit('isWriting', login)
    })


    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.userId === socket.id)

        if (index !== -1) {
            io.to(users[index].room).emit('participants' , users)
            io.to(users[index].room).emit('connect message', ` ${users[index].name} vient de se déconnecter de ${users[index].room}`)
            users.splice(index, 1)
        }

    })
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});