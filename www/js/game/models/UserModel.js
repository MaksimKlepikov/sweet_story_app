/**
 * Created by kevrat on 26.12.2016.
 */
export default class UserModel{
    /**
     * constructor
     * @param storage - ref to localStorage
     */
    constructor(storage){
        storage.config({
            name        : 'sweet_story',
            version     : 1.0,
            description : 'user information'
        });
        this._storage = storage
        this._data = null;
        this.data = this.storageData

    }

    /**
     * Get the user from ram memory
     * @return {user} value from ram memory
     */
    get data() {
        return this._data;
    }

    /**
     * Set the user in ram memory
     * @param {user} value - user profile
     */
    set data(value) {
        this._data = value;
    }


    /**
     * Get the user profile from storage
     * @return {user} value from ram memory
     */
    get storageData() {
        return this._storage.getItem('user');
    }

    /**
     * Set the user in storage
     * @param {user} value - user profile
     */
    set storageData(value) {
        return this._storage.setItem('user', value);
    }
}