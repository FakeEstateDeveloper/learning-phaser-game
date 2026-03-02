// Command to run the game
// python -m http.server 8000

// Website to run the game
// http://localhost:8000/

// Github link
// https://FakeEstateDeveloper.github.io/learning-phaser-game/

export function main(Phaser, createStates) {
    let player, ground, bg, states;
    let currentState;
    let currentSpeed = 1;
    
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#000000",
        scene: { preload, create, update },
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 575 },
                debug: true
            }
        }
    };

    const game = new Phaser.Game(config);

    // Preload
    function preload() {
        // Preload Background
        this.load.image("background", "assets/background.png");

        // Preload Ground
        this.load.image("ground", "https://i.imgur.com/Zmp7rQG.png");

        // #region Preload Hero
        // Hero spritesheets
            this.load.spritesheet("hero_idle",                  "assets/hero/120x80pngsheets/idle.png",                         { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_run",                   "assets/hero/120x80pngsheets/run.png",                          { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_crouch",                "assets/hero/120x80pngsheets/crouch.png",                       { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_crouch_walk",           "assets/hero/120x80pngsheets/crouchwalk.png",                   { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_attack",                "assets/hero/120x80pngsheets/attack.png",                       { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_jump",                  "assets/hero/120x80pngsheets/jump.png",                         { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_fall",                  "assets/hero/120x80pngsheets/fall.png",                         { frameWidth: 120, frameHeight: 80 });
            this.load.spritesheet("hero_jumpfalltransition",    "assets/hero/120x80pngsheets/jumpfalltransition.png",           { frameWidth: 120, frameHeight: 80 });
        //#endregion
    }

    // Create
    function create() {
        // Create Background
        bg = this.add.image(0, 0, "background").setOrigin(0, 0);

        // #region Create Hero
        // Idle
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("hero_idle", { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        // Run
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("hero_run", { start: 0, end: 9 }),
            frameRate: 12,
            repeat: -1
        });
        // Crouch
        this.anims.create({
            key: "crouch",
            frames: this.anims.generateFrameNumbers("hero_crouch", { start: 0, end: 0 })
        });
        // CrouchWalk
        this.anims.create({
            key: "crouch_walk",
            frames: this.anims.generateFrameNumbers("hero_crouch_walk", { start: 0, end: 7 }),
            frameRate: 9,
            repeat: -1
        });
        // Attack
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers("hero_attack", { start: 0, end: 3 }),
            frameRate: 20,
            repeat: 0
        });
        // Jump
        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("hero_jump", { start: 0, end: 2}),
            frameRate: 20,
            repeat: 0
        });
        // Fall
        this.anims.create({
            key: "fall",
            frames: this.anims.generateFrameNumbers("hero_fall", { start: 0, end: 2}),
            frameRate: 20,
            repeat: 0
        });
        // Jumpfalltransition
        this.anims.create({
            key: "jumpfalltransition",
            frames: this.anims.generateFrameNumbers("hero_jumpfalltransition", { start: 0, end: 1}),
            frameRate: 30,
            repeat: 0
        });
        // #endregion

        // Create Movement
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            crouch: Phaser.Input.Keyboard.KeyCodes.C,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            dodgeroll: Phaser.Input.Keyboard.KeyCodes.Q
        });

        // #region Create Setup
        // Spawn point
        const spawnX = bg.width / 2;
        const spawnY = bg.height - 400;

        // Create Ground
        ground = this.physics.add.staticGroup();
        ground.create(spawnX, spawnY + 300, "ground").setScale(2).refreshBody();

        // Create more platforms
        ground.create(spawnX + 10, spawnY + 210, "ground").setScale(0.1).refreshBody();
        ground.create(spawnX + 100, spawnY + 180, "ground").setScale(0.1).refreshBody();

        // Spawn player
        player = this.physics.add.sprite(spawnX, spawnY, "hero_idle");
        player.body.setSize(25.5, 40);
        player.body.setOffset(47.5, 40);

        // Add collision between player and ground
        this.physics.add.collider(player, ground);

        // Make camera unable to show black void
        this.cameras.main.setBounds(0, 0, bg.width, bg.height);

        // Make camera follow the player
        this.cameras.main.startFollow(player, true, 0.1, 0.1);

        // Disables right-click mouse menu
        this.input.mouse.disableContextMenu();
        
        // Flags
        this.canAttack = true;

        // Enter State
        states = createStates(player, currentSpeed);
        currentState = "idle";
        states[currentState].onEnter();
        // #endregion
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

}