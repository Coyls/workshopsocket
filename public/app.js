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
        <h2 class="nameUser">Chat room 1</h2>
    </div>
    <div class="user" id="test">
        <div class="imgUser">
            <img src="image/chat.svg" alt="chat" class="imgGrav">
        </div>
        <h2 class="nameUser">Chat room 2</h2>`

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
            <img src="image/chat.svg" alt="chat" class="imgGrav">
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

socket.on('userId', (id, rooms) => {
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

// test audio message ///////////////////////////////////////////////////////
socket.on('audioMessage', (audioMessage, userFrom) => {
    console.log(audioMessage)
    console.log(userFrom.name)

    let bufView = new Uint8Array(audioMessage);

    console.log(bufView)

    const blob = new Blob([bufView], {type: "audio/wav"});

    let url = window.URL.createObjectURL(blob);

    if (userFrom.userId === login.userId) {
        messages.innerHTML += `<li class="row-reverse"><audio controls src="${url}" ></audio></li>`
    } else {
        messages.innerHTML += `<li class="row"><audio controls src="${url}" ></audio></li>`

    }
    messages.scrollTop = messages.scrollHeight


    console.log(url)

})

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
    if (msg.id === login.userId) {
        item.innerHTML += `
                <div class="messageMainDroite">
                    <div class="name-containerDroite">
                        <p class=" message-name">${msg.user}</p> 
                        <img alt="img_profil" src="${msg.image}" class="imgGravMessage"> 
                    </div>
                    <div class="messageBulleDroite">
                        <p class="message-textDroite">${msg.message} </p>
                    </div>
                </div>`
    } else {
        item.innerHTML += `
                <div class="messageMainGauche">
                    <div class="name-containerGauche">
                        <img alt="img_profil" src="${msg.image}" class="imgGravMessage"> 
                        <p class=" message-name">${msg.user}</p>
                    </div>
                    <div class="messageBulleGauche">
                        <p class="message-textGauche">${msg.message} </p>
                    </div>
                </div>`
    }


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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let startRecordingButton = document.getElementById("startRecordingButton");
let stopRecordingButton = document.getElementById("stopRecordingButton");
let playButton = document.getElementById("playButton");


let leftchannel = [];
let rightchannel = [];
let recorder = null;
let recordingLength = 0;
let volume = null;
let mediaStream = null;
let sampleRate = 44100;
let context = null;
let blob = null;

startRecordingButton.addEventListener("click", function () {
    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
        {
            audio: true
        },
        function (e) {
            console.log("user consent");

            // creates the audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();

            // creates an audio node from the microphone incoming stream
            mediaStream = context.createMediaStreamSource(e);

            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
            // bufferSize: the onaudioprocess event is called when the buffer is full
            let bufferSize = 2048;
            let numberOfInputChannels = 2;
            let numberOfOutputChannels = 2;
            if (context.createScriptProcessor) {
                recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            } else {
                recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            }

            recorder.onaudioprocess = function (e) {
                leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
                rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
                recordingLength += bufferSize;
            }

            // we connect the recorder
            mediaStream.connect(recorder);
            recorder.connect(context.destination);
        },
        function (e) {
            console.error(e);
        });
});

stopRecordingButton.addEventListener("click", function () {

    // stop recording
    recorder.disconnect(context.destination);
    mediaStream.disconnect(recorder);

    // we flat the left and right channels down
    // Float32Array[] => Float32Array
    let leftBuffer = flattenArray(leftchannel, recordingLength);
    let rightBuffer = flattenArray(rightchannel, recordingLength);
    // we interleave both channels together
    // [left[0],right[0],left[1],right[1],...]
    let interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    let buffer = new ArrayBuffer(44 + interleaved.length * 2);
    let view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    let index = 44;
    let volume = 1;
    for (let i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    blob = new Blob([view], { type: 'audio/wav' });
});

playButton.addEventListener("click", function () {
    if (blob == null) {
        return;
    }

    console.log(blob)

    //let url = window.URL.createObjectURL(blob);
    // let audio = new Audio(url);
    // audio.play();

    socket.emit('audioMessage', blob,login);
    //console.log(url)
});

function flattenArray(channelBuffer, recordingLength) {
    let result = new Float32Array(recordingLength);
    let offset = 0;
    for (let i = 0; i < channelBuffer.length; i++) {
        let buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function interleave(leftChannel, rightChannel) {
    let length = leftChannel.length + rightChannel.length;
    let result = new Float32Array(length);

    let inputIndex = 0;

    for (let index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

function writeUTFBytes(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}



