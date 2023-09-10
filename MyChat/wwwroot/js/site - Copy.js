$(document).ready(function() {

    // ContactModalTemplate
    class ContactModalTemplate {
        constructor() {
            this.apiService = new ApiService();
            this.contactModalBody = document.getElementById("contact-modal-body");
            this.searchContactTextbox = document.getElementById("search-contact-modal");
            this.loadContactButton = document.getElementById("refresh-users-list");
            this.refrestModalList = document.getElementById("refresh-modal-list");
            this.contactLists = [];

            this.iconContact = "/images/icons/icon-user.png";
            this.iconStatusDefault = "/images/icons/icon-add.png";
            this.iconStatusSuccess = "/images/icons/icon-success.png";
        }

        async runContactModal() {

            const users = await this.getUsers();

            if (users.length > 0) {
                this.displayUsers(users);
            }

            this.runSearchHandler();
            this.runModalRefreshHandler();
        }

        async getUsers(){
            this.removeExistingMessages();

            this.contactLists.length = 0;

            const usersResponse = await this.apiService.getUsers();

            if (usersResponse) this.contactLists = usersResponse;
            
            return this.contactLists;
        }
        
        runModalRefreshHandler(){

            this.refrestModalList.addEventListener('click', async () => {
                const users = await this.getUsers();

                if(users.length > 0) {

                    this.displayUsers(users);
                }

                this.searchContactTextbox.value = "";
            })
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
            });

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

        createIconImage(filePath, classList){
            const elem = document.createElement("img");

            if(filePath){
                elem.src = filePath;
            }

            if(classList){
                classList.forEach((item) => {
                    elem.classList.add(item);
                });
            }

            return elem;
        }

        createUserElements(user) {
            const contactContainerClassList = ["modal-contact-container"]
            const createdContactContainer = this.createElement("div", contactContainerClassList);
            
            const iconUserClass = ["icon-default-size"];
            const iconUser = this.createIconImage(this.iconContact, iconUserClass);
            
            const contactUsernameClassList = ["modal-contact-username"];
            const createdContactUsernameElement = this.createElement("p", contactUsernameClassList);
            createdContactUsernameElement.textContent = user.contactUsername;

            const contactButtonClassList = ["icon-default-size", "add-contact-button", "contact-add-default"];
            const createdAddContactButton = this.createElement("button", contactButtonClassList);

            if (user.onContactList) {
                createdAddContactButton.classList.remove("contact-add-default")
                createdAddContactButton.classList.add("contact-add-success");
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
                    this.apiService.addContact(addContactPayload)
                                    .then(({ onContactList, contactId }) => {
                        if(onContactList) {
                            createdAddContactButton.classList.remove("contact-add-default");
                            createdAddContactButton.classList.add("contact-add-success");
                        }
                    });
                }

            });

            createdContactContainer.appendChild(iconUser);
            createdContactContainer.appendChild(createdContactUsernameElement);
            createdContactContainer.appendChild(createdAddContactButton);
        
            this.contactModalBody.appendChild(createdContactContainer);
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

    // Group Name Model
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

    // MessagePayloadModel
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

    // Notification Service

    class NotificationHub {
        constructor() {
            // build the notification hub here
            // include the listener for each instance
            this.connection = "test";
        }
    }

    // MessagingHubService
    class MessagingHubService {

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

        async clickSendMessageHandler(){
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

        async pressEnterSendMessageHandler(){
            this.messageInput.addEventListener("keydown", async (event) =>{
                let payload = this.messagePayloadModel.getUpdatedMessagePayload();
                const groupName = this.groupNameModel.getGroupName();

                if(event.key === "Enter"){
                    if (this.messageInput.value == null ||
                        this.messageInput.value == "" ||
                        this.recipientName.textContent == "" ||
                        this.recipientName.textContent == null) {
    
                        return;
                    }
    
                    payload.MessageContent = this.messageInput.value;
    
                    await this.connection.invoke("SendMessageToGroup", groupName, payload);
    
                    this.messageInput.value = "";
                } else if(event.key === "Enter" && event.shiftKey) {
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

    // ContactTemplate
    class ContactTemplate {
        constructor(messageTemplate, groupNameModel, messagePayloadModel, messageHubService) {
            this.contactParentContainer = document.getElementById('contact-list-container');
            this._avatarImgPath = "/images/avatar-2.jpg";
            this.recipientName = document.getElementById('recepient-name');
            this.apiService = new ApiService();
            this.searchContactConvo = document.getElementById("search-contact-convo");
            this.refreshContactListBtn = document.getElementById("refresh-contact-list");
            this.contactList = [];
            this.messageTemplate = messageTemplate;
            this.groupNameModel = groupNameModel;
            this.messagePayloadModel = messagePayloadModel;
            this.messageHubService = messageHubService;
            this.iconDelete = "/images/icons/icon-delete.png";
            this.iconMessage = "/images/icons/icon-message-contact.png";
            this.screenDisplayService = new ScreenDisplayService()
        }
    
        async runContactService(){
            
            const contacts = await this.getContacts()
    
            this.displayContacts(contacts);

            // run search handler here
            this.runSearchConvoContactHandler();
            this.runRefreshContactHandler();
        }

        async getContacts(){
            this.removeExistingContacts();

            const contactResponse = await this.apiService.getContacts();
            this.contactList.length = 0;
    
            if(contactResponse.length > 0 ) this.contactList = contactResponse;

            return this.contactList;
        }

        runRefreshContactHandler(){
            this.refreshContactListBtn.addEventListener("click", async () => {
                const contacts = await this.getContacts();
                this.displayContacts(contacts)
                this.searchContactConvo.value = "";
            });
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
                
                this.screenDisplayService.screenDisplay();
            })
        }
        
        deleteHandler(contactId, elementId){
            console.log("This is the event handler to delete contact from the list.");
        }

        createIconElement(iconPath){
            const iconElement = document.createElement('img');
            iconElement.src = iconPath;
            iconElement.classList.add("icon-default-size");

            return iconElement;
        }

        createContainerElement(childElement){
            
        }
        
        createContactElement(username, contactId, contactImg = this._avatarImgPath) {
            const createdContactContainer = document.createElement('div');
            createdContactContainer.classList.add("contact-container");
            createdContactContainer.setAttribute('id', `contact-${contactId}`);
    
            // Change this to message
            // const avatar = this.createAvatarElement(this._avatarImgPath);
            // createdContactContainer.appendChild(avatar);
            // create message icon element
            const messageIconElement = this.createIconElement(this.iconMessage);
            messageIconElement.classList.add("icon-default-size");
            createdContactContainer.appendChild(messageIconElement);
            // create delete icon
            const deleteIconElement = this.createIconElement(this.iconDelete);
            deleteIconElement.classList.add("icon-delete");


            // const createdContactInfoContainer = this.createContactInfoElement(username, contactId);

            // createdContactContainer.appendChild(createdContactInfoContainer);

            const contactUsernameElement = document.createElement('p');
            contactUsernameElement.textContent = username;

            createdContactContainer.appendChild(contactUsernameElement);
            createdContactContainer.appendChild(deleteIconElement);    

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
            const createdContactUsernameElement = document.createElement('p');
    
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

    //MessageTemplate
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

    // ApiService
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


    class ActivityDetector {
        #action = {
            VIEW_MESSAGE: "VIEW_MESSAGE",
            SCREEN_ADJUSTMENT: "SCREEN_ADJUSTMENT"
        };

        constructor(){

        }
    }
    // ScreenDisplayService
    class ScreenDisplayService {
        
        constructor() {
            this.leftContainer = document.getElementById('left-container');
            this.rightContainer = document.getElementById('right-container');
            this.closeMessageContainer = document.getElementById('close-message');
            this.testSize = document.getElementById("test-size");
            this.isMessageView = false;
        }

        screenViewStatus(){
            return this.isMessageView;
        }

        setMessageViewStatus(status){
            this.isMessageView = status
        }

        screenDisplay(){
            this.isMessageView = true;
            
            if(window.innerWidth <= 575){
                this.leftContainer.classList.add("hide-element");
                this.rightContainer.classList.remove("hide-element");
            }

            if(window.innerWidth > 575){
                this.leftContainer.classList.remove("hide-element");
                this.rightContainer.classList.remove("hide-element");
            }

        }

        runScreenSizeHandler() {

            window.onresize = () => {
                if (window.innerWidth > 575) {
                    
                    let isLeftHidden = this.leftContainer.classList.contains("hide-element");
                    let isRightHidden = this.rightContainer.classList.contains("hide-element");

                    if(isLeftHidden){
                        this.leftContainer.classList.remove("hide-element");
                    }
                    
                    if(isRightHidden){
                        this.rightContainer.classList.remove("hide-element");
                    }
                }

                if(window.innerWidth <= 575){
                    let isMessageHidde = this.rightContainer.classList.contains("hide-element");
                    let isLeftHidden = this.leftContainer.classList.contains("hide-element");

                    if(isLeftHidden){
                        this.rightContainer.classList.remove("hide-element");
                    }

                    if(!isLeftHidden && !isMessageHidde){
                        this.rightContainer.classList.add("hide-element");
                    }
                }
            }


            if(window.innerWidth < 575){
                this.rightContainer.classList.add("hide-element");
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
        //await messageHubService.startIncomingMessageHandler()

        const contactModalTemplate = new ContactModalTemplate();

        $("#modal-button").click(async () => {
            await contactModalTemplate.runContactModal();
        });

        $("#close-message").click(() => {
            screenDisplay.setMessageViewStatus(false);
            document.location.reload(true);
        });

        $("#close-modal").click(function () {
            document.location.reload();
        })
    }

    mainApp();

});