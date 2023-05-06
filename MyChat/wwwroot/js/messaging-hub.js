
class MessagingHub{

    constructor(){
        this.connection = new signalR.HubConnectionBuilder();

    }

    startHubConnection(){
        this.hubConnection.start();
    }

    stopHubConnection(){
        if(this.connection){
            this.hubConnection().stop();
        }
    }

    async addGroup(groupName){
        this.stopHubConnection();
        this.hubConnection().then(async () => {
            await this.hubConnection().invoke("JoinGroup", groupName);
        });
    }

    hubConnection(){
        return this.connection;
    }

    async sendMessage(groupName, payload){
        try {
            await this.hubConnection().invoke("SendMessageToGroup", groupName, payload);
        } catch (error) {
            window.alert(error);
        }
    }
}