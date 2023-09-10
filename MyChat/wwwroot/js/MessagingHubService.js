import ApiService from './api.js';

export default class MessagingHubService {

    constructor(groupNameModel, messagePayloadModel) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub")
            .build();

        // listen to an event OnReceiveMessage
        this.connection.on("ReceiveMessage", this.onReceiveMessage);

        this.sendButton = document.getElementById('send-message');
        this.messageInput = document.getElementById('message-input');
        this.apiService = new ApiService();
        this.groupNameModel = groupNameModel;
        this.messagePayloadModel = messagePayloadModel;

        this.messageParentContainer = document.getElementById('message-thread-container');
        this.recipientName = document.getElementById('recepient-name');
    }

    async clickSendMessageHandler() {
        this.sendButton.addEventListener('click', async () => {
            let payload = this.messagePayloadModel.getUpdatedMessagePayload()
            const groupName = this.groupNameModel.getGroupName();

            if (this.messageInput.value == null ||
                this.messageInput.value == "" ||
                this.recipientName.textContent == "" ||
                this.recipientName.textContent == null) {

                return;
            }

            payload.MessageContent = this.messageInput.value;

            await this.connection.invoke("SendMessageToGroup", groupName, payload);

            this.messageInput.value = "";
        })
    }

    async pressEnterSendMessageHandler() {
        this.messageInput.addEventListener("keydown", async (event) => {
            let payload = this.messagePayloadModel.getUpdatedMessagePayload();
            const groupName = this.groupNameModel.getGroupName();

            if (event.key === "Enter") {
                if (this.messageInput.value == null ||
                    this.messageInput.value == "" ||
                    this.recipientName.textContent == "" ||
                    this.recipientName.textContent == null) {

                    return;
                }

                payload.MessageContent = this.messageInput.value;

                await this.connection.invoke("SendMessageToGroup", groupName, payload);

                this.messageInput.value = "";
            } else if (event.key === "Enter" && event.shiftKey) {
                window.alert("This is it!");
            }
        });
    }

    async startSendMessageHandler() {
        await this.clickSendMessageHandler();
        await this.pressEnterSendMessageHandler();
    }

    async createHubConnection(groupName) {

        await this.stopHubConnection();

        this.connection.start().then(async () => {
            await this.connection.invoke("JoinGroup", groupName)
        });

    }

    async onReceiveMessage(message) {
        const createdMessageContainer = document.createElement('div');
        const createdMessageText = document.createElement('p');

        createdMessageText.classList = "message-content";

        if (this.recipientName.textContent === message.recipientUsername) {
            createdMessageContainer.classList.add("message-content-container", "message-text-right");
            createdMessageText.textContent = message.messageContent;
            createdMessageContainer.appendChild(createdMessageText);

        } else {
            createdMessageContainer.classList.add("message-content-container", "message-text-left");
            createdMessageText.textContent = message.messageContent;
            createdMessageContainer.appendChild(createdMessageText);
        }

        this.messageParentContainer.appendChild(createdMessageContainer)

        this.messageParentContainer.scrollTop = this.messageParentContainer.scrollHeight;
    }

    async stopHubConnection() {
        if (this.connection) {
            await this.connection.stop();
        }
    }

    async addGroup(groupName) {
        this.stopHubConnection();
        this.hubConnection().then(async () => {
            await this.hubConnection().invoke("JoinGroup", groupName);
        });
    }

    async hubConnection() {
        return this.connection;
    }

    async sendMessageHandler(groupName, payload) {
        try {
            await this.hubConnection().invoke("SendMessageToGroup", groupName, payload);
        } catch (error) {
            window.alert(error);
        }
    }
}