import ApiService from '../api.js';
import { icons, payload } from "../helpers.js";
import { constantElements, constantClass as cssClass} from "./constant.js";


class ContactModalTemplate {
    constructor() {
        this.apiService = new ApiService();

        this.contactModalBody = document.getElementById(constantElements.contactModalBody);
        this.searchContactTextbox = document.getElementById(constantElements.searchContactTextbox);
        this.loadContactButton = document.getElementById(constantElements.loadContactButton);
        this.refrestModalList = document.getElementById(constantElements.refrestModalList);

        this.contactLists = [];
        this.iconContact = icons.contact.contactIcon;
        this.iconStatusDefault = icons.contact.statusDefault;
        this.iconStatusSuccess = icons.contact.statusSuccess;
    }

    async runContactModal() {

        const users = await this.getUsers();

        if (users.length > 0) {
            this.displayUsers(users);
        }

        this.runSearchHandler();
        this.runModalRefreshHandler();
    }

    async getUsers() {
        this.removeExistingMessages();

        this.contactLists.length = 0;

        const usersResponse = await this.apiService.getUsers();

        if (usersResponse) this.contactLists = usersResponse;

        return this.contactLists;
    }

    runModalRefreshHandler() {

        this.refrestModalList.addEventListener('click', async () => {
            const users = await this.getUsers();

            if (users.length > 0) {

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

    createIconImage(filePath, classList) {
        const elem = document.createElement("img");

        if (filePath) {
            elem.src = filePath;
        }

        if (classList) {
            classList.forEach((item) => {
                elem.classList.add(item);
            });
        }

        return elem;
    }

    createUserElements(user) {

        const createdContactContainer = this.createElement("div", cssClass.contactContainer);
        const iconUser = this.createIconImage(this.iconContact, [cssClass.iconDefaultSize]);
        const createdContactUsernameElement = this.createElement("p", cssClass.contactUsername);
        createdContactUsernameElement.textContent = user.contactUsername;

        const createdAddContactButton = this.createElement("button", cssClass.contactButton);

        if (user.onContactList) {
            createdAddContactButton.classList.remove(cssClass.contactAddDefault)
            createdAddContactButton.classList.add(cssClass.contactAddSuccess);
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

            // TODO
            //const addContactPayload = { ...payload.contact };
            

            if (!user.onContactList) {
                this.apiService.addContact(addContactPayload)
                    .then(({ onContactList, contactId }) => {
                        if (onContactList) {
                            createdAddContactButton.classList.remove(cssClass.contactAddDefault);
                            createdAddContactButton.classList.add(cssClass.contactAddSuccess);
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

export default ContactModalTemplate;