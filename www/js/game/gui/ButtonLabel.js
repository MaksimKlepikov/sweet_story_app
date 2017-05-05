/**
 * Created by kevrat on 12.02.2017.
 */
export default class ButtonLabel extends Phaser.Button {
    constructor(game, x, y, key, iconName, textString = '', callback, props = {
        leftPadding: 0.1,
        bottomPadding: 0.1
    }, style) {
        super(game, x, y, key, callback, null, iconName, iconName);
        // self = this;
        let text = new Phaser.Text(game, 0, 0, textString);

        text.anchor.set(0.5)
        this.anchor.set(0.5)
        text.alignIn(this, Phaser.CENTER, 0, -this.height * props.bottomPadding);
        // this.width = Math.min(game.width * props.width, props.maxWidth);
        // this.scale.y = this.scale.x;
        let defaultStyle = {
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            wordWrapWidth: this.width - this.width * props.leftPadding,
            wordWrap: true,
            align: 'center',
            font: this.height*(1-props.bottomPadding)+''
        };
        text.setStyle(style?style:defaultStyle)
        this.addChild(text);
        //
        // while ((text.fontSize > 0 && text.width > (this.getBounds().width - this.getBounds().width * textPaddingPercentage.left))) {
        //     text.fontSize-=3;
        //     // text.updateText();
        // }
        text.alpha = 0.7;
    }

    activateInputsTweens() {
        const scaleUp = ({x, y}) => ({x: x * 1.1, y: y * 1.1});
        const scaleDown = ({x, y}) => ({x: x / 1.1, y: y / 1.1});
        const otherArgs = [100, Phaser.Easing.Linear.In, true];
        this.events.onInputUp.add(_ => {
            this.game.add.tween(this.scale)
                .to(scaleUp(this.scale), ...otherArgs)
        });
        this.events.onInputDown.add(_ => {
            this.game.add.tween(this.scale)
                .to(scaleDown(this.scale), ...otherArgs)
        });
    }
}
