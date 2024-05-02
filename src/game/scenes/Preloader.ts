import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('star', 'assets/star.png');
        const images: string[] = [
            "babels_left0",
            "babels_left1",
            "babels_left_dead",
            "babels_right0",
            "babels_right1",
            "babels_right_dead",
            "backwall",
            "bat_left0",
            "bat_left1",
            "bat_right0",
            "bat_right1",
            "block_left",
            "block_right",
            "carpet",
            "char_left_dead",
            "char_right_dead",
            "cloud",
            "crystal0",
            "crystal1",
            "floor",
            "gate_closed",
            "gate",
            "indy_left_dead0",
            "indy_left_dead1",
            "indy_left_dead2",
            "indy_left_down0",
            "indy_left_down1",
            "indy_left_fall0",
            "indy_left_fall1",
            "indy_left_lift",
            "indy_left_lifted0",
            "indy_left_lifted1",
            "indy_left_stand0",
            "indy_left_stand1",
            "indy_left_stand2",
            "indy_left_unload",
            "indy_right_dead0",
            "indy_right_dead1",
            "indy_right_dead2",
            "indy_right_down0",
            "indy_right_down1",
            "indy_right_fall0",
            "indy_right_fall1",
            "indy_right_lift",
            "indy_right_lifted0",
            "indy_right_lifted1",
            "indy_right_stand0",
            "indy_right_stand1",
            "indy_right_stand2",
            "indy_right_unload",
            "indy_start0",
            "indy_start1",
            "indy_start2",
            "indy_start3",
            "indy_up0",
            "indy_up1",
            "ivy",
            "ivyfloor",
            "needle",
            "sidewall",
            "uru_left_dead",
            "uru_left_fall",
            "uru_left_stand0",
            "uru_left_stand1",
            "uru_left_stand2",
            "uru_right_dead",
            "uru_right_fall",
            "uru_right_stand0",
            "uru_right_stand1",
            "uru_right_stand2",
        ];
        images.forEach(element => {
            this.load.image(element, 'assets/' + element + '.png')
        });
        this.add.graphics()
            .fillStyle(0xff0000, 0.5)
            .fillRect(0, 0, 32, 32)
            .generateTexture("block_sensor", 32, 32);
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
