/**
 * Created by kevrat on 26.12.2016.
 */
class UserController {
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
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.level += 1
        this._model._storage.setItem('user', JSON.stringify(user));
        if (this.game.server.connected) {
            this.game.server.messages.updateLevel(this.userInStorage.level, (updateDate, err) => {
                if (err) {
                    return console.log(err)
                }
                this.updateDateInStorage(updateDate)

                this.user.updateDate = updateDate
            })
        }
        else {
            this.updateDateInStorage(new Date(Date.now()).toISOString())
            this.syncUser()
        }
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
        this.incrementProgressOnHill(hillName)
        this.userInStorage = this.user
        if (this.game.server.connected) {
            this.game.server.messages.updateProgress(this.userInStorage.progress, (updateDate, err) => {
                if (err) {
                    return console.log(err)
                }
                this.updateDateInStorage(updateDate)

                this.user.updateDate = updateDate
            })

        }
        else {
            this.updateDateInStorage(new Date(Date.now()).toISOString())
            this.syncUser()
        }
        this.game.signals.isProgress.dispatch(hillName, this.getProgressByHillName(hillName).done)
    }

    /**
     * update user progress in storage
     * @param progress - new progress
     */
    updateProgressInStorage(progress) {
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.progress = progress
        this._model._storage.setItem('user', JSON.stringify(user));
    }

    /**
     * update date last update in storage
     * @param updateDate - new update date
     */
    updateDateInStorage(updateDate) {
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.updateDate = updateDate
        this._model._storage.setItem('user', JSON.stringify(user));
    }

    /**
     * update user record in storage and sync it with server
     * @param {number} bestScore - new record
     */
    updateBestScoreInStorage(bestScore) {
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.bestScore = bestScore
        this._model._storage.setItem('user', JSON.stringify(user));
        if (this.game.server.connected) {
            this.game.server.messages.updateBestScore(this.userInStorage.bestScore, (updateDate, err) => {
                if (err) {
                    return console.log(err)
                }
                this.updateDateInStorage(updateDate)

                this.user.updateDate = updateDate
            })
        }
        else {
            this.updateDateInStorage(new Date(Date.now()).toISOString())
            this.syncUser()
        }
    }

    /**
     * sync read in ram user from storage
     */
    syncUser() {
        this.user = this.userInStorage
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
        this._model.storageData = value;
    }

    /**
     * Get the user from ram
     */
    get user() {
        return this._model.data
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