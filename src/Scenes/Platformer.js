class Platfomer extends Phaser.Scene{
    constructor(){
        super("platformerScene")
    }

    init(){
        this.ACCELERATION = 600;
        this.DRAG = 2500;
        this.JUMP_VELOCITY = -500;
        this.physics.world.gravity.y = 2250;
        this.PARTICLE_VELOCITY = 0;
        this.SCALE = 2;
        this.canDouble = true;
        this.lives = 3;

    }

    preload(){

    }

    create(){
        //Creates a new map of 16x16 tiles
        this.map = this.add.tilemap("level",16,16,80,60);

        //Adding tileset to the map
        //First parameter is the name of the tileset in Tiled
        //Second parameter is the key from the loaded tilemap
        this.tileset = this.map.addTilesetImage("Tiles","tilemap_tiles");
        this.transparent = this.map.addTilesetImage("transparent","trans_tiles");

        //this.test = this.map.createLayer("TestStage",this.tileset,0,0);
        this.stageOne = this.map.createLayer("StageOne",this.tileset,0,0);
        this.stageOneTrans = this.map.createLayer("StageOneTrans",this.transparent,0,0);
        this.doorOne = this.map.createLayer("DoorOne",this.tileset,0,0);


        //Set collidable tiles

        this.doorOne.setCollisionByProperty({
            collides: true
        });

        this.stageOne.setCollisionByProperty({
            collides: true
        });

        this.stageOneTrans.setCollisionByProperty({
            collides: true,
        });

        this.createLayerCollision(this.map);

        console.log(this.map);

        //Set Player character
        my.sprite.player = this.physics.add.sprite(150,500,"platformer_characters","tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        //Set max character velocity
        my.sprite.player.setMaxVelocity(200,500);

        //Enable player collision with map
/*
        this.physics.add.collider(my.sprite.player,this.test);
*/
        this.physics.add.collider(my.sprite.player,this.stageOne);
        this.physics.add.collider(my.sprite.player,this.stageOneTrans,(obj1,obj2) =>{
            // Checks if the player has touched a death tile
            if(obj2.properties.isDeadly){
                my.sprite.player.y = 500;
                my.sprite.player.x = 150;
                this.lives -=1;
                if(this.lives > 0){
                    this.sound.play('Died',{
                        volume: 0.5
                    });
                }
                if(my.sprite.activeKey){
                    my.sprite.activeKey.x = my.sprite.player.x;
                    my.sprite.activeKey.y = my.sprite.player.y;
                }
            }
        });
        this.door1 = this.physics.add.collider(my.sprite.player,this.doorOne);

        //Check for if the play is touching a door activator tile
        this.physics.add.overlap(my.sprite.player,this.stageOneTrans,(player,tile)=>{
            if(tile.properties.activator1){
                if(my.sprite.activeKey){
                    my.sprite.activeKey.destroy();
                    this.door1.active = false;
                    this.doorOne.setAlpha(.3);
                }
            }
        })

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        //Code for the camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        //Code for VFX
        my.vfx.walking = this.add.particles(0,0,"kenny-particles",{
            frame:["star_06.png","star_07.png","star_08.png","star_09.png"],
            random: true,
            scale: {start: 0.01, end: 0.15},
            maxAliveParticles: 10,
            lifespan: 250,
            gravityY: -300,
            alpha: {start: 1, end: 0.1}
        })

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0,0,"kenny-particles",{
            frame: ["slash_01.png","slash_02.png"],
            random: true,
            scale: {start:0.1,end:.2},
            lifespan: 150,
            gravityY: 400,
            maxAliveParticles: 1,
            duration: 150,
            alpha:{start: 1, end:.1}
        })
        
        my.vfx.jumping.stop();

        my.vfx.key = this.add.particles(0,0,"kenny-particles",{
            frame: ["star_08.png","star_07.png"],
            random: true,
            scale: {start:0.1,end:.2},
            lifespan: 150,
            gravity: -100,
            maxAliveParticles: 10,
            duration: 150,
            alpha:{start:1, end:0}
        })

        my.vfx.key.stop();

        // Set up key object
        this.key = this.map.createFromObjects("Objects",{
            name: "Key",
            key: "transparent",
            frame: 96
        })

        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.keys = this.add.group(this.key);

        this.physics.add.overlap(my.sprite.player, this.keys,(obj1,obj2)=>{
            obj2.collected = true;
            this.sound.play('sfxclick',{
                volume: 0.5,
            })
            my.vfx.key.x = obj2.x;
            my.vfx.key.y = obj2.y;
            my.vfx.key.start();
            obj2.destroy();
            my.sprite.activeKey = this.add.sprite(obj2.x, obj2.y,"Key");

        });

    }


    update(){
        //Handle left and right movement
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //Handle VFX animation
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            //make sure player is on the ground before playing particles
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        }else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-20, my.sprite.player.displayHeight/2-5, false);
 
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        }else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            my.vfx.walking.stop();

        }

        //Checking if player is touching the floor
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');

            my.vfx.walking.stop();

        }

        //Handle jumping
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            //VFX for jump particle
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5,false);
            my.vfx.jumping.start();
            this.sound.play('sfxjump',{
                volume:0.5
            });

        }

        //Handle double jump
        if(!my.sprite.player.body.blocked.down && this.canDouble && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.canDouble = false;

            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5,false);
            my.vfx.jumping.start();
            this.sound.play('sfxjump',{
                volume:0.5
            });

        }

        //Reset double jump condition
        if(my.sprite.player.body.blocked.down){
            this.canDouble = true;
        }

        //Reset stage
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Check if the player has fallen off the map
        if(my.sprite.player.y >= config.height-50){
            my.sprite.player.y = 500;
            my.sprite.player.x = 150;
            this.lives -=1;
            this.sound.play('Scream',{
                volume: 0.5
            })
        }

        //Handle moving key 
        if(my.sprite.activeKey){
            if(my.sprite.player.body.velocity.x > 0){
                my.sprite.activeKey.resetFlip();
                my.sprite.activeKey.x = my.sprite.player.x -20;
                my.sprite.activeKey.y = my.sprite.player.y;
            }else if(my.sprite.player.body.velocity.x < 0){
                my.sprite.activeKey.setFlip(true,false);
                my.sprite.activeKey.x = my.sprite.player.x +20;
                my.sprite.activeKey.y = my.sprite.player.y;
            }else my.sprite.activeKey.y = my.sprite.player.y;
        }

        // Check if the player loses or not
        if(this.lives <= 0){
            console.log("dead");
            this.scene.restart();
        }
    }

    createLayerCollision(map){
        for(let layer of map.layers)
        {
            let tileset = map.tilesets[1];
            for(let i = 0; i < map.width; i++)
            {
                for(let j = 0; j < map.height; j++)
                {
                    if(layer.tilemapLayer != null){
                        let tile = layer.tilemapLayer.getTileAt(i, j);
                        if(tile != null)
                        {
                            let tileProps = tileset.getTileProperties(tile.index);
                            if(tileProps != null)
                            {
                                if(tileProps.jumpthru)
                                    tile.setCollision(false, false, true, false, false);
                                else if(tileProps.collides)
                                    tile.setCollision(true, true, true, true);
                                else
                                    tile.resetCollision(false);
                            }
                        }
                    }
                }
            }
        }
    }
}