import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import * as yaml from 'js-yaml';
import { stat } from 'fs/promises';

type FloorConfig = {
    name: string,
    height: integer,
    indy: { x: integer, y: integer },
    gates: { x: integer, y: integer }[],
    ivys: { x: integer, y: integer }[],
    floors: { x: integer, y: integer }[],
    blocks: { x: integer, y: integer, d: string }[],
}

type TowerConfig = {
    name: string,
    floors: FloorConfig[],
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    floorConfig: FloorConfig;
    floorWidth: integer;
    floorHeight: integer;
    taleSize: integer;

    staticWall: Phaser.Physics.Arcade.StaticGroup;

    player: Phaser.GameObjects.Sprite;
    gates: Phaser.GameObjects.Sprite[];
    ivys: Phaser.GameObjects.Sprite[];
    floors: Phaser.GameObjects.Sprite[];
    blocks: Phaser.GameObjects.Sprite[];

    constructor() {
        super('Game');
        this.floorWidth = 17;
        this.floorHeight = 12;
        this.taleSize = 64;
        this.gates = [];
        this.ivys = [];
        this.floors = [];
        this.blocks = [];
    }

    preload() {
        this.load.text('tower.config', 'towers/front.yml');
    }

    fetchFloorData() {
        let text = this.cache.text.get('tower.config');
        let data = yaml.load(text) as TowerConfig;
        this.floorConfig = data.floors[0];
        this.floorHeight = this.floorConfig.height;
    }

    drawBackwall() {
        this.staticWall = this.physics.add.staticGroup({
            key: 'staticwall'
        });
        this.background = this.add.image(512, 384, 'background')
            .setAlpha(0);
        for (let i = 0; i < this.floorWidth; i++) {
            for (let j = 0; j < this.floorHeight + 1; j++) {
                this.add.image(this.taleSize * i, this.taleSize * j, 'backwall')
                    .setDisplaySize(this.taleSize, this.taleSize);
            }
        }
        for (let j = 0; j < this.floorHeight + 1; j++) {
            this.staticWall.create(0, 0 + j * this.taleSize, 'sidewall')
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize);
            this.staticWall.create((this.floorWidth - 1) * this.taleSize, 0 + j * this.taleSize, 'sidewall')
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize);
        }
        for (let i = 0; i < this.floorWidth; i++) {
            this.staticWall.create(0 + i * this.taleSize, 0, 'sidewall')
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize);
            this.add.image(0 + i * this.taleSize, this.floorHeight * this.taleSize, 'needle')
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize);
        }
    }

    addSpriteFromConfigIdx(x: integer, y: integer, texture: string): Phaser.GameObjects.Sprite {
        let idxs = { x: (2 + x) * this.taleSize / 2, y: (2 + y) * this.taleSize / 2 };
        return this.add.sprite(idxs.x, idxs.y, texture).setDisplaySize(this.taleSize, this.taleSize);
    }

    drawSprite() {
        this.floorConfig.ivys.forEach(ele => {
            this.ivys.push(this.addSpriteFromConfigIdx(ele.x, ele.y, 'ivy'));
        });
        this.floorConfig.gates.forEach(ele => {
            this.gates.push(this.addSpriteFromConfigIdx(ele.x, ele.y, 'gate'));
        });
        this.floorConfig.floors.forEach(ele => {
            this.floors.push(this.addSpriteFromConfigIdx(ele.x, ele.y, 'floor'));
        });
        this.floorConfig.blocks.forEach(ele => {
            this.blocks.push(this.addSpriteFromConfigIdx(ele.x, ele.y, 'block_' + ele.d));
        });
        this.player = this.addSpriteFromConfigIdx(this.floorConfig.indy.x, this.floorConfig.indy.y, "indy_start3");
    }

    create() {
        this.fetchFloorData();
        this.drawBackwall();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.cameras.main.zoom = 1;
        this.cameras.main.centerOn(this.floorWidth * this.taleSize / 2 - this.taleSize / 2, 13 * this.taleSize / 2 - this.taleSize / 2);

        this.gameText = this.add.text(this.taleSize * 2, this.taleSize, 'POWER : 20', {
            fontFamily: 'Arial Black', fontSize: this.taleSize / 2, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0, 0);

        this.drawSprite();
        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
