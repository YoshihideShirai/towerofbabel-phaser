import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import * as yaml from 'js-yaml';

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

    wallGroup: Phaser.Physics.Arcade.StaticGroup;
    gatesGroup: Phaser.Physics.Arcade.StaticGroup;
    ivysGroup: Phaser.Physics.Arcade.StaticGroup;
    floorsGroup: Phaser.Physics.Arcade.StaticGroup;
    blocksGroup: Phaser.Physics.Arcade.Group;

    player: Phaser.Physics.Arcade.Sprite;

    constructor() {
        super('Game');
        this.floorWidth = 17;
        this.floorHeight = 12;
        this.taleSize = 64;
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

    configIdx2drawIdx(x: integer, y: integer): { x: integer, y: integer } {
        return { x: (2 + x) * this.taleSize / 2, y: (2 + y) * this.taleSize / 2 };
    }

    addSpriteFromConfigIdx(x: integer, y: integer, texture: string): Phaser.Physics.Arcade.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        return this.physics.add.sprite(idxs.x, idxs.y, texture)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    addImageFromConfigIdx(x: integer, y: integer, texture: string): Phaser.GameObjects.Image {
        let idxs = this.configIdx2drawIdx(x, y);
        return this.add.image(idxs.x, idxs.y, texture)
            .setSize(this.taleSize, this.taleSize)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    staticGroupAddSpriteFromConfigIdx(grp: Phaser.Physics.Arcade.StaticGroup, x: integer, y: integer, texture: string): Phaser.GameObjects.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        return grp.create(idxs.x, idxs.y, texture)
            .setSize(this.taleSize, this.taleSize)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    groupAddSpriteFromConfigIdx(grp: Phaser.Physics.Arcade.Group, x: integer, y: integer, texture: string): Phaser.GameObjects.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        return grp.create(idxs.x, idxs.y, texture)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    staticGroupAddRectangleFromConfigIdx(grp: Phaser.Physics.Arcade.StaticGroup, x: integer, y: integer, width: integer, height: integer): Phaser.GameObjects.Rectangle {
        let idxs = this.configIdx2drawIdx(x, y);
        let sensor = this.add.rectangle(
            idxs.x - (this.taleSize - width) / 2,
            idxs.y - (this.taleSize - height) / 2,
            width, height,
            0xff0000, 0.5
        )
        grp.add(sensor);
        return sensor;
    }

    drawBackwall() {
        this.background = this.add.image(512, 384, 'background')
            .setAlpha(0);
        for (let i = 0; i < this.floorWidth; i++) {
            for (let j = 0; j < this.floorHeight + 1; j++) {
                this.add.image(this.taleSize * i, this.taleSize * j, 'backwall')
                    .setDisplaySize(this.taleSize, this.taleSize);
            }
        }
        for (let j = 0; j < this.floorHeight + 1; j++) {
            this.staticGroupAddSpriteFromConfigIdx(this.wallGroup, -2, -2 + j * 2, 'sidewall');
            this.staticGroupAddSpriteFromConfigIdx(this.wallGroup, (this.floorWidth - 2) * 2, -2 + j * 2, 'sidewall');
        }
        for (let i = 0; i < this.floorWidth; i++) {
            this.staticGroupAddSpriteFromConfigIdx(this.wallGroup, -2 + i * 2, -2, 'sidewall');
        }
        for (let i = 0; i < this.floorWidth - 2; i++) {
            this.add.image(this.taleSize + i * this.taleSize, this.floorHeight * this.taleSize, 'needle')
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize);
        }
    }

    drawSprite() {
        this.floorConfig.ivys.forEach(ele => {
            this.staticGroupAddSpriteFromConfigIdx(this.ivysGroup, ele.x, ele.y, 'ivy');
        });
        this.floorConfig.gates.forEach(ele => {
            this.staticGroupAddSpriteFromConfigIdx(this.gatesGroup, ele.x, ele.y, 'gate');
        });
        this.floorConfig.floors.forEach(ele => {
            this.addImageFromConfigIdx(ele.x, ele.y, 'floor');
            this.staticGroupAddRectangleFromConfigIdx(this.floorsGroup, ele.x, ele.y, this.taleSize, this.taleSize / 4);
        });
        this.floorConfig.blocks.forEach(ele => {
            this.groupAddSpriteFromConfigIdx(this.blocksGroup, ele.x, ele.y, 'block_' + ele.d);
        });
        this.player = this.addSpriteFromConfigIdx(this.floorConfig.indy.x, this.floorConfig.indy.y, "indy_start3");
    }

    create() {
        this.wallGroup = this.physics.add.staticGroup({
            key: 'wallGroup'
        });
        this.gatesGroup = this.physics.add.staticGroup({
            key: 'gatesGroup'
        });
        this.ivysGroup = this.physics.add.staticGroup({
            key: 'ivysGroup'
        });
        this.floorsGroup = this.physics.add.staticGroup({
            key: 'floorsGroup'
        });
        this.blocksGroup = this.physics.add.group({
            key: 'blocksGroup'
        });
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


    addKeys(): { [key: string]: Phaser.Input.Keyboard.Key } | null {
        let keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
        let keyboard = this.input.keyboard;
        if (keyboard === null) {
            return keys;
        }
        keys['up'] = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keys['down'] = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keys['left'] = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keys['right'] = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        return keys;
    }

    update() {
        let keys = this.addKeys();
        if (keys !== null) {
            if (keys['left'].isDown) {
                this.player.setVelocityX(-200);
            } else if (keys['right'].isDown) {
                this.player.setVelocityX(200);
            } else {
                this.player.setVelocityX(0);
            }
        }
    }
    changeScene() {
        this.scene.start('GameOver');
    }
}
