import ApiService from './api.js';

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
                        if (onContactList) {
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

export default ContactModalTemplate;