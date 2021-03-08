const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let users = [];

const user = [
    {
        name: "Yohan",
        email: "yohan_quinquis@icloud.com"
    },
]

io.on('connection', (socket) => {
    console.log(socket)
    console.log(socket.id)


    socket.on('user', login => {
        users.push(login)
        io.emit('user', users);
    })

    socket.on('chat message', msg => {
        /*socket.on('user', user => {
            io.emit('user',user)
        });*/
        io.emit('chat message', msg);

    });
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});