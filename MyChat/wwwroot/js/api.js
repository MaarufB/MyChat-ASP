class ApiService {
    constructor() {
        this.messagingUrl = "/message";
        this.getMessageUrl = `${this.messagingUrl}/load-messages`;
        this.getGroupNameUrl = `${this.messagingUrl}/get-groupname`;
        this.contactUrl = "/contact";
        this.getContactsUrl = `${this.contactUrl}/get-contacts`;
        this.getUsersUrl = `${this.contactUrl}/get-users`;
        this.initialMessagingPaloadUrl = `${this.messagingUrl}/initial-message-payload`;
        this.addContactUrl = `${this.contactUrl}/add-contact`;
        this.updateContactUrl = `${this.contactUrl}/update-contact`;
        this.removeContactUrl = `${this.contactUrl}/remove-contact`;
    }

    async getGroupName(contactId) {
        const groupName = await this.fetchApi(`${this.getGroupNameUrl}/${contactId}`);

        if (groupName) {
            return groupName;
        } else {
            window.alert("Cannot get Group Name");
        }
    }

    async getUsers() {
        const users = await this.fetchApi(this.getUsersUrl);
        if (users) {

            return users

        } else {
            window.alert("No Contact")
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

    async addContact(payload) {
        const addContactResponse = await this.postApi(`${this.addContactUrl}`, payload);

        return addContactResponse;
    }

    async updateContact(payload) {
        const updateContactResponse = await this.updateApi(`this`)
    }

    async removeContact(payload) {
        const removeContactResponse = await this.removeContact(`${this.removeContactUrl}`, payload);

        return removeContactResponse;
    }

    async getMessages(contactId) {
        const messages = await this.fetchApi(`${this.getMessageUrl}/${contactId}`);
        if (messages) {
            return messages;
        } else {
            window.alert("Get Message Error")
        }
    }

    // this payload will be used when
    async getInitialPayload(contactId) {

        const initialPayload = await this.fetchApi(`${this.initialMessagingPaloadUrl}/${contactId}`);

        return initialPayload;
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

    async postApi(url, payload) {
        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();

        } catch (error) {
            window.alert("Post API Error!");
        }
    }

    async updateApi(url, payload) {
        try {
            const response = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            return await response.json();

        } catch (error) {
            window.alert(`Update API Error: ${error.toString()}`);
        }
    }

    async deleteApi(url, payload) {
        try {
            const response = await fetch(url, {
                method: "DELETE",
                body: JSON.stringify(payload)
            });

            return await response.json();

        } catch (error) {
            window.alert(`DELETE API error: ${error.toString()}`);
        }
    }

}

export default ApiService;