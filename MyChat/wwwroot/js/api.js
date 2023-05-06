
class ApiService {
    // This is when working for calling the server/api
    constructor() {
        this.messagingUrl = "/Messaging";
        this.getMessageUrl = `${this.messagingUrl}/loadmessage`;
        this.getGroupNameUrl = `${this.messagingUrl}/GetGroupName`;
        this.contactUrl = "/contact";
        this.getContactsUrl = `${this.contactUrl}/load-contacts`;
        this.initialMessagingPaloadUrl = `${this.messagingUrl}/InitialMessagingPayload`;
    }

    async testMethod(){
        window.alert("Test Method!!!");
    }

    async getGroupName(contactId) {
        const groupName = await this.fetchApi(`${this.getGroupNameUrl}/${contactId}`);

        if (groupName) {
            return groupName.groupName;
        } else {
            window.alert("Cannot get Group Name");
        }

    }

    async getContacts() {
        const contacts = await this.fetchApi(`${this.getContactsUrl}`);
        if (contacts) {
            return contacts;
        } else {
            window.alert("Get Contacts API Failed");
        }
    }

    async getMessages(contactId) {
        const messages = await this.fetchApi(`${this.getMessageUrl}/${contactId}`);
        if(messages) {
            return messages;
        } else {
            window.alert("Get Message Error")
        }
    }

    // this payload will be used when
    async getInitialPayload(contactId) {
        
        const initialPayload = await this.fetchApi(`${this.initialMessagingPaloadUrl}/${contactId}`);
        
        if(payload) {
            let payloadModel = this.getInitialPayload();
            
            payloadModel.SenderId = initialPayload.senderId;
            payloadModel.SenderUsername = initialPayload.senderUsername;
            payloadModel.RecipientId = initialPayload.recipientId;
            payloadModel.RecipientUsername = initialPayload.recipientUsername;
            
            if(!initialPayload.messageContent) {
                payloadModel.MessageContent = initialPayload.messageContent;
            }
            
            return payloadModel;
        }
    }

    getPayloadModel() {
        return {
            SenderId: null,
            SenderUsername: null,
            RecipientId: null,
            RecipientUsername: null,
            MessageContent: null
        }
    }

    async fetchApi(url) {
        try {

            const response = await fetch(url);

            return await response.json();

        } catch (error) {
            console.log(error);
        }
    }

}