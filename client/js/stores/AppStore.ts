import {action, observable} from 'mobx';

export class ApplicationStore {
    @observable name = "App";

    @action
    updateName = (name: string) => {
        this.name = name;
    }
}

export var AppStoreInstance = new ApplicationStore();