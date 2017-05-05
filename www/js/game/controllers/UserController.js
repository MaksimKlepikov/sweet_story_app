/**
 * Created by kevrat on 26.12.2016.
 */
export default class UserController {
    /**
     *
     * constructor
     * @param game - ref to game
     * @param model - ref to userModel
     */
    constructor(game, model) {
        this.game = game
        this._model = model

    }

    /**
     * find hill by name and increment progress on her
     * @param {string} hillName
     */
    incrementProgressOnHill(hillName) {
        for (let i = 0; i < this.user.progress.length; i++) {
            if (this.user.progress[i].name === hillName) {
                this.user.progress[i].done += 1;
                return
            }
        }
    }

    /**
     * increment user level and sync it with server
     */
    incrementLevel() {
        return this.userInStorage
            .then((userInStorage) => {
                userInStorage.level += 1;

                return this.updateUserInStorage(userInStorage)
            })
            .then(() => {
                if (this.game.server.connected) {

                    return this.userInStorage
                        .then(userInStorage => this.game.server.messages.updateLevel(userInStorage.level))
                        .then((updateDate, err) => {
                            if (err) throw err;
                            return this.updateDateInStorage(updateDate);
                        })
                        .then(() => this.syncUser())
                }
                else {

                    return this.updateDateInStorage(new Date(Date.now()).toISOString())
                        .then(() => this.syncUser)
                }
            })
            .catch(err => console.error(err))
    }

    /**
     * find hill by name and return progress on her
     * @param {string} hillName
     * @returns {number} - progress on hill
     */
    getProgressByHillName(hillName) {
        for (let i = 0; i < this.user.progress.length; i++) {
            if (this.user.progress[i].name === hillName) {
                return this.user.progress[i]
            }
        }
        return 0
    }

    /**
     * increment progress, sync with server and send isProgress signal
     * @param {string} hillName
     */
    doneTile(hillName) {
        return this.incrementProgressOnHill(hillName)
        // return this.updateUserInStorage(this.user)
        //     .then(() => this.userInStorage)
        //     .then(userInStorage => {
        //         if (this.game.server.connected) {
        //             return this.game.server.messages.updateProgress(userInStorage.progress)
        //                 .then((updateDate, err) => {
        //
        //                     if (err) throw err;
        //                     return this.updateDateInStorage(updateDate)
        //                 })
        //                 .then(() => this.syncUser)
        //                 .catch(err => console.error(err))
        //         }
        //         else {
        //
        //             return this.updateDateInStorage(new Date(Date.now()).toISOString())
        //                 .then(() => this.syncUser)
        //         }
        //     })
        //     .then(() => {
        //         this.game.signals.isProgress.dispatch(hillName, this.getProgressByHillName(hillName).done)
        //     })
    }

    updateProgress(progress = this.user.progress) {
        return this.updateProgressInStorage(progress)
            .then(() => this.userInStorage)
            .then(userInStorage => {
                if (this.game.server.connected) {
                    return this.game.server.messages.updateProgress(userInStorage.progress)
                        .then((updateDate, err) => {

                            if (err) throw err;
                            return this.updateDateInStorage(updateDate)
                        })
                        .then(() => this.syncUser)
                        .catch(err => console.error(err))
                }
                else {

                    return this.updateDateInStorage(new Date(Date.now()).toISOString())
                        .then(() => this.syncUser)
                }
            })
    }

    /**
     * update user progress in storage
     * @param progress - new progress
     */
    updateProgressInStorage(progress) {
        return this.userInStorage.then((user) => {
            user.progress = progress;
            return this.updateUserInStorage(user);
        })
    }

    /**
     * update date last update in storage
     * @param updateDate - new update date
     */
    updateDateInStorage(updateDate) {
        return this._model._storage.getItem('user').then((user) => {

            user.updateDate = updateDate;
            return this.updateUserInStorage(user, false)
        })
    }

    /**
     * update user record in storage and sync it with server
     * @param {number} bestScore - new record
     */
    updateBestScoreInStorage(bestScore) {
        this.userInStorage
            .then((user) => {
                user.bestScore = bestScore;
                return this.updateUserInStorage(user);
            })
            .then(() => {
                if (this.game.server.connected) {

                    return this.userInStorage
                        .then((userInStorage) => this.game.server.messages.updateBestScore(userInStorage.bestScore))
                        .then((updateDate, err) => {
                            if (err) throw new Error(err)
                            this.updateDateInStorage(updateDate)
                        });
                }
            })
            .catch(err => console.error(err))
    }

    /**
     * sync read in ram user from storage
     */
    syncUser() {
        return this.userInStorage.then(userInStorage => this.user = userInStorage)
    }

    /**
     * Get the user in storage
     * @returns {user}
     */
    get userInStorage() {
        return this._model.storageData
    }

    /**
     * Set user in storage
     * @param {user} value - new user profile
     */
    set userInStorage(value) {

        return this._model.storageData = value;
    }

    /**
     * Get the user from ram
     */
    get user() {
        return this._model.data
    }

    updateUserInStorage(user, isUpdateDate = true) {
        if (isUpdateDate)
            user.updateDate = new Date(Date.now()).toISOString()
        return this._model._storage.setItem('user', user);
    }

    //noinspection JSAnnotator
    /**
     * Set the user in ram
     * @param {user} value - new user profile
     */
    set user(value) {
        this._model.data = value;
    }
}