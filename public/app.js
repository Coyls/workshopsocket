// ----- Fonction timer ---- //
const wait = (delay) => {
    return new Promise((resolve => {
        setTimeout(() => {
            resolve();
        }, delay)
    }))
}

// ------------------------------- interaction ------------------------------- //
const people = document.querySelector("#people");
const messages = document.querySelector("#messages")
const message = document.querySelector("#message")
const loginPage = document.querySelector("#loginPage")

people.innerHTML += `
    <div class="user" id="generalChat">
        <div class="imgUser">
            <img src="image/chat.svg" alt="chat" class="imgGrav">
        </div>
        <h2 class="nameUser">General chat</h2>
    </div>
    <div class="user" id="test">
        <div class="imgUser">
            <img src="image/chat.svg" alt="chat" class="imgGrav">
        </div>
        <h2 class="nameUser">Test</h2>`

const chatGeneral = document.querySelectorAll('.user')
chatGeneral.forEach(chat => {
    chat.onclick = (e) => {
        people.style.left = "-100vw"
        people.style.transition = "all, 0.5s"

        const roomId = chat.id

        if (login.room !== roomId) {

            socket.emit('changeRoom', roomId, login);
            login.room = roomId
            messages.innerHTML = ""
        }

        titleMessage.innerHTML = `${roomId}`
    }
})


const headerMessage = document.querySelector("#headerMessage")
headerMessage.innerHTML += `
        <div class="imgDivMessageUser">
        
        </div>
        <h2 class="titleMessage"></h2>`
const titleMessage = document.querySelector(".titleMessage")


const backButton = document.querySelector("#backArrow")
backButton.onclick = () => {
    people.style.left = "0"
}

const group = document.querySelector("#group")
const groupUser = document.querySelector("#groupUser")
group.onclick = () => {
    message.style.left = "-20vw"
    groupUser.style.left = "80vw"
    groupUser.style.transition = "all, 0.5s"
    message.style.transition = "all, 0.5s"
}

messages.onclick = () => {
    groupUser.style.left = "100vw"
    message.style.left = "0vw"
}

const sendLogin = document.querySelector("#sendForm")
sendLogin.onclick = () => {
    loginPage.style.display = "none"
}


// -------------------------------- connection -------------------------------- //

let socket = io();
let login = {};
let roomsClientSide = [];

let formLogin = document.querySelector('#formLogin');

// Recuperation de l'id de l'utilisateur lors de ca connection
socket.on('userId', (id,rooms) => {
    // console.log(id)
    login.userId = id
    login.room = rooms[0]
    roomsClientSide = rooms
})

// S’authentifier avec un pseudo et e-mail
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    const name = formData.get("nom")
    const mail = formData.get("email")
    let hash = md5(mail)
    login.name = name
    login.mail = mail
    login.image = `https://gravatar.com/avatar/${hash}`

    socket.emit('user', login)

    const imgCompte = document.querySelector("#imgCompte")
    imgCompte.innerHTML += `
    <img src="https://gravatar.com/avatar/${hash}" alt="imageCompte" class="imgGravCompte">
    `
    const nameCompte = document.querySelector("#nameCompte")
    nameCompte.innerHTML += `${name}`

})


// ---------------------------------------------- Message ---------------------------------------------- //

let formMessage = document.getElementById('formMessage');
let input = document.getElementById('input');

// Contenu des message
let messageFrame = {}

// Envoie du message -----------------------------------------------------
formMessage.addEventListener('submit', function (e) {
    e.preventDefault();
    messageFrame.user = login.name
    messageFrame.message = input.value
    messageFrame.image = login.image
    messageFrame.id = login.userId
    messageFrame.room = login.room

    if (input.value) {
        socket.emit('chat message', messageFrame);
        input.value = '';
    }
});

// Structure et positionnement du message -----------------------------------
socket.on('chat message', function (msg) {
    let item = document.createElement('li');
    // Position
    if (msg.id === login.userId) {
        item.className = "row-reverse"
    } else {
        item.className = "row"
    }
    // Structure
    item.innerHTML += `
                <div class="message-container">
                <img alt="img_profil" src="${msg.image}" class="imgGrav">
                <p class=" message-name">${msg.user}</p>
                <p class="message-text">: ${msg.message}</p>
                </div>`

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight

});

// Message de connection et de déconnexion -----------------------------------------

socket.on('connect message', function (msg) {
    let item = document.createElement('li');
    item.classList.add("connectionMessage")
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight
});


// Liste des participant ---------------------------------------------------------------------------
socket.on('participants', (userInSameRoom) => {
    // console.log(users)
    let participants = document.querySelector("#participants")
    participants.innerHTML = ""

    userInSameRoom.forEach(user => {
        participants.innerHTML += `
                <li id="${user.userId}" class="noPointList">
                    <img alt="img_profil" src="${user.image}" class="imgGravParticipant">
                    <p class="nameParticipant">${user.name}</p>
                </li>`
    })
})


////////////////////////////////////////////Is Typing/////////////////////////////////////////////////

const isWriting = document.querySelector("#isWriting")
const sendButton = document.querySelector("#sendButton")
const sendMessage = document.querySelector("#input")

input.addEventListener('input', (e) => {
    const inputClick = e.target.value
    console.log(inputClick)
    socket.emit('isWriting', login);
})

socket.on('isWriting', (login) => {
    isWriting.innerHTML = `${login.name} <img src="https://media.giphy.com/media/VeerK4hE9sjoB8e6OQ/giphy.gif" alt="isTyping">`
    sendButton.onclick = () => {
        isWriting.innerHTML = ''
    }
    if (sendMessage.value === '') {
        isWriting.innerHTML = ''
    }
})




