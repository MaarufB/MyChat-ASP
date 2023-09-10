
export default class MessagePayloadModel {
    constructor() {
        this.messagePayload = {
            SenderId: null,
            SenderUsername: null,
            RecipientId: null,
            RecipientUsername: null,
            MessageContent: null
        }
    }

    updatePayload(initialPayload) {
        this.messagePayload.SenderId = initialPayload.senderId;
        this.messagePayload.SenderUsername = initialPayload.senderUsername;
        this.messagePayload.RecipientId = initialPayload.recipientId;
        this.messagePayload.RecipientUsername = initialPayload.recipientUsername;
    }

    getUpdatedMessagePayload() {
        return this.messagePayload;
    }
}