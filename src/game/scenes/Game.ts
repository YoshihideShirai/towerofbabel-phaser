import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    floor_width: integer;
    floor_height: integer;
    tale_size: integer;

    player: Phaser.GameObjects.Sprite;

    constructor() {
        super('Game');
        this.floor_width = 17;
        this.floor_height = 12;
        this.tale_size = 64
    }


    drawFloor() {
        this.background = this.add.image(512, 384, 'background')
            .setAlpha(0);
        for (let i = 0; i < this.floor_width; i++) {
            for (let j = 0; j < this.floor_height + 1; j++) {
                this.add.image(this.tale_size * i, this.tale_size * j, 'backwall')
                    .setDisplaySize(this.tale_size, this.tale_size)
            }
        }
        for (let j = 0; j < this.floor_height + 1; j++) {
            this.add.image(0, 0 + j * this.tale_size, 'sidewall')
                .setDisplaySize(this.tale_size, this.tale_size)
            this.add.image((this.floor_width - 1) * this.tale_size, 0 + j * this.tale_size, 'sidewall')
                .setDisplaySize(this.tale_size, this.tale_size)
        }
        for (let i = 0; i < this.floor_width; i++) {
            this.add.image(0 + i * this.tale_size, 0, 'sidewall')
                .setDisplaySize(this.tale_size, this.tale_size)
            this.add.image(0 + i * this.tale_size, this.floor_height * this.tale_size, 'needle')
                .setDisplaySize(this.tale_size, this.tale_size)
        }
    }

    create() {
        this.drawFloor()

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.cameras.main.zoom = 1;
        this.cameras.main.centerOn(this.floor_width * this.tale_size / 2 - this.tale_size / 2, 13 * this.tale_size / 2 - this.tale_size / 2);

        this.gameText = this.add.text(this.tale_size * 2, this.tale_size, 'POWER : 20', {
            fontFamily: 'Arial Black', fontSize: this.tale_size / 2, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0, 0);

        this.player = this.add.sprite(240, 80, "indy_start3").setDisplaySize(this.tale_size,this.tale_size);
        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
