/**
 * Created by kevrat on 26.12.2016.
 */
class UserController {
    constructor(game, model) {
        this.game = game
        this._model = model

    }

    incrementProgressOnHill(hillName) {
        for (let i = 0; i < this.user.progress.length; i++) {
            if (this.user.progress[i].name === hillName) {
                this.user.progress[i].done += 1;
                return
            }
        }
    }

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

    getProgressByHillName(hillName) {
        for (let i = 0; i < this.user.progress.length; i++) {
            if (this.user.progress[i].name === hillName) {
                return this.user.progress[i]
            }
        }
        return 0
    }

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

    updateProgressInStorage(progress) {
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.progress = progress
        this._model._storage.setItem('user', JSON.stringify(user));
    }

    updateDateInStorage(updateDate) {
        let user = JSON.parse(this._model._storage.getItem('user'))
        user.updateDate = updateDate
        this._model._storage.setItem('user', JSON.stringify(user));
    }

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

    syncUser() {
        this.user = this.userInStorage
    }

    get userInStorage() {
        return this._model.storageData
    }

    set userInStorage(value) {
        this._model.storageData = value;
    }

    get user() {
        return this._model.data
    }

    set user(value) {
        this._model.data = value;
    }
}