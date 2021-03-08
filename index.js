const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let users = [];

/*const user = [
    {
        name: "Yohan",
        email: "yohan_quinquis@icloud.com"
    },
]*/

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.emit('userId', socket.id)


    socket.on('user', login => {
        users.push(login)
        console.log(login)
        // io.emit('user', users);
        io.emit('chat message', `${login.name} viens de ce connecter`)
    })

    socket.on('chat message', msg => {
        io.emit('chat message', msg);

    });


    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.userId === socket.id)
        io.emit('chat message', ` ${users[index].name} viens de ce deconnecter`)
        users.splice(index, 1)

    })
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});