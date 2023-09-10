
export default class ScreenDisplayService {

    constructor() {
        this.leftContainer = document.getElementById('left-container');
        this.rightContainer = document.getElementById('right-container');
        this.closeMessageContainer = document.getElementById('close-message');
        this.testSize = document.getElementById("test-size");
        this.isMessageView = false;
    }

    screenViewStatus() {
        return this.isMessageView;
    }

    setMessageViewStatus(status) {
        this.isMessageView = status
    }

    screenDisplay() {
        this.isMessageView = true;

        if (window.innerWidth <= 575) {
            this.leftContainer.classList.add("hide-element");
            this.rightContainer.classList.remove("hide-element");
        }

        if (window.innerWidth > 575) {
            this.leftContainer.classList.remove("hide-element");
            this.rightContainer.classList.remove("hide-element");
        }

    }

    runScreenSizeHandler() {

        window.onresize = () => {
            if (window.innerWidth > 575) {

                let isLeftHidden = this.leftContainer.classList.contains("hide-element");
                let isRightHidden = this.rightContainer.classList.contains("hide-element");

                if (isLeftHidden) {
                    this.leftContainer.classList.remove("hide-element");
                }

                if (isRightHidden) {
                    this.rightContainer.classList.remove("hide-element");
                }
            }

            if (window.innerWidth <= 575) {
                let isMessageHidde = this.rightContainer.classList.contains("hide-element");
                let isLeftHidden = this.leftContainer.classList.contains("hide-element");

                if (isLeftHidden) {
                    this.rightContainer.classList.remove("hide-element");
                }

                if (!isLeftHidden && !isMessageHidde) {
                    this.rightContainer.classList.add("hide-element");
                }
            }
        }


        if (window.innerWidth < 575) {
            this.rightContainer.classList.add("hide-element");
        }
    }

}