"use strict";

const myDiv = document.getElementById('messageBox');
const textArea = document.getElementById("messageContent");
const messageSender = document.getElementById('sender');
const messageRecipent = document.getElementById('recipient');
const form = document.getElementById('myForm');
const groupName = `sender:${messageSender.value},recipient:${messageRecipent.value}`;

form.addEventListener('submit', handleSubmit);

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();


connection.start().then(function () {
    console.log(groupName);

    connection.invoke("JoinGroup", groupName);
    console.log('connected')
});

connection.on("ReceiveMessage", function (message) {
    console.log('Message Recieved: ' + message);

    const newElement = document.createElement('p');
    const textNode = document.createTextNode(`${message.messageContent}`);

    if (messageSender.value != message.senderUsername) {
        newElement.classList = "align-self-start";
    } else {
        newElement.classList = "align-self-end";
    }

    newElement.appendChild(textNode);
    myDiv.appendChild(newElement);
    textArea.value = '';
    let scroll = document.querySelector("#messageBox");
    scroll.scrollTop = scroll.scrollHeight;
});


async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(data))
    });
    return response.json();
}

function handleSubmit(event) {
    event.preventDefault();

    let payload = new FormData(event.target);
    payload = Object.fromEntries(payload);
    if (payload.MessageContent.length === 0) {
        return;
    }
    console.log(`Payload: ${payload}`);

    // Send a message to the group
    //await connection.invoke(
    connection.invoke(
        "SendMessageToGroup",
        groupName,
        payload)
        .catch((err) => {
            return console.error(err.toString());
        }); 

    return;

    //const response = await postData('/DummyMessage/SendMessage', payload);

    //if (response) {
    //    const newElement = document.createElement('p');
    //    console.log(response);
    //    const textNode = document.createTextNode(`${response.messageContent}`);
    //    newElement.classList = "align-self-end";
    //    newElement.appendChild(textNode);
    //    myDiv.appendChild(newElement);
    //    textArea.value = '';
    //}

    let scroll = document.querySelector("#messageBox");
    scroll.scrollTop = scroll.scrollHeight;
}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const loadMessages = async () => {
    const currentUrl = window.location.href;
    const splitUrl = currentUrl.split("/");
    const otherUserId = splitUrl[splitUrl.length - 1];

    const response = await fetch(`/DummyMessage/LoadMessage/${otherUserId}`);
    const data = await response.json();

    for (let item of data) {
        const newElement = document.createElement('p');
        const textNode = document.createTextNode(`${item.messageContent}`);
        if (item.recipientId == otherUserId) {
            newElement.classList = "align-self-end";
        }
        else {
            newElement.classList = "align-self-start";
        }

        newElement.appendChild(textNode);
        myDiv.appendChild(newElement);
    }
    let scroll = document.querySelector("#messageBox");
    scroll.scrollTop = scroll.scrollHeight;


    console.log("Load Message Test!");
}

//loadMessages();
// SignalR 






