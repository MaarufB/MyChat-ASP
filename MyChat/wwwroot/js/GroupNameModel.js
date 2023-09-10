

export default class GroupNameModel {
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