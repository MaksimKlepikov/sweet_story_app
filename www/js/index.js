/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {Boot, Device} from './game/states/Boot'
// var app = {
//     // Application Constructor
//     initialize: function () {
//         document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
//     },
//     onDeviceReady: function () {
//         this.receivedEvent('deviceready');
//
//         class Game extends Phaser.Game {
//
//             constructor() {
//                 super('100%', '100%', Phaser.WEBGL, 'sweetstory', null, true, false);
//                 this.state.add('Boot', Boot, false);
//                 this.state.start('Boot');
//                 this.user = {};
//                 // if (this.device.desktop) {
//                 //     BasicGame.screen = "large";
//                 //     BasicGame.gameWidth = 720;
//                 // }
//                 // BasicGame.gameHeight = BasicGame.gameWidth / r;
//                 // this.width = BasicGame.gameWidth
//                 // this.height = BasicGame.gameHeight
//             }
//
//         }
//         var game = new Game();
//         // game.state.add('Boot', Boot);
//         // game.state.start('Boot');
//     },
//     receivedEvent: function (id) {
//
//         console.log('Received Event: ' + id);
//     }
// };
class Game extends Phaser.Game {

    constructor() {
        super('100%', '100%', Phaser.CANVAS, 'sweetstory', null, true);
        this.state.add('Boot', Boot, false);
        this.state.start('Boot');
        this.user = {};
        // if (this.device.desktop) {
        //     BasicGame.screen = "large";
        //     BasicGame.gameWidth = 720;
        // }
        // BasicGame.gameHeight = BasicGame.gameWidth / r;
        // this.width = BasicGame.gameWidth
        // this.height = BasicGame.gameHeight
        if (window.cordova) {
            document.addEventListener('deviceready', () => {
                this.state.start('Boot');
            }, false);
        } else {
            this.state.start('Boot');
        }
    }

}
var game = new Game();


// app.initialize();