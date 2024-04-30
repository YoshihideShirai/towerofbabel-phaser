import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    floor_width: integer;
    floor_height: integer;

    constructor() {
        super('Game');
        this.floor_width = 17;
        this.floor_height = 12;
    }


    draw_floor(){
        let floor_width = this.floor_width;
        let floor_height = this.floor_height;
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0);
        for (let i = 0; i < floor_width; i++) {
            for (let j = 0; j < floor_height + 1; j++) {
                this.background = this.add.image(32 * i, 32 * j, 'backwall')
            }
        }
        for (let j = 0; j < floor_height + 1; j++) {
            this.background = this.add.image(0, 0 + j * 32, 'sidewall')
            this.background = this.add.image((floor_width - 1) * 32, 0 + j * 32, 'sidewall')
        }
        for (let i = 0; i < floor_width; i++) {
            this.background = this.add.image(0 + i * 32, 0, 'sidewall')
            this.background = this.add.image(0 + i * 32, floor_height * 32, 'needle')
        }
    }

    create() {
        let floor_width = this.floor_width;

        this.draw_floor()

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        EventBus.emit('current-scene-ready', this);

        this.cameras.main.zoom = 2;
        this.cameras.main.centerOn(floor_width * 32 / 2 - 16, 13 * 32 / 2 - 16);

        this.gameText = this.add.text(64, 32, 'POWER : 20', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
