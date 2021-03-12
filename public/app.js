// ----------------- Variable pour les audio ------------------------ //
let leftchannel = [];
let rightchannel = [];
let recorder = null;
let recordingLength = 0;
let mediaStream = null;
let sampleRate = 44100;
let context = null;
let blob = null;
// -------------------- Variable Socket ------------------ //
let socket = io();
let userData = {};
let roomsClientSide = [];

// ------------------------------- Home page rooms ------------------------------- //
const people = document.querySelector("#people");
const messages = document.querySelector("#messages")
const message = document.querySelector("#message")
const loginPage = document.querySelector("#loginPage")
const roomsConnect = document.querySelector("#roomsConnect")
const usersConnect = document.querySelector("#usersConnect")

socket.on('roomCreation', rooms => {

    roomsConnect.innerHTML = ``

    rooms.forEach(room => {
        roomsConnect.innerHTML += `
    <div class="user" id="${room}">
        <div class="imgUser">
            <img src="image/chat.svg" alt="chat" class="imgRoom">
        </div>
        <h2 class="nameUser">${room}</h2>
    </div>`
    })

    const chatGeneral = document.querySelectorAll('.user')

    chatGeneral.forEach(chat => {
        chat.onclick = () => {
            people.style.left = "-100vw"
            people.style.transition = "all, 0.5s"

            const roomId = chat.id

            if (userData.room !== roomId) {

                socket.emit('changeRoom', roomId, userData);
                userData.room = roomId
                messages.innerHTML = ""
            }

            titleMessage.innerHTML = `${roomId}`
        }
    })
})


socket.on("usersConnect", users => {

    usersConnect.innerHTML = ``

    users.forEach(user => {
        usersConnect.innerHTML += `
    <div class="userLog" id="${user.userId}">
        <div class="imgUser">
            <img src="${user.image}" alt="chat" class="imgGrav">
        </div>
        <h2 class="nameUser">${user.name}</h2>
    </div>`
    })
})

///////////////////////////////////Title room in header message/////////////////////////////////

const headerMessage = document.querySelector("#headerMessage")

headerMessage.innerHTML += `
        <div class="imgDivMessageUser">
            <img src="image/chat.svg" alt="chat" class="imgRoomBig">
        </div>
        <h2 class="titleMessage"></h2>`
const titleMessage = document.querySelector(".titleMessage")

//////////////////////////////////////////Transitions/////////////////////////////////////////////

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

///////////////////////////////////////Login///////////////////////////////////////////////////////

const sendLogin = document.querySelector("#sendForm")
sendLogin.onclick = () => {
    loginPage.style.display = "none"
}

//////////////////////////////////////////Connexion/////////////////////////////////////////////




let formLogin = document.querySelector('#formLogin');

// Recuperation de l'id de l'utilisateur lors de ca connection

socket.on('userId', (id, rooms) => {
    // console.log(id)
    userData.userId = id
    userData.room = rooms[0]
    roomsClientSide = rooms
})

// S’authentifier avec un pseudo et e-mail
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    const name = formData.get("nom")
    const mail = formData.get("email")
    let hash = md5(mail)
    userData.name = name
    userData.mail = mail
    userData.image = `https://gravatar.com/avatar/${hash}`

    socket.emit('user', userData)

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

// Contenu des messages
let messageFrame = {}

// Envoie du message -----------------------------------------------------
formMessage.addEventListener('submit', function (e) {
    e.preventDefault();
    messageFrame.user = userData.name
    messageFrame.message = input.value
    messageFrame.image = userData.image
    messageFrame.id = userData.userId
    messageFrame.room = userData.room

    if (input.value) {
        socket.emit('chat message', messageFrame);
        input.value = '';
    }
});

//////////////////////////////////////////Audio message//////////////////////////////////////////

socket.on('audioMessage', (audioMessage, userFrom) => {

    let bufViewReceived = new Uint8Array(audioMessage);

    let blobReceived = new Blob([bufViewReceived], {type: "audio/wav"});

    let url = window.URL.createObjectURL(blobReceived);

    if (userFrom.userId === userData.userId) {
        messages.innerHTML += `<li class="row-reverse"><audio controls src="${url}" ></audio></li>`
    } else {
        messages.innerHTML += `<li class="row"><audio controls src="${url}" ></audio></li>`

    }
    messages.scrollTop = messages.scrollHeight

})

///////////////////////////////////Message à gauche ou droite//////////////////////////////////////////

socket.on('chat message', function (msg) {
    let item = document.createElement('li');
    // Position
    if (msg.id === userData.userId) {
        item.className = "row-reverse"
    } else {
        item.className = "row"
    }
    // Structure
    if (msg.id === userData.userId) {
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

//////////////////////////////////////Liste participants//////////////////////////////////////////

socket.on('participants', (userInSameRoom) => {

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
    socket.emit('isWriting', userData);
})

socket.on('isWriting', (login) => {
    isWriting.innerHTML = `<a class="fontPoppins">${login.name}</a> <img src="https://media.giphy.com/media/VeerK4hE9sjoB8e6OQ/giphy.gif" alt="isTyping">`
    sendButton.onclick = () => {
        isWriting.innerHTML = ''
    }
    if (sendMessage.value === '') {
        isWriting.innerHTML = ''
    }
})

////////////////////////////////////////////Micro//////////////////////////////////////////////////

const divMicro = document.querySelector("#divMicro")

let microOn = false

divMicro.onclick = () => {

    if (microOn) {
        divMicro.innerHTML = `
            <img src="image/microphone.svg" alt="microphone" class="imgMicro startAndStop" id="stopRecordingButton">`

        microOn = false

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
        blob = new Blob([view], {type: 'audio/wav'});
        if (blob == null) {
            return;
        }

        socket.emit('audioMessage', blob, userData);

        leftchannel = []
        rightchannel = []
        recordingLength = 0


    } else {
        divMicro.innerHTML = `
            <img src="image/stop.svg" alt="microphone" class="imgMicro startAndStop" id="startRecordingButton">`

        microOn = true

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia(
            {
                audio: true
            },
            function (e) {

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
    }
}

// ---- Fonctions pour les vocaux

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



