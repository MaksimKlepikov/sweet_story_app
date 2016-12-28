/**
 * Created by kevrat on 26.12.2016.
 */
game.messages = {}
game.messages.addCafe = function (name) {
    game.server.socket.emit('addCafe', name);
};
game.messages.exitFromAccount = function () {
    game.server.socket.emit('logout');
    game.server.socket.disconnect();
};
game.messages.bind = function(){
    game.server.socket.on('connect_error', function(err){
        console.log('connect_error: ' + err);
    });
    game.server.socket.on('error', function(err) {

        console.log('error: ' + err);
    });
    game.server.socket.on('failed login', function(err){
        console.log('failed login: ' + err);
        game.state.start('Authorization')
    });
    game.server.socket.on('succes login', function(data) {
        console.log('succes login: ' + data);
        game.state.start('SelectionCafe');
        game.server.socket.emit('getUser', function(user){
            game.user = user;
            window.localStorage.setItem('user', JSON.stringify(user));
        });
    });

}