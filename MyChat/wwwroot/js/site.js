import ContactModalTemplate from "./contact.js";
import GroupNameModel from "./GroupNameModel.js";
import MessagePayloadModel from "./MessagePayloadModel.js";
import MessagingHubService from "./MessagingHubService.js";
import ContactTemplate from "./ContactTemplate.js";
import MessageTemplate from "./MessageTemplate.js";
import ScreenDisplayService from "./ScreenDisplayService.js";

$(document).ready(function () {


    // Notification Service
    // TODO: To be implemented
    class NotificationHub {
        constructor() {
            // build the notification hub here
            // include the listener for each instance
            this.connection = "test";
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