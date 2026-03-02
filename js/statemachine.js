// State Machine
export function createStates(player, currentSpeed) {
    return {
        idle: {
            onEnter() {
                player.play("idle", true);
            },
            onUpdate(scene) {
                // Attack
                const mouse = scene.input.activePointer;
                if (mouse.leftButtonDown() && scene.canAttack && mouse.button === 0) {
                    scene.canAttack = false;    // "Lock" the attack
                    return "attack";
                }
                // Reset Attack
                if (!mouse.leftButtonDown()) {
                    scene.canAttack = true;
                }
                // Jump
                if (scene.keys.jump.isDown && player.body.touching.down) return "jump";
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
                // Must-have Condition
                if (!player.body.touching.down) return "fall";
                // Attack
                const mouse = scene.input.activePointer;
                if (mouse.leftButtonDown() && scene.canAttack && mouse.button === 0) {
                    scene.canAttack = false;    // "Lock" the attack
                    return "attack";
                }
                // Reset Attack
                if (!mouse.leftButtonDown()) {
                    scene.canAttack = true;
                }
                // Jump
                if (scene.keys.jump.isDown) return "jump";
                // Fall
                if (player.body.velocity.y > 0) return "fall";
                // Crouch Walk
                if (scene.keys.crouch.isDown) return "crouch_walk";
                // Idle
                if (!(scene.keys.left.isDown || scene.keys.right.isDown)) return "idle";

                // Movement Logic
                if (scene.keys.left.isDown) {
                    player.x -= currentSpeed;
                    player.flipX = true;
                }
                else if (scene.keys.right.isDown) {
                    player.x += currentSpeed;
                    player.flipX = false;
                }
                return "run";
            },
            onExit() {
                player.setVelocityX(0);
            }
        },
        crouch: {
            onEnter() {
                player.play("crouch", true);
            },
            onUpdate(scene) {
                // Idle
                if (!scene.keys.crouch.isDown) return "idle";
                // Fall
                if (!player.body.touching.down) return "fall";
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
                // Fall
                if (!player.body.touching.down) return "fall";
                // Run
                if (!scene.keys.crouch.isDown) return "run";
                // Crouch
                if (!scene.keys.left.isDown && !scene.keys.right.isDown) return "crouch";

                // Slowed Movement
                const crouchSpeed = currentSpeed / 2;
                // Movement Logic
                if (scene.keys.left.isDown) {
                    player.x -= crouchSpeed;
                    player.flipX = true;
                }
                else if (scene.keys.right.isDown) {
                    player.x += crouchSpeed;
                    player.flipX = false;
                }
                // Crouch Walk
                return "crouch_walk";
            },
            onExit() {
                player.setVelocityX(0);
            }
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
                // Fall
                if (!player.body.touching.down) return "fall";
                // Stay in attack state until the animation is done
                if (this.isFinished) {
                    return "idle";
                }
                return "attack";
            },
            onExit() {
                this.isFinished = false;
            }
        },
        jump: {
            onEnter() {
                player.setVelocityY(-200);
                player.play("jump", true);
            },
            onUpdate(scene) {
                // Movement Logic
                if (scene.keys.left.isDown) {
                    player.x -= currentSpeed;
                    player.flipX = true;
                }
                else if (scene.keys.right.isDown) {
                    player.x += currentSpeed;
                    player.flipX = false;
                }
                // Fall
                if (player.body.velocity.y > 0) {
                    return "fall";
                }
                // Still going up
                return "jump";
            },
            onExit() {
                player.setVelocityX(0);
                player.play("jumpfalltransition", true);
            }
        },
        fall: {
            onEnter() {
                player.play("fall", true);
            },
            onUpdate(scene) {
                // Movement Logic
                if (scene.keys.left.isDown) {
                    player.x -= currentSpeed;
                    player.flipX = true;
                }
                else if (scene.keys.right.isDown) {
                    player.x += currentSpeed;
                    player.flipX = false;
                }
                // Landed
                if (player.body.touching.down) {
                    if (scene.keys.left.isDown || scene.keys.right.isDown) return "run";
                    return "idle";
                }
                return "fall"; // still falling
            },
            onExit() {
                player.setVelocityX(0);
            }
        }
    };
}