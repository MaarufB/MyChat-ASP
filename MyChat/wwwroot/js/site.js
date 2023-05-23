$(document).ready(function() {

    class ContactModalTemplate {
        constructor() {
            this.apiService = new ApiService();
            this.contactModalBody = document.getElementById("contact-modal-body");
            this.searchContactTextbox = document.getElementById("search-contact-modal");
            this.loadContactButton = document.getElementById("refresh-users-list");
            this.contactLists = [];
        }

        async runContactModal() {

            this.removeExistingMessages();

            this.contactLists.length = 0;

            const usersResponse = await this.apiService.getUsers();

            if (usersResponse) this.contactLists = usersResponse;

            if (this.contactLists.length > 0) {
                this.displayUsers(this.contactLists);
            }

            this.runSearchHandler();
        }

        runSearchHandler() {
            this.searchContactTextbox.addEventListener('input', (e) => {
                if (e.target.value != null || e.target.value != "") {
                    const filterResult = this.searchUsers(e.target.value);
                    this.displayUsers(filterResult);
                    return;
                }
            });
        }

        searchUsers(keyword) {
            const filteredResults = this.contactLists.filter((users) => {
                const results = users.contactUsername.toLowerCase();
                return results.includes(keyword.toLowerCase());
            })

            return filteredResults;
        }

        createElement(htmlTag, classList) {
            let newHtmlTag = document.createElement(htmlTag);
            if (classList) {
                for (const item of classList) {
                    newHtmlTag.classList.add(item);
                }
            }
            return newHtmlTag;
        }

        displayUsers(users) {
            this.removeExistingMessages();

            users.forEach(user => {
                this.createUserElements(user)
            })
        }


        createUserElements(user) {
            // this.contactLists.push(user);

            const contactContainerClassList = ["modal-contact-container", "m-3", "p-3", "border", "d-flex", "justify-content-between", "align-items-center", "flex-wrap"]

            const creatededContactContainer = this.createElement("div", contactContainerClassList);

            const contactUsernameClassList = ["contact-username"];
            const createdContactUsernameElement = this.createElement("h6", contactUsernameClassList);

            createdContactUsernameElement.textContent = user.contactUsername;

            const contactButtonClassList = ["btn", "btn-primary"];
            const createdAddContactButton = this.createElement("button", contactButtonClassList);

            createdAddContactButton.textContent = "CONNECT";

            if (user.onContactList) {
                createdAddContactButton.textContent = "CONNECTED";
                createdAddContactButton.classList = "btn";
                createdAddContactButton.style.backgroundColor = "#DCE1ED";
            }

            createdAddContactButton.addEventListener('click', async () => {

                const addContactPayload = {
                    Id: null,
                    CurrentUserId: user.currentUserId,
                    CurrentUsername: user.currentUsername,
                    ContactId: user.contactId,
                    ContactUsername: user.contactUsername,
                    OnContactList: user.onContactList
                };

                if (!user.onContactList) {
                    this.apiService.addContact(addContactPayload).then(({ onContactList }) => {
                        if (onContactList) {
                            createdAddContactButton.textContent = "CONNECTED";
                            createdAddContactButton.classList = "btn";
                            createdAddContactButton.style.backgroundColor = "#DCE1ED";
                        }
                    });
                }

            });

            creatededContactContainer.appendChild(createdContactUsernameElement);
            creatededContactContainer.appendChild(createdAddContactButton);
            this.contactModalBody.appendChild(creatededContactContainer);
        }

        removeExistingMessages() {
            if (this.contactModalBody.children.length == 0) return;

            let childement = this.contactModalBody.lastElementChild;

            while (childement) {
                this.contactModalBody.removeChild(childement)
                childement = this.contactModalBody.lastElementChild;
            }
            return this.contactModalBody;
        }
    }


    class GroupNameModel {
        constructor() {
            this.groupName = null;
        }

        updateGroupNameModel(groupName) {
            if (groupName) {
                this.groupName = groupName;
            }

            // TODO: handle error here!
            // Throw an exception

            return this.groupName;
        }

        getGroupName() {
            return this.groupName;
        }
    }

    class MessagePayloadModel {
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

    class MessagingHubService {

        constructor(groupNameModel, messagePayloadModel) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/chatHub")
                .build();

            this.sendButton = document.getElementById('send-message');
            this.messageInput = document.getElementById('message-input');
            this.apiService = new ApiService();
            this.groupNameModel = groupNameModel;
            this.messagePayloadModel = messagePayloadModel;

            this.messageParentContainer = document.getElementById('message-thread-container');
            this.recipientName = document.getElementById('recepient-name');
        }

        async startSendMessageHandler() {
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

            return this.sendButton;
        }

        async createHubConnection(groupName) {

            await this.stopHubConnection();

            this.connection.start().then(async () => {
                await this.connection.invoke("JoinGroup", groupName)
            });

        }

        async startIncomingMessageHandler() {
            this.connection.on("ReceiveMessage", async (message) => {
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
            });
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

    class ContactTemplate {
        constructor(messageTemplate, groupNameModel, messagePayloadModel, messageHubService) {
            this.contactParentContainer = document.getElementById('contact-list-container');
            this._avatarImgPath = "/images/avatar-2.jpg";
            this.recipientName = document.getElementById('recepient-name');
            this.apiService = new ApiService();
            this.searchContactConvo = document.getElementById("search-contact-convo");
            this.contactList = [];
            this.messageTemplate = messageTemplate;
            this.groupNameModel = groupNameModel;
            this.messagePayloadModel = messagePayloadModel;
            this.messageHubService = messageHubService;
        }
    
        async runContactService(){
            this.removeExistingContacts();

            const contactResponse = await this.apiService.getContacts();
            this.contactList.length = 0;
    
            if(contactResponse.length > 0 ) this.contactList = contactResponse;
    
            this.displayContacts(this.contactList);

            // run search handler here
            this.runSearchConvoContactHandler();
        }
    
        displayContacts(contacts){
            this.removeExistingContacts();
            contacts.forEach(({contactUsername, contactId}) => {
                console.log("Creating an element")
                const createdElement = this.createContactElement(contactUsername, contactId);
                this.createShowMessageHandler(createdElement, contactId);
            })
        }
    
        createShowMessageHandler(contactShowMesssageHandler, contactId){
            contactShowMesssageHandler.addEventListener('click', () => {
                
                this.apiService.getMessages(contactId).then((messages) =>{
                    if(messages){
                        this.messageTemplate.removeExistingMessages();
                        messages.forEach((message) => this.messageTemplate.createMessageTemplate(message));
                    }
                });
    
                this.apiService.getInitialPayload(contactId).then((initialPayLoadResponse) => {
                    this.messagePayloadModel.updatePayload(initialPayLoadResponse);
                })
    
                this.apiService.getGroupName(contactId)
                .then(({ groupName }) => {
                    this.groupNameModel.updateGroupNameModel(groupName);
                    this.messageHubService.createHubConnection(groupName);
                })
            })
        }
    
        createContactElement(username, contactId, contactImg = this._avatarImgPath) {
            const createdContactContainer = document.createElement('div');
            createdContactContainer.classList.add("contact-container", "border");
            createdContactContainer.setAttribute('id', `contact-${contactId}`);
    
            const avatar = this.createAvatarElement(this._avatarImgPath);
            createdContactContainer.appendChild(avatar);
    
            const createdContactInfoContainer = this.createContactInfoElement(username, contactId);
            createdContactContainer.appendChild(createdContactInfoContainer);
    
            this.contactParentContainer.appendChild(createdContactContainer);
            this.changeRecipientNameHandler(createdContactContainer, username);
    
            return createdContactContainer;
        }
    
        createAvatarElement(contactImg) {
            const createdAvatarContainer = document.createElement('div');
            const createdAvatarImgElement = document.createElement('img');
    
            createdAvatarContainer.classList.add("contact-info-avatar-container");
            createdAvatarImgElement.src = contactImg;
            createdAvatarImgElement.classList.add('avatar-img');
    
            createdAvatarContainer.appendChild(createdAvatarImgElement);
    
            return createdAvatarContainer;
        }
    
        createContactInfoElement(contactUsername,
            contactId,
            recentMessage = "Recent Message Test!") {
    
            const createdContactInfoContainer = document.createElement('div');
            const createdContactUsernameElement = document.createElement('h5');
    
            createdContactInfoContainer.classList.add("contact-info-container");
            createdContactUsernameElement.textContent = contactUsername;
    
            createdContactInfoContainer.appendChild(createdContactUsernameElement);
    
            return createdContactInfoContainer;
        }
    
        async changeRecipientNameHandler(contactContainer, username) {
            contactContainer.addEventListener('click', async () => {
                this.recipientName.textContent = username;
            })
        }
    
        runSearchConvoContactHandler(){
            this.searchContactConvo.addEventListener('input', (e) => {
                if(e.target.value != null || e.target.value != ""){
                    const filteredContact = this.searchContact(e.target.value);
                    this.displayContacts(filteredContact);
                    return;
                }
            })
        }

        searchContact(keyword) {
            const filteredResults = this.contactList.filter((contact) => {
                const results = contact.contactUsername.toLowerCase();
                return results.includes(keyword.toLowerCase());
            })

            return filteredResults;
        }
        
        removeExistingContacts(){
            if (this.contactParentContainer.children.length == 0) return;

            let childement = this.contactParentContainer.lastElementChild;

            while (childement) {
                this.contactParentContainer.removeChild(childement)
                childement = this.contactParentContainer.lastElementChild;
            }
            return this.contactParentContainer;
        }
    }

    class MessageTemplate {
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

    class ScreenDisplayService {
        constructor() {
            this.leftContainer = document.getElementById('left-container');
            this.rightContainer = document.getElementById('right-container');
            this.closeMessageContainer = document.getElementById('close-message');
        }

        runToggle() {

            if (window.innerWidth < 700) {
                jQuery.fx.off = true;

                $('#left-container').toggle('hide-element');
                $('#right-container').toggle('hide-element');
            }
        }

        hideContactContainer() {
            if (window.innerWidth < 700) {
                jQuery.fx.off = true;
                $('#left-container').toggle('hide-element');
                $('#right-container').toggle('hide-element');
            }
        }

        hideMessageContainer() {
            if (window.innerWidth < 700) {
                $('#left-container').toggle('hide-element');
                $('#right-container').toggle('hide-element');
            }
        }

        runScreenSizeHandler() {
            window.onresize = () => {
                if (window.innerWidth > 700) {
                    let isLeftHidden = $("#left-container").hasClass("hide-element");

                    if (isLeftHidden) {
                        $("#left-container").removeClass("hide-element");
                    }

                    let isRightHidden = $("#right-container").hasClass("hide-element");

                    if (isRightHidden) {
                        $("#right-container").removeClass("hide-element");
                    }

                }
            }
        }
    }

    const mainApp = async () => {

        const screenDisplay = new ScreenDisplayService();
        const groupNameModel = new GroupNameModel();
        const messagePayloadModel = new MessagePayloadModel();
        const messageTemplate = new MessageTemplate();
        const messageHubService = new MessagingHubService(groupNameModel, messagePayloadModel);
        const contactTemplate = new ContactTemplate(messageTemplate, 
                                                    groupNameModel, 
                                                    messagePayloadModel, 
                                                    messageHubService);
 
        contactTemplate.runContactService();

        screenDisplay.runScreenSizeHandler();

        await messageHubService.startSendMessageHandler()
        await messageHubService.startIncomingMessageHandler()

        const contactModalTemplate = new ContactModalTemplate();

        $("#modal-button").click(async () => {
            await contactModalTemplate.runContactModal();
        });

        $("#close-message").click(() => {
            $('#left-container').toggle('hide-element');
            $('#right-container').toggle('hide-element');
            document.location.reload(true);
            console.log("Reloading:")
        });

        $("#close-modal").click(function () {
            document.location.reload();
        })
    }

    mainApp();
});