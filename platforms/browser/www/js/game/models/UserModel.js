/**
 * Created by kevrat on 26.12.2016.
 */
class UserModel{
    constructor(storage){
        this._storage = storage
        this._data = null;
        this.data = this.storageData

    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }

    get storageData() {
        return JSON.parse(this._storage.getItem('user'));
    }

    set storageData(value) {
        this._storage.setItem('user', JSON.stringify(value));
    }
}