import ApiService from './api.js';
import ScreenDisplayService from "./ScreenDisplayService.js";

export default class ContactTemplate {
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

    async runContactService() {

        const contacts = await this.getContacts()

        this.displayContacts(contacts);

        // run search handler here
        this.runSearchConvoContactHandler();
        this.runRefreshContactHandler();
    }

    async getContacts() {
        this.removeExistingContacts();

        const contactResponse = await this.apiService.getContacts();
        this.contactList.length = 0;

        if (contactResponse.length > 0) this.contactList = contactResponse;

        return this.contactList;
    }

    runRefreshContactHandler() {
        this.refreshContactListBtn.addEventListener("click", async () => {
            const contacts = await this.getContacts();
            this.displayContacts(contacts)
            this.searchContactConvo.value = "";
        });
    }

    displayContacts(contacts) {
        this.removeExistingContacts();
        contacts.forEach(({ contactUsername, contactId }) => {
            console.log("Creating an element")
            const createdElement = this.createContactElement(contactUsername, contactId);
            this.createShowMessageHandler(createdElement, contactId);
        })
    }

    createShowMessageHandler(contactShowMesssageHandler, contactId) {
        contactShowMesssageHandler.addEventListener('click', () => {

            this.apiService.getMessages(contactId).then((messages) => {
                if (messages) {
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

    deleteHandler(contactId, elementId) {
        console.log("This is the event handler to delete contact from the list.");
    }

    createIconElement(iconPath) {
        const iconElement = document.createElement('img');
        iconElement.src = iconPath;
        iconElement.classList.add("icon-default-size");

        return iconElement;
    }

    createContainerElement(childElement) {

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

    runSearchConvoContactHandler() {
        this.searchContactConvo.addEventListener('input', (e) => {
            if (e.target.value != null || e.target.value != "") {
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

    removeExistingContacts() {
        if (this.contactParentContainer.children.length == 0) return;

        let childement = this.contactParentContainer.lastElementChild;

        while (childement) {
            this.contactParentContainer.removeChild(childement)
            childement = this.contactParentContainer.lastElementChild;
        }
        return this.contactParentContainer;
    }
}