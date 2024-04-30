import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    floor_width: integer;
    floor_height: integer;
    tale_size: integer;

    constructor() {
        super('Game');
        this.floor_width = 17;
        this.floor_height = 12;
        this.tale_size = 64
    }


    draw_floor() {
        let floor_width = this.floor_width;
        let floor_height = this.floor_height;
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0);
        for (let i = 0; i < floor_width; i++) {
            for (let j = 0; j < floor_height + 1; j++) {
                this.background = this.add.image(this.tale_size * i, this.tale_size * j, 'backwall').setDisplaySize(this.tale_size, this.tale_size)
            }
        }
        for (let j = 0; j < floor_height + 1; j++) {
            this.background = this.add.image(0, 0 + j * this.tale_size, 'sidewall').setDisplaySize(this.tale_size, this.tale_size)
            this.background = this.add.image((floor_width - 1) * this.tale_size, 0 + j * this.tale_size, 'sidewall').setDisplaySize(this.tale_size, this.tale_size)
        }
        for (let i = 0; i < floor_width; i++) {
            this.background = this.add.image(0 + i * this.tale_size, 0, 'sidewall').setDisplaySize(this.tale_size, this.tale_size)
            this.background = this.add.image(0 + i * this.tale_size, floor_height * this.tale_size, 'needle').setDisplaySize(this.tale_size, this.tale_size)
        }
    }

    create() {
        let floor_width = this.floor_width;

        this.draw_floor()

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        EventBus.emit('current-scene-ready', this);

        this.cameras.main.zoom = 1;
        this.cameras.main.centerOn(floor_width * this.tale_size / 2 - this.tale_size / 2, 13 * this.tale_size / 2 - this.tale_size / 2);

        this.gameText = this.add.text(this.tale_size * 2, this.tale_size, 'POWER : 20', {
            fontFamily: 'Arial Black', fontSize: this.tale_size / 2, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.gameText.setScrollFactor(0, 0);
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
