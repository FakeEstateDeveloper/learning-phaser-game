// Command to run the game
// python -m http.server 8000

// Website to run the game
// http://localhost:8000/

// Github link
// https://FakeEstateDeveloper.github.io/learning-phaser-game/

// Future add: Post-processing effects like Bloom, Glows, Blur, Vignette

// Adding https://maaot.itch.io/mossy-cavern (Too fucking big for my canvas...)

export function main(Phaser, createStates) {
    // Player
    let player;
    let currentSpeed = 1;

    // Map
    let ground, bg;

    // State
    let states;
    let currentState;
    
    // Mouse
    let mouseVisible = false;

    // Score
    let score = 0
    let scoreText;
    
    const config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600,
            zoom: 2
        },
        backgroundColor: "#000000",
        scene: { preload, create, update },
        physics: {
            default: "arcade",
            arcade: { gravity: { y: 575 }, debug: true }
        }
    };
    new Phaser.Game(config);

    // Preload
    function preload() {
        // Preload Background
        this.load.image("background", "assets/background.png");

        // Preload Ground
        this.load.image("ground", "https://i.imgur.com/Zmp7rQG.png");

        // Preload Star
        this.load.image("coin", "assets/coin.png");

        // Mossy Tileset
        this.load.tilemapTiledJSON("mossy_autotiling", "assets/mossy/mossy_autotiling.tmj")
        this.load.image("mossyTiles", "assets/mossy/mossy_tileset.png");

        // Hero spritesheets
        this.load.spritesheet("hero_idle",                  "assets/hero/120x80pngsheets/idle.png",                         { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_run",                   "assets/hero/120x80pngsheets/run.png",                          { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_crouch",                "assets/hero/120x80pngsheets/crouch.png",                       { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_crouch_walk",           "assets/hero/120x80pngsheets/crouchwalk.png",                   { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_attack",                "assets/hero/120x80pngsheets/attack.png",                       { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_jump",                  "assets/hero/120x80pngsheets/jump.png",                         { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_fall",                  "assets/hero/120x80pngsheets/fall.png",                         { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_jumpfalltransition",    "assets/hero/120x80pngsheets/jumpfalltransition.png",           { frameWidth: 120, frameHeight: 80 });
        this.load.spritesheet("hero_dodgeroll",             "assets/hero/120x80pngsheets/dodgeroll.png",                    { frameWidth: 120, frameHeight: 80 });
    }

    // Create
    function create() {
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
        // Dodgeroll
        this.anims.create({
            key: "dodgeroll",
            frames: this.anims.generateFrameNumbers("hero_dodgeroll", { start: 0, end: 11}),
            frameRate: 25,
            repeat: 0
        });
        // #endregion

        // Disable all windows keys
        window.addEventListener('keydown', function(e) {
            if (e.key === "Tab") {
                e.preventDefault();
            }
        });

        // Create Movement
        this.keys = this.input.keyboard.addKeys({
            // Menu
            tab: Phaser.Input.Keyboard.KeyCodes.TAB,

            // Gameplay
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            crouch: Phaser.Input.Keyboard.KeyCodes.C,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            dodgeroll: Phaser.Input.Keyboard.KeyCodes.Q
        });

        // #region Create Setup
        // Create Background
        bg = this.add.image(0, 0, "background").setOrigin(0, 0);

        // Spawn point
        const spawnX = bg.width / 2;
        const spawnY = bg.height - 400;

        // Create Ground
        ground = this.physics.add.staticGroup();
        ground.create(spawnX, spawnY + 300, "ground").setScale(2).refreshBody();
        ground.create(spawnX + 10, spawnY + 210, "ground").setScale(0.1).refreshBody();
        ground.create(spawnX + 100, spawnY + 180, "ground").setScale(0.1).refreshBody();

        // Create Mossy Map (Doesn't fucking work)
        const map = this.make.tilemap({ key: "mossy_autotiling"});
        const tileset = map.addTilesetImage("mossy_tiles", "mossyTiles");
        const groundLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);
        groundLayer.setCollisionByProperty({ collides: true });

        // Score Text
        scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            fill: "#000"
        });
        scoreText.setScrollFactor(0);

        // Player
        player = this.physics.add.sprite(spawnX, spawnY);           // Spawn player
        player.body.setSize(25.5, 40);                              // Set size of player's hitbox
        player.body.setOffset(47.5, 40);                            // Set offset of player's hitbox
        this.physics.add.collider(player, ground);             // Add collision between player and map

        // Player Flags
        this.canAttack = true;
        this.canDodge = true;

        // Create Collectibles (Can also set obstacles to .setImmovable(true);)
        const myCoin = this.physics.add.sprite(spawnX + 180, spawnY + 150, "coin").setScale(0.05);
        myCoin.body.allowGravity = false;
        this.physics.add.collider(myCoin, ground);             // Add collision with ground
        this.physics.add.overlap(player, myCoin, () => {            // If player touches myCoin, delete the coin
            myCoin.disableBody(true, true);
            score += 10;
            scoreText.setText("Score: " + score);
        });

        // Camera
        this.cameras.main.setBounds(0, 0, bg.width, bg.height);     // Make camera unable to show black void
        this.cameras.main.startFollow(player, true, 0.1, 0.1);      // Make camera follow the player
        this.input.mouse.disableContextMenu();                      // Disables right-click mouse menu
        // #endregion

        // Enter State
        states = createStates(player, currentSpeed);
        currentState = "idle";
        states[currentState].onEnter();
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

        // Hide the cursor over the game canvas
        if (Phaser.Input.Keyboard.JustDown(this.keys.tab)) {
            mouseVisible = !mouseVisible;
            this.input.setDefaultCursor(mouseVisible ? 'default' : 'none');
        }
    }
}