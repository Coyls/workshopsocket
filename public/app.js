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
people.innerHTML += `
    <div class="user">
        <div class="imgUser">
            <img src="image/chat.svg" alt="chat" class="imgGrav">
        </div>
        <h2 class="nameUser">General chat</h2>
    </div>
    `

const chatGeneral = document.querySelector('.user')
chatGeneral.onclick = () => {
    people.style.left = "-100vw"
    people.style.transition = "all, 0.5s"
}

const headerMessage = document.querySelector("#headerMessage")
headerMessage.innerHTML += `
        <div class="imgDivMessageUser">
        
        </div>
        <h2 class="titleMessage">General chat</h2>
    `
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



// -------------------------------- connection -------------------------------- //

let socket = io();
let login = {};

let formLogin = document.querySelector('#formLogin');

// Recuperation de l'id de l'utilisateur lors de ca connection
socket.on('userId', id => {
    console.log(id)
    login.userId = id
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
    document.scrollTo(0, document.body.scrollHeight);

});

// Message de connection et de déconnexion -----------------------------------------
socket.on('connect message', function (msg) {
    let item = document.createElement('li');
    item.classList.add("connectionMessage")
    item.textContent = msg;
    messages.appendChild(item);
    document.scrollTo(0, document.messages.scrollHeight);
});


// Liste des participant ---------------------------------------------------------------------------
socket.on('participants', (users) => {
    console.log(users)
    let participants = document.querySelector("#participants")
    participants.innerHTML = ""

    users.forEach(user => {
        participants.innerHTML += `
                <li id="${user.userId}" class="noPointList">
                    <img alt="img_profil" src="${user.image}" class="imgGravParticipant">
                    <p class="nameParticipant">${user.name}</p>
                </li>
          `
    })
})


// “pseudo est en train d’écrire” --------------------------------------------------------
const isWriting = document.querySelector("#isWriting")

input.addEventListener('input', (e) => {
    const test = e.target.value
    console.log(test)
    socket.emit('isWriting', login);
})

socket.on('isWriting', (login) => {
    isWriting.innerHTML = `${login.name} ...`
    wait(4000).then(() => {
        isWriting.innerHTML = ''
    })

})




