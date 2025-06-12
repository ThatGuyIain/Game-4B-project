class Load extends Phaser.Scene{
    constructor(){
        super("loadScene");
    }

    preload(){
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load Key sprite
        this.load.image("Key", "tile_0096.png");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");
        this.load.image("trans_tiles","monochrome_tilemap_transparent_packed.png");
        this.load.tilemapTiledJSON("level","level.tmj")

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("transparent", "monochrome_tilemap_transparent_packed.png",{
            frameWidth: 16,
            frameHeight: 16
        });

        // Load SFX
        this.load.audio('sfxjump','Jump.wav');
        this.load.audio('sfxcoin','Pickup_coin.wav');
        this.load.audio('sfxclick', 'Key.wav');
        this.load.audio('Died', 'Explosion.wav');
        this.load.audio('Scream','Scream.wav');
        this.load.audio('Door','Door.wav');
        this.load.audio('Reset','YouDied.mp3')

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Load the bitmap font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

    }

    create(){
            this.anims.create({
            key: "walk",
            frames:this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
            
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }
}