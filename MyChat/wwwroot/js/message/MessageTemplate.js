

export default class MessageTemplate {
    constructor() {
        this.messageParentContainer = document.getElementById('message-thread-container');
        this.recipientName = document.getElementById('recepient-name');
    }

    createMessageTemplate(message) {
        const createdMessageContainer = document.createElement('div');
        const createdMessageContentElement = document.createElement('p');

        createdMessageContentElement.textContent = message.messageContent;
        createdMessageContentElement.classList.add("message-content");

        if (message.recipientUsername === this.recipientName.textContent) {
            createdMessageContainer.classList.add("message-content-container", "message-text-right");
        } else {
            createdMessageContainer.classList.add("message-content-container", "message-text-left")
        }

        createdMessageContainer.appendChild(createdMessageContentElement);
        this.messageParentContainer.appendChild(createdMessageContainer);

        this.messageParentContainer.scrollTop = this.messageParentContainer.scrollHeight;

        return this.messageParentContainer;
    }

    getMessageParentContainer() {
        return this.messageParentContainer;
    }

    removeExistingMessages() {
        if (this.messageParentContainer.children.length == 0) return;

        let childement = this.messageParentContainer.lastElementChild;

        while (childement) {
            this.messageParentContainer.removeChild(childement)
            childement = this.messageParentContainer.lastElementChild;
        }
        return this.messageParentContainer;
    }
}