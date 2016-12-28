/**
 * Created by kevrat on 02.12.2016.
 */

window.onload = function () {
    game.state.add('Boot', Boot);
    game.state.start('Boot');
}