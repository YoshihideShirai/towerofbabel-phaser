import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import * as yaml from 'js-yaml';

type FloorConfig = {
    name: string,
    height: integer,
    power: integer,
    indy: { x: integer, y: integer },
    gates: { x: integer, y: integer }[],
    ivys: { x: integer, y: integer }[],
    floors: { x: integer, y: integer }[],
    blocks: { x: integer, y: integer, d: "left" | "right" }[],
}

type TowerConfig = {
    name: string,
    floors: FloorConfig[],
}

class Block extends Phaser.Physics.Matter.Sprite {
    direction: "left" | "right";
    game: Game;
    sensor: Phaser.Physics.Matter.Sprite[];

    constructor(config: { game: Game, x: integer, y: integer, direction: "left" | "right" }) {
        let idxs = config.game.configIdx2drawIdx(config.x, config.y);
        super(config.game.matter.world, idxs.x, idxs.y, "block_" + config.direction);
        this.game = config.game;
        this.direction = config.direction;
        this.game.add.existing(this);
        this
            .setDisplaySize(this.game.taleSize, this.game.taleSize)
            .setFixedRotation();
        this.sensor = [
            this.game.matter.add.sprite(
                idxs.x + this.game.taleSize / 4,
                idxs.y + this.game.taleSize / 4,
                "blank")
                .setAlpha(0.5),
            this.game.matter.add.sprite(
                idxs.x - this.game.taleSize / 4,
                idxs.y + this.game.taleSize / 4,
                "blank")
                .setAlpha(0.5),
            this.game.matter.add.sprite(
                this.direction == "left" ? idxs.x - this.game.taleSize / 4 : idxs.x + this.game.taleSize / 4,
                idxs.y - this.game.taleSize / 4,
                "blank")
                .setAlpha(0.5),
        ];
    }
}

class Player extends Phaser.Physics.Matter.Sprite {
    state: "starting" | "goal" | "stand" | "lifting" | "lifted" | "walking" | "criming" | "falling" | "killed";
    direction: "left" | "right" | "center";
    game: Game;
    power: integer;

    constructor(config: { game: Game, x: integer, y: integer }) {
        let idxs = config.game.configIdx2drawIdx(config.x, config.y);
        super(config.game.matter.world, idxs.x, idxs.y, "indy_start0");
        this.power = 0;
        this.game = config.game;
        this.game.add.existing(this);
        this
            .setDisplaySize(this.game.taleSize, this.game.taleSize)
            .setRectangle(this.game.taleSize/2,this.game.taleSize)
            .setFixedRotation();
        this.createAnims();
        this.state = "starting";
        this.direction = "center";
        this.play('indy_starting').once('animationcomplete', () => {
            this.state = "stand";
        });
    }

    createAnims() {
        this.game.anims.create({
            key: 'indy_starting',
            frames: [
                { key: "indy_start0", duration: 1000, visible: true },
                { key: "indy_start1", duration: 1000, visible: true },
                { key: "indy_start2", duration: 1000, visible: true },
            ],
        });
        this.game.anims.create({
            key: 'indy_right_killed',
            frames: [
                { key: "indy_right_dead0", duration: 1000, visible: true },
                { key: "indy_right_dead1", duration: 1000, visible: true },
                { key: "indy_right_dead2", duration: 1000, visible: true },
            ],
        });
        this.game.anims.create({
            key: 'indy_left_killed',
            frames: [
                { key: "indy_left_dead0", duration: 1000, visible: true },
                { key: "indy_left_dead1", duration: 1000, visible: true },
                { key: "indy_left_dead2", duration: 1000, visible: true },
            ],
        });
        this.game.anims.create({
            key: 'indy_center_stand',
            frames: [
                { key: "indy_start3", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_right_stand',
            frames: [
                { key: "indy_right_stand0", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_left_stand',
            frames: [
                { key: "indy_left_stand0", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_right_start_walking',
            frames: [
                { key: "indy_right_stand2", duration: 100, visible: true },
            ],
        });
        this.game.anims.create({
            key: 'indy_left_start_walking',
            frames: [
                { key: "indy_left_stand2", duration: 100, visible: true },
            ],
        });
        this.game.anims.create({
            key: 'indy_right_walking',
            frames: [
                { key: "indy_right_stand0", duration: 100, visible: true },
                { key: "indy_right_stand1", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_left_walking',
            frames: [
                { key: "indy_left_stand0", duration: 100, visible: true },
                { key: "indy_left_stand1", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_right_fall',
            frames: [
                { key: "indy_right_fall0", duration: 100, visible: true },
                { key: "indy_right_fall1", duration: 100, visible: true },
            ],
            repeat: -1,
        });
        this.game.anims.create({
            key: 'indy_left_fall',
            frames: [
                { key: "indy_left_fall0", duration: 100, visible: true },
                { key: "indy_left_fall1", duration: 100, visible: true },
            ],
            repeat: -1,
        });
    }

    update() {
        if (this.isActive()) {
            this.setVelocityY(1);
            if (this.isWalkable()) {
                // if (!this.body?.touching.down) {
                //     this.setVelocityX(0);
                //     this.state = "falling";
                //     this.play("indy_" + this.direction + "_fall");
                // }
            }
            if (this.state == "falling") {
                this.state = "stand";
                this.play("indy_" + this.direction + "_stand");
            }
        }
    }

    keyRightDown() {
        if (this.isWalkable()) {
            super.setVelocityX(1);
            if (this.state !== "walking" || this.direction !== "right") {
                this.play("indy_right_start_walking").once('animationcomplete', () => {
                    this.play("indy_right_walking");
                });
            }
            this.state = "walking";
            this.direction = "right";
        }
    }

    keyLeftDown() {
        if (this.isWalkable()) {
            super.setVelocityX(-1);
            if (this.state !== "walking" || this.direction !== "left") {
                this.play("indy_left_start_walking").once('animationcomplete', () => {
                    this.play("indy_left_walking");
                });
            }
            this.state = "walking";
            this.direction = "left";
        }
    }

    nokeyDown() {
        super.setVelocityX(0);
        if (this.state === "walking") {
            this.play("indy_" + this.direction + "_stand");
            this.state = "stand";
        }
    }

    isActive(): boolean {
        if (this.state == "starting") {
            return false;
        }
        if (this.state == "goal") {
            return false;
        }
        if (this.state == "killed") {
            return false;
        }
        return true;
    }
    isWalkable(): boolean {
        if (this.state == "stand") {
            return true;
        }
        if (this.state == "walking") {
            return true;
        }
        return false;
    }
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    powerText: Phaser.GameObjects.Text;

    floorConfig: FloorConfig;
    floorWidth: integer;
    floorHeight: integer;
    taleSize: integer;

    wallGroup: Phaser.GameObjects.Group;
    gatesGroup: Phaser.GameObjects.Group;
    ivysGroup: Phaser.GameObjects.Group;
    floorsGroup: Phaser.GameObjects.Group;
    blocksGroup: Phaser.GameObjects.Group;

    player: Player;

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

    addSpriteFromConfigIdx(x: integer, y: integer, texture: string): Phaser.Physics.Matter.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        return this.matter.add.sprite(idxs.x, idxs.y, texture)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    addImageFromConfigIdx(x: integer, y: integer, texture: string): Phaser.GameObjects.Image {
        let idxs = this.configIdx2drawIdx(x, y);
        return this.matter.add.image(idxs.x, idxs.y, texture)
            .setSize(this.taleSize, this.taleSize)
            .setDisplaySize(this.taleSize, this.taleSize).setStatic(true);
    }

    staticGroupAddSpriteFromConfigIdx(grp: Phaser.GameObjects.Group, x: integer, y: integer, texture: string): Phaser.GameObjects.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        let sprite = this.matter.add.sprite(idxs.x, idxs.y, texture)
                .setSize(this.taleSize, this.taleSize)
                .setDisplaySize(this.taleSize, this.taleSize)
                .setStatic(true)
        return sprite;
    }

    groupAddSpriteFromConfigIdx(grp: Phaser.GameObjects.Group, x: integer, y: integer, texture: string): Phaser.GameObjects.Sprite {
        let idxs = this.configIdx2drawIdx(x, y);
        return grp.create(idxs.x, idxs.y, texture)
            .setDisplaySize(this.taleSize, this.taleSize);
    }

    staticGroupAddRectangleFromConfigIdx(grp: Phaser.GameObjects.Group, x: integer, y: integer, width: integer, height: integer): Phaser.GameObjects.Rectangle {
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
            let block = new Block({ game: this, x: ele.x, y: ele.y, direction: ele.d });
            block.sensor.forEach(ele => {
                this.blocksGroup.add(ele);
            });
        });
        this.player = new Player({ game: this, x: this.floorConfig.indy.x, y: this.floorConfig.indy.y });
        this.player.power = this.floorConfig.power;
    }

    create() {
        this.wallGroup = this.add.group({
            key: 'wallGroup'
        });
        this.gatesGroup = this.add.group({
            key: 'gatesGroup'
        });
        this.ivysGroup = this.add.group({
            key: 'ivysGroup'
        });
        this.floorsGroup = this.add.group({
            key: 'floorsGroup'
        });
        this.blocksGroup = this.add.group({
            key: 'blocksGroup'
        });
        this.fetchFloorData();
        this.drawBackwall();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.cameras.main.zoom = 1;
        this.cameras.main.centerOn(this.floorWidth * this.taleSize / 2 - this.taleSize / 2, 13 * this.taleSize / 2 - this.taleSize / 2);

        this.powerText = this.add.text(this.taleSize * 2, this.taleSize, '', {
            fontFamily: 'Arial Black', fontSize: this.taleSize / 2, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0, 0);

        this.drawSprite();
        // this.physics.add.collider(this.blocksGroup, this.floorsGroup);
        // this.physics.add.collider(this.player, this.floorsGroup);
        // this.physics.add.collider(this.player, this.wallGroup);
        // this.physics.add.collider(this.player, this.blocksGroup);
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
        this.player.update();
        this.powerText.setText("POWER : " + this.player.power);
        let keys = this.addKeys();
        if (keys !== null) {
            if (keys['left'].isDown) {
                this.player.keyLeftDown();
            } else if (keys['right'].isDown) {
                this.player.keyRightDown();
            } else {
                this.player.nokeyDown();
            }
        }
    }
    changeScene() {
        this.scene.start('GameOver');
    }
}
