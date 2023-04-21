"use strict";

const myDiv = document.getElementById('messageBox');
const textArea = document.getElementById("messageContent");
const messageSender = document.getElementById('sender');
const messageRecipent = document.getElementById('recipient');
const form = document.getElementById('myForm');

form.addEventListener('submit', handleSubmit);

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

// SignalR 
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

connection.start().then(function () {
    const groupName = `sender:${messageSender.value},recipient:${messageRecipent.value}`;
    console.log(groupName);

    connection.invoke("JoinGroup", groupName);
    console.log('connected')
});

connection.on("ReceiveMessage", function (message) {

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

async function handleSubmit(event) {
    event.preventDefault();

    let payload = new FormData(event.target);
    payload = Object.fromEntries(payload);
    if (payload.MessageContent.length === 0) {
        return;
    }
    console.log(`Payload: ${payload}`);

    // Send a message to the group

    connection.invoke(
        "SendMessageToGroup",
        "my-group-name",
        payload)
        .catch((err) => {
            return console.error(err.toString());
        }); 
         console.log("Send message");
    return;

    const response = await postData('/DummyMessage/SendMessage', payload);

    if (response) {
        const newElement = document.createElement('p');
        console.log(response);
        const textNode = document.createTextNode(`${response.messageContent}`);
        newElement.classList = "align-self-end";
        newElement.appendChild(textNode);
        myDiv.appendChild(newElement);
        textArea.value = '';
        // removeAllChildNodes(myDiv);
        // await loadMessages();
    }

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

loadMessages();