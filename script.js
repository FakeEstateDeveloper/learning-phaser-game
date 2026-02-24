// Command to run the game
// python -m http.server 8000

// Website to run the game
// http://localhost:8000/

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#000000",
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};
const game = new Phaser.Game(config);

// Global Variables
let player;
let currentState;
let currentSpeed = 1;

// Preload
function preload() {
    // Preload Background
    this.load.image("background", "assets/background.png");

    // #region Preload Hero
    // Preload Hero _Idle
    this.load.spritesheet("hero_idle", "assets/hero/120x80_PNGSheets/_Idle.png", {
        frameWidth: 120,
        frameHeight: 80
    });

    // Preload Hero _Run
    this.load.spritesheet("hero_run", "assets/hero/120x80_PNGSheets/_Run.png", {
        frameWidth: 120, 
        frameHeight: 80
    });

    // Preload Hero _Crouch
    this.load.spritesheet("hero_crouch", "assets/hero/120x80_PNGSheets/_Crouch.png", {
        frameWidth: 120, 
        frameHeight: 80
    });

    // Preload Hero _CrouchWalk
    this.load.spritesheet("hero_crouch_walk", "assets/hero/120x80_PNGSheets/_CrouchWalk.png", {
        frameWidth: 120, 
        frameHeight: 80
    });

    // Preload Hero _Attack
    this.load.spritesheet("hero_attack", "assets/hero/120x80_PNGSheets/_Attack.png", {
        frameWidth: 120, 
        frameHeight: 80
    });
    //#endregion
}

// Create
function create() {
    // Create Background
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    //this.add.image(width / 2, height / 2, "background");

    // #region Create Hero
    // Create Hero Idle
    this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("hero_idle", { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });

    // Create Hero Run
    this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNumbers("hero_run", { start: 0, end: 9 }),
        frameRate: 12,
        repeat: -1
    });

    // Create Hero Crouch
    this.anims.create({
        key: "crouch",
        frames: this.anims.generateFrameNumbers("hero_crouch", { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });

    // Create Hero CrouchWalk
    this.anims.create({
        key: "crouch_walk",
        frames: this.anims.generateFrameNumbers("hero_crouch_walk", { start: 0, end: 9 }),
        frameRate: 9,
        repeat: -1
    });

    // Create Hero Attack
    this.anims.create({
        key: "attack",
        frames: this.anims.generateFrameNumbers("hero_attack", { start: 0, end: 9 }),
        frameRate: 20,
        repeat: 0
    });
    // #endregion

    // Create Movement
    this.keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        down: Phaser.Input.Keyboard.KeyCodes.CTRL,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        crouch: Phaser.Input.Keyboard.KeyCodes.C
    });

    // Spawn point
    const spawnX = bg.width / 2;
    const spawnY = bg.height - 300;

    // Spawn player
    player = this.add.sprite(spawnX, spawnY, "hero_idle");

    // Make camera unable to show black void
    this.cameras.main.setBounds(0, 0, bg.width, bg.height);

    // Make camera follow the player
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    // Disables right-click mouse menu
    this.input.mouse.disableContextMenu();

    // Enter State
    currentState = "idle";
    states[currentState].onEnter();

    // Flags
    this.canAttack = true;
}

// Update
function update() {
    // Enter Next State
    const nextState = states[currentState].onUpdate(this);
    if (nextState !== currentState) {
        states[currentState].onExit(this);
        states[nextState].onEnter(this);
        currentState = nextState;
        console.log("Switched to state:", currentState);
    }
}

// State Machine
const states = {
    idle: {
        onEnter() {
            player.play("idle", true);
        },
        onUpdate(scene) {
            // Attack
            const mouse = scene.input.activePointer;
            if (mouse.leftButtonDown() && scene.canAttack && mouse.button === 0) {
                scene.canAttack = false; // "Lock" the attack
                return "attack";
            }
            // Reset Attack
            if (!mouse.leftButtonDown()) {
                scene.canAttack = true;
            }
            // Crouch
            if (scene.keys.crouch.isDown) return "crouch";
            // Run
            if (scene.keys.left.isDown || scene.keys.right.isDown) return "run";
            // Idle
            return "idle";
        },
        onExit() {}
    },
    run: {
        onEnter() {
            player.play("run", true);
        },
        onUpdate(scene) {
            // Attack
            const mouse = scene.input.activePointer;
            if (mouse.leftButtonDown() && scene.canAttack && mouse.button === 0) {
                scene.canAttack = false; // "Lock" the attack
                return "attack";
            }
            // Reset Attack
            if (!mouse.leftButtonDown()) {
                scene.canAttack = true;
            }
            // Crouch Walk
            if (scene.keys.crouch.isDown) return "crouch_walk";
            // Idle
            if (!scene.keys.left.isDown && !scene.keys.right.isDown) return "idle";

            // Movement Logic
            if (scene.keys.left.isDown) {
                player.x -= currentSpeed;
                player.flipX = true;
            } else if (scene.keys.right.isDown) {
                player.x += currentSpeed;
                player.flipX = false;
            }
            return "run";
        },
        onExit() {}
    },
    crouch: {
        onEnter() {
            player.play("crouch", true);
        },
        onUpdate(scene) {
            // Idle
            if (!scene.keys.crouch.isDown) return "idle";
            // Crouch Walk
            if (scene.keys.left.isDown || scene.keys.right.isDown) return "crouch_walk";
            // Crouch
            return "crouch";
        },
        onExit() {}
    },
    crouch_walk: {
        onEnter() {
            player.play("crouch_walk", true);
        },
        onUpdate(scene) {
            // Run
            if (!scene.keys.crouch.isDown) return "run";
            // Crouch
            if (!scene.keys.left.isDown && !scene.keys.right.isDown) return "crouch";

            // Slowed Movement
            const crouchSpeed = currentSpeed / 2;
            if (scene.keys.left.isDown) {
                player.x -= crouchSpeed;
                player.flipX = true;
            } else if (scene.keys.right.isDown) {
                player.x += crouchSpeed;
                player.flipX = false;
            }
            // Crouch Walk
            return "crouch_walk";
        },
        onExit() {}
    },
    attack: {
        isFinished: false,
        onEnter() {
            this.isFinished = false;
            player.play("attack", true)

            // Once the animation finishes, set our flag to true
            player.once("animationcomplete-attack", () => {
                this.isFinished = true;
            });
        },
        onUpdate() {
            // Stay in attack state until the animation is done
            if (this.isFinished) {
                return "idle";
            }
            return "attack";
        },
        onExit() {
            this.isFinished = false;
        }
    }
};

/*
function create() {
    const map = this.make.tilemap({ key: "map" });
    
    // "tileset_name" must match the name of the tileset inside the Tiled program
    const tileset = map.addTilesetImage("tileset_name", "tiles");

    // Create layers (Layer name, tileset, x, y)
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const platformLayer = map.createLayer("Platforms", tileset, 0, 0);

    // Set camera bounds to the tilemap size
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}
*/