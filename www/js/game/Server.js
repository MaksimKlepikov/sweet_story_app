/**
 * Created by kevrat on 26.12.2016.
 */

export default class Server {
    /**
     * constructor
     * @param game - ref to game
     * @param url - server url
     * @param io - socket.io.js
     */
    constructor(game, url, io) {
        this.game = game
        this.url = url
        this.socket = null
        this.io = io
        this.connected = false
    }

    /**
     * set connection and return true if succesfull
     * @returns {boolean}
     */
    connect() {
        if (!this.io)
            return false
        this.socket = this.io(this.url);
        this.bindMessagesHandler()
        this.bindMessagesSenders()
        return true

    }

    /**
     * bind handlers on messages from server
     */
    bindMessagesHandler() {
        this.socket.on('connect_error', (err) => {
            console.log('connect_error: ' + err);
            this.game.userController.userInStorage.then((userInStorage) => {
                if (!userInStorage) {
                    return this.game.state.start('Login');
                }
                else {
                    // this.game.user = JSON.parse(window.localStorage.getItem('user'));
                    return this.game.userController.syncUser().then(() => this.game.state.start('MainMenu'))
                }
            });
        });
        this.socket.on('connect', () => {
            this.connected = true
        });
        this.socket.on('error', function (err) {
            console.log('error: ' + err);
        });
        this.socket.on('failed login', (err) => {
            console.log('failed login: ' + err);
            console.log(this.game.userController)

            this.game.userController.userInStorage.then((user) => {
                if (!user) {
                    this.game.state.start('Login')
                }
                else {
                    this.game.userController.syncUser().then(() => this.game.state.start('MainMenu'))
                }
            })
        });
        this.socket.on('succes login', (data) => {

            this.socket.emit('getUser', (user) => {
                if (user.progress.length === 0) {
                    let hillsJSON = this.game.cache.getJSON('hills');
                    let progress = []
                    for (let i = 0; i < hillsJSON.length; i++) {
                        progress.push({name: hillsJSON[i].name, done: 0})
                    }
                    user.progress = progress;
                    this.game.userController.updateUserInStorage(user)
                        .then(() => this.messages.updateProgress(progress))
                        .then((updateDate, err) => {
                            if (err) {
                                throw new Error(err);
                            }
                            return this.game.userController.updateDateInStorage(user.updateDate)
                        })
                        .then(() => this.game.userController.syncUser)
                        .then(() => this.game.state.start('MainMenu'))
                        .catch((err) => {
                            console.log(err);
                        })

                }
                else {
                    this.game.userController.userInStorage
                        .then((userInStorage) => {
                            if (userInStorage) {

                                if (Date.parse(userInStorage.updateDate) !== Date.parse(user.updateDate)) {
                                    if (Date.parse(userInStorage.updateDate) > Date.parse(user.updateDate)) {
                                        console.log('client have freshly data');
                                        console.log('update data on server');

                                        return this.messages.updateProgress(userInStorage.progress)
                                            .then(() => this.messages.updateBestScore(userInStorage.bestScore))
                                            .then(() => this.messages.updateLevel(userInStorage.level))
                                            .then((updateDate, err) => {
                                                if (err) {
                                                    throw new Error(err)
                                                }
                                                return this.game.userController.updateDateInStorage(updateDate)
                                            })
                                            .then(() => this.game.userController.syncUser)
                                            .catch((err) => {
                                                console.error(err)
                                            })
                                    }
                                    else {
                                        console.log('client have old data');
                                        console.log('update data on client');

                                        // return Promise.all([
                                        //     () => this.game.userController.updateDateInStorage(user.updateDate),
                                        //     () => this.game.userController.updateBestScoreInStorage(user.bestScore),
                                        //     () => this.game.userController.updateProgressInStorage(user.progress)
                                        // ])
                                        return this.game.userController.updateUserInStorage(user)
                                            .then(() => this.game.userController.syncUser)
                                    }
                                }
                                return Promise.resolve();
                            }
                            else {
                                return this.game.userController.updateUserInStorage(user)
                                    .then(() => this.game.userController.syncUser)
                            }

                        })
                        .then(() => this.game.state.start('MainMenu'))

                }

            });
        });

    }

    /**
     * bind send methods
     */
    bindMessagesSenders() {
        this.messages = {}
        this.messages.updateProgress = (progress) => {

            return new Promise((res, rej) => {
                this.socket.emit('updateProgress', progress, (updateDate, err) => {
                    if (err) throw err;
                    res(updateDate)
                });
            })
        };
        this.messages.updateLevel = (level) => {

            return new Promise((res, rej) => {
                this.socket.emit('updateLevel', level, (updateDate, err) => {
                    if (err) throw err;
                    res(updateDate)
                });
            })
        };
        this.messages.updateProgressOnHill = (progressOnHill) => {

            return new Promise((res, rej) => {
                this.socket.emit('updateProgressOnHill', progressOnHill, (updateDate, err) => {
                    if (err) throw err;
                    res(updateDate)
                });
            })
        };
        this.messages.updateBestScore = (bestScore) => {

            return new Promise((res, rej) => {
                this.socket.emit('updateBestScore', bestScore, (updateDate, err) => {
                     ;
                    if (err) throw err;
                    res(updateDate)
                });
            })
        };
        this.messages.getRecords = () => {

            return new Promise((res, rej) => {
                this.socket.emit('getRecords', (records, err) => {
                     ;
                    if (err) throw err;
                    res(records)
                });
            })
        };

    }
}