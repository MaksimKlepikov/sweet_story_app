/**
 * Created by kevrat on 26.12.2016.
 */

class Server {
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
        this.connected=false
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
            if (!game.userController.userInStorage) {
                this.game.state.start('Login')
            }
            else {
                // this.game.user = JSON.parse(window.localStorage.getItem('user'));
                game.userController.syncUser()
                this.game.state.start('MainMenu');
            }
        });
        this.socket.on('connect', ()=> {
            this.connected=true
        });
        this.socket.on('error', function (err) {
            console.log('error: ' + err);
        });
        this.socket.on('failed login', (err) => {
            console.log('failed login: ' + err);
            console.log(game.userController)

            if (!game.userController.userInStorage) {
                this.game.state.start('Login')
            }
            else {
                game.userController.syncUser()
                this.game.state.start('MainMenu');
            }
        });
        this.socket.on('succes login', (data) => {
            this.socket.emit('getUser', (user) => {

                if (user.progress.length === 0) {
                    let hillsJSON = game.cache.getJSON('hills');
                    let progress = []
                    for (let i = 0; i < hillsJSON.length; i++) {
                        progress.push({name: hillsJSON[i].name, done: 0})
                    }
                    user.progress = progress
                    game.userController.userInStorage = user
                    this.messages.updateProgress(progress, (updateDate, err) => {
                        if (err) {
                            return console.log(err)
                        }
                        game.userController.updateDateInStorage(user.updateDate)
                        game.userController.syncUser()
                        this.game.state.start('MainMenu');
                    })

                }
                else {
                    if (game.userController.userInStorage) {
                        if (Date.parse(game.userController.userInStorage.updateDate) > Date.parse(user.updateDate)) {
                            console.log('update on server')
                            this.messages.updateProgress(game.userController.userInStorage.progress, (updateDate, err) => {
                                if (err) {
                                    return console.log(err)
                                }
                                game.userController.updateDateInStorage(updateDate)
                                game.userController.syncUser()
                                this.messages.updateBestScore(this.game.userController.userInStorage.bestScore, (updateDate, err) => {
                                    if (err) {
                                        return console.log(err)
                                    }
                                    this.game.userController.updateDateInStorage(updateDate)

                                    this.game.userController.user.updateDate = updateDate
                                    this.game.state.start('MainMenu');
                                })
                            })
                        }
                        else {
                            console.log('update on client')
                            game.userController.updateDateInStorage(user.updateDate)
                            game.userController.updateBestScoreInStorage(user.bestScore)
                            game.userController.updateProgressInStorage(user.progress)
                            game.userController.syncUser()
                            this.game.state.start('MainMenu');
                        }
                        //sync
                    }
                    else{
                        game.userController.userInStorage = user
                        game.userController.syncUser()
                        this.game.state.start('MainMenu');
                    }

                }

            });
        });

    }

    /**
     * bind send methods
     */
    bindMessagesSenders() {
        this.messages = {}
        this.messages.updateProgress = (progress, callback) => {
            this.socket.emit('updateProgress', progress, callback);
        };
        this.messages.updateLevel = (level, callback) => {
            this.socket.emit('updateLevel', level, callback);
        };
        this.messages.updateProgressOnHill = (progressOnHill, callback) => {
            this.socket.emit('updateProgressOnHill', progressOnHill, callback);
        };
        this.messages.updateBestScore = (bestScore, callback) => {
            this.socket.emit('updateBestScore', bestScore, callback);
        };
        this.messages.getRecords = (callback) => {
            this.socket.emit('getRecords', callback);
        };

    }
}