class MessageTemplate {
    constructor() {
        this.messageParentContainer = 'message-thread-container';
    }

    // this function will be used when loading and receiving
    createMessageTemplate(message, isRightSide) {
        const createdMessageContainer = document.createElement('div');
        const createdMessageContentElement = document.createElement('p');

        createdMessageContainer.classList.add("message-content-container");

        createdMessageContentElement.textContent = message;
        createdMessageContentElement.classList.add("message-content");

        if (isRightSide) {
            createdMessageContainer.classList.add("message-text-right");
        } else {
            createdMessageContainer.classList.add("message-text-left")
        }

        createdMessageContainer.appendChild(createdMessageContentElement);

        // scroll to the bottom;
        this.messageParentContainer.scrollTop = this.getMessageParentContainer.scrollHeight;

        return this.messageParentContainer;
    }

    appendMessage(message, messageContainerInstance) {
        // TODO
    }

    getMessageParentContainer() {
        return this.messageParentContainer;
    }

    removeExistingMessages(parentContainer) {
        let childement = parentContainer.lastElementChild;

        while (childement) {
            parentContainer.removeChild(childement)
            childement = parentContainer.lastElementChild;
        }
        return parentContainer;
    }
}