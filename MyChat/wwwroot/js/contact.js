   class ContactTemplate{
        constructor(){
            this.contactParentContainer = document.getElementById('contact-list-container');
            this._avatarImgPath = "./images/avatar.png"; 
            this.recipientName = document.getElementById('recepient-name');
        }

        async createContactElement(username, contactId, contactImg = this._avatarImgPath){
            // create the contact container which contain avatar and contact info
            const createdContactContainer = document.createElement('div');
            
            // call the create avatar method to create an element
            const avatar = this.createAvatarElement();
            createdContactContainer.appendChild(avatar);
            

            // create Click event for contact when it is being clicked
            // do not await for this, displaying contacs should be not awaited
            
            this.createContactClickHandler(createdContactContainer, username);
            
            // this should return the instance of the created element so that
            // click event for this will be used to other service
            // we just need its instance of the DOM
            return createdContactContainer;
        }

        createAvatarElement(contactImg = this._avatarImgPath){
            // create the div wrapper for avatar
            const createdAvatarContainer = document.createElement('div');
            const createdAvatarImgElement = document.createElement('img');
            createdAvatarImgElement.classList.add('contact-avatar');
            createdAvatarImgElement.src = contactImg;

            return createdAvatarContainer;
        }

        createContactInfoElement(contactUsername, 
                                 contactId, 
                                 recentMessage = "Recent Message Test!"){

            // create contactInfoContainer
            const createdContactInfoContainer = document.createElement('div');
            const createdContactUsernameElement = document.createElement('h6');
            const createdContactRecentMessageElement = document.createElement('p');
            
            // TODO: add class for contact Username and recent message css style
            createdContactUsernameElement.textContent = contactUsername;
            createdContactRecentMessageElement.textContent = recentMessage;

            createdContactInfoContainer.appendChild(createdContactUsernameElement);
            createdContactInfoContainer.appendChild(createdContactRecentMessageElement);
                                
            return createdContactInfoContainer;
        }

        // temporary click event handler 

        async createContactClickHandler(contactContainer, username){
            contactContainer.addEventListener('click', async () => {
                this.recipientName.textContent = username;
                // 
            })
        }
    }