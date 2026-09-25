import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // =================================================
        // SETTINGS
        // =================================================

        this.gameWidth = 1024;
        this.gameHeight = 768;

        this.blockHeight = 32;
        this.startingBlockWidth = 260;

        this.blockSpeed = 280;
        this.speedIncrease = 8;

        this.minimumBlockWidth = 18;

        // Camera follows the moving block after it reaches
        // roughly 65% of the visible screen.
        this.cameraFollowY =
            this.gameHeight * 0.65;

        // Perfect = center is within this many pixels.
        this.perfectTolerance = 7;

        // =================================================
        // SCORE / COMBO
        // =================================================

        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.perfectStreak = 0;

        this.highScore =
            this.getHighScore();

        this.newHighScore = false;

        this.gameOver = false;
        this.isDropping = false;

        // =================================================
        // COLORS
        // =================================================

        this.blockColors = [
            0x5B8DEF, // Electric blue
            0x8B5CF6, // Violet
            0xEC4899, // Pink
            0xF97316, // Tangerine
            0xFBBF24, // Amber
            0x10B981, // Emerald
            0x06B6D4, // Cyan
            0x6366F1  // Indigo
        ];

        // =================================================
        // CAMERA
        // =================================================

        this.cameras.main.setBackgroundColor(
            '#080C1A'
        );

        // -------------------------------------------------
        // Subtle background atmosphere
        // -------------------------------------------------

        const glow1 =
        this.add.circle(
            160,
            180,
            170,
            0x312E81,
            0.10
        );

        glow1.setScrollFactor(0);

        const glow2 =
        this.add.circle(
            880,
            500,
            220,
            0x0E7490,
            0.08
        );

        glow2.setScrollFactor(0);

        const glow3 =
        this.add.circle(
            500,
            900,
            260,
            0x7C3AED,
            0.06
        );

        glow3.setScrollFactor(0);

        this.cameras.main.scrollY = 0;

        // =================================================
        // UI
        // =================================================

        this.titleText =
            this.add.text(
                512,
                34,
                'PERFECT DROP',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 32,
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.scoreText =
            this.add.text(
                512,
                84,
                '0',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 34,
                    color: '#F8FAFC'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.bestText =
            this.add.text(
                960,
                38,
                `BEST ${this.highScore}`,
                {
                    fontFamily: 'Arial',
                    fontSize: 18,
                    color: '#94a3b8'
                }
            )
            .setOrigin(1, 0.5)
            .setScrollFactor(0);

        this.comboText =
            this.add.text(
                512,
                126,
                '',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 23,
                    color: '#A78BFA'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.perfectStreakText =
            this.add.text(
                512,
                154,
                '',
                {
                    fontFamily: 'Arial',
                    fontSize: 18,
                    color: '#facc15'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.instructionText =
            this.add.text(
                512,
                735,
                'TAP  •  CLICK  •  SPACE  •  ENTER',
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#cbd5e1'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // BASE BLOCK
        // =================================================

        this.baseX = 512;

        // First block starts at the bottom.
        this.baseY = 700;

        this.baseWidth =
            this.startingBlockWidth;

        this.baseBlock =
            this.createBlock(
                this.baseX,
                this.baseY,
                this.baseWidth,
                0x6366f1
            );

        // =================================================
        // FIRST MOVING BLOCK
        // =================================================

        this.currentWidth =
            this.startingBlockWidth;

        this.currentY =
            this.baseY -
            this.blockHeight;

        this.movingDirection = 1;

        this.currentBlock =
            this.createMovingBlock();

        // =================================================
        // INPUT
        // =================================================

        this.input.on(
            'pointerdown',
            this.dropBlock,
            this
        );
    

            // Keyboard controls
        this.input.keyboard.on(
            'keydown-SPACE',
            this.dropBlock,
            this
        );

        this.input.keyboard.on(
            'keydown-ENTER',
            this.dropBlock,
            this
        );

    }

    // =====================================================
    // HIGH SCORE
    // =====================================================

    getHighScore ()
    {
        try
        {
            return parseInt(
                localStorage.getItem(
                    'perfectDropHighScore'
                ) || '0',
                10
            );
        }
        catch (error)
        {
            return 0;
        }
    }

    saveHighScore ()
    {
        try
        {
            localStorage.setItem(
                'perfectDropHighScore',
                String(this.highScore)
            );
        }
        catch (error)
        {
            // Ignore storage errors.
        }
    }

    // =====================================================
    // CREATE BLOCK
    // =====================================================

    createBlock (
        x,
        y,
        width,
        color
    )
    {
        const block =
            this.add.rectangle(
                x,
                y,
                width,
                this.blockHeight,
                color
            );
    
        block.setStrokeStyle(
            2,
            0xffffff,
            0.22
        );
    
        return block;
    }

    // =====================================================
    // GET COLOR
    // =====================================================

    getBlockColor ()
    {
        const index =
            this.score %
            this.blockColors.length;

        return this.blockColors[index];
    }

    // =====================================================
    // CREATE MOVING BLOCK
    // =====================================================

    createMovingBlock ()
    {
        const halfWidth =
            this.currentWidth / 2;

        const startX =
            this.movingDirection === 1
                ? halfWidth
                : this.gameWidth - halfWidth;

        return this.createBlock(
            startX,
            this.currentY,
            this.currentWidth,
            this.getBlockColor()
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    update (time, delta)
    {
        if (this.gameOver)
        {
            return;
        }

        // -------------------------------------------------
        // MOVE BLOCK
        // -------------------------------------------------

        if (
            this.currentBlock &&
            !this.isDropping
        )
        {
            const movement =
                this.blockSpeed *
                (delta / 1000);

            this.currentBlock.x +=
                movement *
                this.movingDirection;

            const halfWidth =
                this.currentWidth / 2;

            // Right boundary
            if (
                this.currentBlock.x +
                halfWidth >=
                this.gameWidth
            )
            {
                this.currentBlock.x =
                    this.gameWidth -
                    halfWidth;

                this.movingDirection = -1;
            }

            // Left boundary
            if (
                this.currentBlock.x -
                halfWidth <=
                0
            )
            {
                this.currentBlock.x =
                    halfWidth;

                this.movingDirection = 1;
            }
        }

        // -------------------------------------------------
        // CAMERA
        // -------------------------------------------------

        this.updateCamera();
    }

    // =====================================================
    // CAMERA
    // =====================================================

    updateCamera ()
    {
        if (!this.currentBlock)
        {
            return;
        }

        let targetScrollY = 0;

        /*
         * No camera movement initially.
         *
         * Once the moving block rises above 65% of the
         * screen, the camera follows it.
         */

        if (
            this.currentBlock.y <
            this.cameraFollowY
        )
        {
            targetScrollY =
                this.currentBlock.y -
                this.cameraFollowY;
        }

        // Never move camera downward.
        targetScrollY =
            Math.min(
                0,
                targetScrollY
            );

        const currentScrollY =
            this.cameras.main.scrollY;

        // Smooth but responsive camera movement.
        this.cameras.main.scrollY =
            currentScrollY +
            (
                targetScrollY -
                currentScrollY
            ) * 0.18;
    }

    // =====================================================
    // DROP BLOCK
    // =====================================================

    dropBlock ()
    {
        if (
            this.gameOver ||
            !this.currentBlock ||
            this.isDropping
        )
        {
            return;
        }

        this.isDropping = true;

        // -------------------------------------------------
        // PREVIOUS BLOCK
        // -------------------------------------------------

        const previousLeft =
            this.baseX -
            this.baseWidth / 2;

        const previousRight =
            this.baseX +
            this.baseWidth / 2;

        // -------------------------------------------------
        // CURRENT BLOCK
        // -------------------------------------------------

        const currentLeft =
            this.currentBlock.x -
            this.currentWidth / 2;

        const currentRight =
            this.currentBlock.x +
            this.currentWidth / 2;

        // -------------------------------------------------
        // OVERLAP
        // -------------------------------------------------

        const overlapLeft =
            Math.max(
                previousLeft,
                currentLeft
            );

        const overlapRight =
            Math.min(
                previousRight,
                currentRight
            );

        const overlapWidth =
            overlapRight -
            overlapLeft;

        // -------------------------------------------------
        // COMPLETE MISS
        // -------------------------------------------------

        if (
            overlapWidth <=
            this.minimumBlockWidth
        )
        {
            this.missBlock();
            return;
        }

        // -------------------------------------------------
        // PERFECT
        // -------------------------------------------------

        const centerDifference =
            Math.abs(
                this.currentBlock.x -
                this.baseX
            );

        const isPerfect =
            centerDifference <=
            this.perfectTolerance;

        let finalX;
        let finalWidth;

        if (isPerfect)
        {
            finalX = this.baseX;
            finalWidth = this.baseWidth;
        }
        else
        {
            finalX =
                (
                    overlapLeft +
                    overlapRight
                ) / 2;

            finalWidth =
                overlapWidth;
        }

        // -------------------------------------------------
        // FIGURE OUT OVERHANG
        // -------------------------------------------------

        let overhang = null;

        if (!isPerfect)
        {
            if (currentLeft < previousLeft)
            {
                overhang = {
                    width:
                        previousLeft -
                        currentLeft,

                    x:
                        (
                            currentLeft +
                            previousLeft
                        ) / 2
                };
            }
            else if (currentRight > previousRight)
            {
                overhang = {
                    width:
                        currentRight -
                        previousRight,

                    x:
                        (
                            previousRight +
                            currentRight
                        ) / 2
                };
            }
        }

        // -------------------------------------------------
        // LANDING
        // -------------------------------------------------

        const targetY =
            this.baseY -
            this.blockHeight;

        this.tweens.add({
            targets: this.currentBlock,

            x: finalX,
            y: targetY,

            duration: 150,

            ease: 'Quad.easeOut',

            onComplete: () =>
            {
                this.finishDrop(
                    finalX,
                    finalWidth,
                    isPerfect,
                    overhang
                );
            }
        });
    }

    // =====================================================
    // FINISH DROP
    // =====================================================

    finishDrop (
        finalX,
        finalWidth,
        isPerfect,
        overhang
    )
    {
        if (this.gameOver)
        {
            return;
        }

        // -------------------------------------------------
        // OVERHANG FALL
        // -------------------------------------------------

        if (
            overhang &&
            overhang.width > 4
        )
        {
            const fallingPiece =
                this.createBlock(
                    overhang.x,
                    this.baseY -
                    this.blockHeight,
                    overhang.width,
                    this.getBlockColor()
                );

            this.tweens.add({
                targets: fallingPiece,

                y:
                    fallingPiece.y +
                    360,

                angle:
                    this.movingDirection *
                    18,

                alpha: 0,

                duration: 520,

                ease: 'Cubic.easeIn',

                onComplete: () =>
                {
                    fallingPiece.destroy();
                }
            });
        }

        // -------------------------------------------------
        // SET LANDED BLOCK SIZE
        // -------------------------------------------------

        this.currentBlock.setSize(
            finalWidth,
            this.blockHeight
        );

        this.currentBlock.x =
            finalX;

        // Perfect blocks become gold.
        if (isPerfect)
        {
            this.currentBlock.setFillStyle(
                0xFDE047
            );
        }
        else
        {
            this.currentBlock.setFillStyle(
                this.getBlockColor()
            );
        }

        // -------------------------------------------------
        // COMBO
        // -------------------------------------------------

        this.combo++;

        /*
         * Every 5 consecutive successful drops:
         *
         * 1x → 2x → 3x → 4x → 5x
         */

        this.multiplier =
            Math.min(
                5,
                1 +
                Math.floor(
                    this.combo / 5
                )
            );

        // -------------------------------------------------
        // PERFECT STREAK
        // -------------------------------------------------

        if (isPerfect)
        {
            this.perfectStreak++;
        }
        else
        {
            this.perfectStreak = 0;
        }

        // -------------------------------------------------
        // SCORE
        // -------------------------------------------------

        let pointsEarned =
            this.multiplier;

        /*
         * Perfect streak adds bonus points after the
         * first perfect.
         *
         * 1st perfect: +0
         * 2nd perfect: +1
         * 3rd+ perfect: +2
         */

        if (isPerfect)
        {
            pointsEarned +=
                Math.min(
                    2,
                    Math.max(
                        0,
                        this.perfectStreak - 1
                    )
                );
        }

        this.score +=
            pointsEarned;

        this.scoreText.setText(
            String(this.score)
        );

        // -------------------------------------------------
        // HIGH SCORE
        // -------------------------------------------------

        if (
            this.score >
            this.highScore
        )
        {
            this.highScore =
                this.score;

            this.newHighScore = true;

            this.saveHighScore();

            this.bestText.setText(
                `BEST ${this.highScore}`
            );
        }

        // -------------------------------------------------
        // UI FEEDBACK
        // -------------------------------------------------

        this.updateComboUI();

        this.showPointsText(
            finalX,
            this.baseY -
            this.blockHeight,
            pointsEarned,
            isPerfect
        );

        // -------------------------------------------------
        // PARTICLES
        // -------------------------------------------------

        this.createImpactParticles(
            finalX,
            this.baseY -
            this.blockHeight / 2,
            isPerfect
                ? 0xfacc15
                : this.getBlockColor(),
            isPerfect ? 12 : 7
        );

        // -------------------------------------------------
        // SCREEN SHAKE
        // -------------------------------------------------

        if (isPerfect)
        {
            this.cameras.main.shake(
                70,
                0.0015
            );
        }
        else
        {
            this.cameras.main.shake(
                45,
                0.001
            );
        }

        // -------------------------------------------------
        // PERFECT TEXT
        // -------------------------------------------------

        if (isPerfect)
        {
            this.showPerfectText();
        }

        // -------------------------------------------------
        // UPDATE BASE
        // -------------------------------------------------

        this.baseX =
            finalX;

        this.baseWidth =
            finalWidth;

        this.baseY -=
            this.blockHeight;

        // -------------------------------------------------
        // DIFFICULTY
        // -------------------------------------------------

        this.blockSpeed +=
            this.speedIncrease;

        // Slightly limit maximum speed.
        this.blockSpeed =
            Math.min(
                650,
                this.blockSpeed
            );

        // -------------------------------------------------
        // CREATE NEXT BLOCK
        // -------------------------------------------------

        this.currentWidth =
            finalWidth;

        this.currentY =
            this.baseY -
            this.blockHeight;

        this.movingDirection *= -1;

        this.currentBlock =
            this.createMovingBlock();

        this.isDropping = false;
    }

    // =====================================================
    // COMBO UI
    // =====================================================

    updateComboUI ()
    {
        if (this.combo < 2)
        {
            this.comboText.setText('');
        }
        else
        {
            this.comboText.setText(
                `COMBO  x${this.multiplier}`
            );

            this.tweens.add({
                targets: this.comboText,

                scale: 1.2,

                duration: 90,

                yoyo: true,

                ease: 'Quad.easeOut'
            });
        }

        if (this.perfectStreak < 2)
        {
            this.perfectStreakText.setText('');
        }
        else
        {
            this.perfectStreakText.setText(
                `PERFECT STREAK  ${this.perfectStreak}`
            );
        }
    }

    // =====================================================
    // PERFECT FEEDBACK
    // =====================================================

    showPerfectText ()
    {
        const text =
            this.add.text(
                this.currentBlock.x,
                this.currentBlock.y - 30,
                'PERFECT!',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 24,
                    color: '#facc15',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            )
            .setOrigin(0.5);

        this.tweens.add({
            targets: text,

            y:
                text.y - 40,

            alpha: 0,

            scale: 1.25,

            duration: 550,

            ease: 'Cubic.easeOut',

            onComplete: () =>
            {
                text.destroy();
            }
        });
    }

    // =====================================================
    // POINTS FEEDBACK
    // =====================================================

    showPointsText (
        x,
        y,
        points,
        isPerfect
    )
    {
        const text =
            this.add.text(
                x,
                y + 20,
                `+${points}`,
                {
                    fontFamily: 'Arial Black',
                    fontSize: 18,
                    color:
                        isPerfect
                            ? '#facc15'
                            : '#ffffff'
                }
            )
            .setOrigin(0.5);

        this.tweens.add({
            targets: text,

            y: y - 15,

            alpha: 0,

            duration: 450,

            ease: 'Cubic.easeOut',

            onComplete: () =>
            {
                text.destroy();
            }
        });
    }

    // =====================================================
    // PARTICLES
    // =====================================================

    createImpactParticles (
        x,
        y,
        color,
        count
    )
    {
        for (
            let i = 0;
            i < count;
            i++
        )
        {
            const particle =
                this.add.circle(
                    x,
                    y,
                    2 + Math.random() * 2,
                    color
                );

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                50 +
                Math.random() *
                120;

            const distanceX =
                Math.cos(angle) *
                speed;

            const distanceY =
                Math.sin(angle) *
                speed;

            this.tweens.add({
                targets: particle,

                x:
                    particle.x +
                    distanceX,

                y:
                    particle.y +
                    distanceY,

                alpha: 0,

                scale: 0.2,

                duration:
                    350 +
                    Math.random() * 250,

                ease: 'Cubic.easeOut',

                onComplete: () =>
                {
                    particle.destroy();
                }
            });
        }
    }

    // =====================================================
    // MISS
    // =====================================================

    missBlock ()
    {
        const missedBlock =
            this.currentBlock;

        this.currentBlock = null;

        this.gameOver = true;

        this.input.off(
            'pointerdown',
            this.dropBlock,
            this
        );

        // Stronger shake for the final miss.
        this.cameras.main.shake(
            120,
            0.003
        );

        this.tweens.add({
            targets: missedBlock,

            y:
                missedBlock.y +
                330,

            angle:
                this.movingDirection *
                25,

            alpha: 0,

            duration: 500,

            ease: 'Cubic.easeIn',

            onComplete: () =>
            {
                this.scene.start(
                    'GameOver',
                    {
                        score: this.score,
                        highScore: this.highScore,
                        newHighScore:
                            this.newHighScore
                    }
                );
            }
        });
    }
}