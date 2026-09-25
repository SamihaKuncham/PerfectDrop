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
        // CORE SETTINGS
        // =================================================

        this.gameWidth = 1024;
        this.gameHeight = 768;

        this.blockHeight = 32;
        this.startingBlockWidth = 260;

        this.blockSpeed = 280;
        this.speedIncrease = 8;
        this.maxBlockSpeed = 650;

        this.minimumBlockWidth = 18;

        // Start camera following when the moving block
        // reaches 65% of the visible screen.
        this.cameraFollowY =
            this.gameHeight * 0.65;

        this.perfectTolerance = 7;

        // =================================================
        // GAME STATE
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
        this.instructionHidden = false;

        // =================================================
        // VISUAL PALETTE
        // =================================================

        this.blockPalette = [
            {
                body: 0x38BDF8,
                shadow: 0x0EA5E9,
                highlight: 0xCFFAFE,
                glow: 0x38BDF8
            },

            {
                body: 0x8B5CF6,
                shadow: 0x6D28D9,
                highlight: 0xEDE9FE,
                glow: 0x8B5CF6
            },

            {
                body: 0xEC4899,
                shadow: 0xBE185D,
                highlight: 0xFCE7F3,
                glow: 0xEC4899
            },

            {
                body: 0xFB7185,
                shadow: 0xE11D48,
                highlight: 0xFFE4E6,
                glow: 0xFB7185
            },

            {
                body: 0xFBBF24,
                shadow: 0xD97706,
                highlight: 0xFEF3C7,
                glow: 0xFBBF24
            },

            {
                body: 0x34D399,
                shadow: 0x059669,
                highlight: 0xD1FAE5,
                glow: 0x34D399
            },

            {
                body: 0x22D3EE,
                shadow: 0x0891B2,
                highlight: 0xCFFAFE,
                glow: 0x22D3EE
            },

            {
                body: 0x6366F1,
                shadow: 0x4F46E5,
                highlight: 0xE0E7FF,
                glow: 0x6366F1
            }
        ];

        this.perfectPalette = {
            body: 0xFDE047,
            shadow: 0xCA8A04,
            highlight: 0xFEF9C3,
            glow: 0xFACC15
        };

        // =================================================
        // BACKGROUND
        // =================================================

        this.cameras.main.setBackgroundColor(
            '#070B18'
        );

        this.cameras.main.scrollY = 0;

        this.createBackground();

        // =================================================
        // HUD
        // =================================================

        this.createHUD();

        // =================================================
        // INITIAL BASE
        // =================================================

        this.baseX = 512;

        // First block is near the bottom.
        this.baseY = 700;

        this.baseWidth =
            this.startingBlockWidth;

        this.baseBlock =
            this.createBlock(
                this.baseX,
                this.baseY,
                this.baseWidth,
                this.getBlockPalette(0),
                false
            );

        this.blocks = [
            this.baseBlock
        ];

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

        // Mouse / touch
        this.input.on(
            'pointerdown',
            this.dropBlock,
            this
        );

        // Space
        if (this.input.keyboard)
        {
            this.input.keyboard.on(
                'keydown-SPACE',
                this.dropBlock,
                this
            );

            // Enter
            this.input.keyboard.on(
                'keydown-ENTER',
                this.dropBlock,
                this
            );
        }
    }

    // =====================================================
    // BACKGROUND
    // =====================================================

    createBackground ()
    {
        const background =
            this.add.graphics();

        background.setScrollFactor(0);

        /*
         * Layered color bands give us a soft gradient-like
         * background while remaining renderer-friendly.
         */

        const bands = [
            0x070B18,
            0x080C1D,
            0x090E22,
            0x0A1027,
            0x0B122C,
            0x0C1431,
            0x0D1635,
            0x0E1838,
            0x101A3C,
            0x111C40,
            0x121F44,
            0x142248
        ];

        const bandHeight =
            this.gameHeight /
            bands.length;

        for (
            let i = 0;
            i < bands.length;
            i++
        )
        {
            background.fillStyle(
                bands[i],
                1
            );

            background.fillRect(
                0,
                i * bandHeight,
                this.gameWidth,
                bandHeight + 2
            );
        }

        // -------------------------------------------------
        // Soft ambient glows
        // -------------------------------------------------

        background.fillStyle(
            0x6366F1,
            0.045
        );

        background.fillCircle(
            150,
            175,
            190
        );

        background.fillStyle(
            0x22D3EE,
            0.035
        );

        background.fillCircle(
            870,
            450,
            230
        );

        background.fillStyle(
            0xEC4899,
            0.025
        );

        background.fillCircle(
            520,
            750,
            280
        );

        // -------------------------------------------------
        // Tiny stars / particles
        // -------------------------------------------------

        const stars = [
            [84, 160, 2],
            [180, 280, 1],
            [286, 118, 2],
            [370, 210, 1],
            [462, 155, 1],
            [602, 245, 2],
            [700, 135, 1],
            [810, 205, 2],
            [932, 115, 1],
            [950, 320, 2],
            [120, 470, 1],
            [250, 390, 2],
            [760, 370, 1],
            [860, 520, 2],
            [680, 610, 1],
            [325, 575, 1]
        ];

        for (const star of stars)
        {
            background.fillStyle(
                0xFFFFFF,
                0.10 + Math.random() * 0.12
            );

            background.fillCircle(
                star[0],
                star[1],
                star[2]
            );
        }

        // Keep the background behind everything.
        background.setDepth(-100);
    }

    // =====================================================
    // HUD
    // =====================================================

        createHUD ()
    {
        // =================================================
        // MAIN HUD PANEL
        // =================================================

        this.hudPanel =
            this.add.graphics();

        this.hudPanel.setScrollFactor(0);

        this.hudPanel.fillStyle(
            0x111A32,
            0.82
        );

        this.hudPanel.fillRoundedRect(
            350,
            10,
            324,
            164,
            20
        );

        this.hudPanel.lineStyle(
            1,
            0xFFFFFF,
            0.10
        );

        this.hudPanel.strokeRoundedRect(
            350,
            10,
            324,
            164,
            20
        );

        // =================================================
        // TITLE
        // =================================================

        this.titleText =
            this.add.text(
                512,
                36,
                'PERFECT DROP',
                {
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        30,

                    color:
                        '#F8FAFC',

                    stroke:
                        '#050816',

                    strokeThickness:
                        3
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // SCORE
        // =================================================

        this.scoreText =
            this.add.text(
                512,
                80,
                '0',
                {
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        36,

                    color:
                        '#FFFFFF',

                    stroke:
                        '#050816',

                    strokeThickness:
                        3
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // COMBO
        // =================================================

        this.comboText =
            this.add.text(
                512,
                119,
                '',
                {
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        20,

                    color:
                        '#A78BFA'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // PERFECT STREAK
        // =================================================

        this.perfectStreakText =
            this.add.text(
                512,
                149,
                '',
                {
                    fontFamily:
                        'Arial',

                    fontSize:
                        16,

                    color:
                        '#FDE047'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // BEST SCORE PILL
        // =================================================

        this.bestPanel =
            this.add.graphics();

        this.bestPanel.setScrollFactor(0);

        this.bestPanel.fillStyle(
            0x111A32,
            0.88
        );

        this.bestPanel.fillRoundedRect(
            858,
            18,
            140,
            42,
            21
        );

        this.bestPanel.lineStyle(
            1,
            0xFFFFFF,
            0.10
        );

        this.bestPanel.strokeRoundedRect(
            858,
            18,
            140,
            42,
            21
        );

        this.bestText =
            this.add.text(
                928,
                39,
                `BEST ${this.highScore}`,
                {
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        16,

                    color:
                        '#CBD5E1'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // =================================================
        // BOTTOM INSTRUCTION
        // =================================================

        this.instructionPanel =
            this.add.graphics();

        this.instructionPanel.setScrollFactor(0);

        this.instructionPanel.fillStyle(
            0x0F172A,
            0.80
        );

        this.instructionPanel.fillRoundedRect(
            342,
            708,
            340,
            38,
            19
        );

        this.instructionPanel.lineStyle(
            1,
            0xFFFFFF,
            0.06
        );

        this.instructionPanel.strokeRoundedRect(
            342,
            708,
            340,
            38,
            19
        );

        this.instructionText =
            this.add.text(
                512,
                727,
                'TAP  •  CLICK  •  SPACE  •  ENTER',
                {
                    fontFamily:
                        'Arial',

                    fontSize:
                        15,

                    color:
                        '#CBD5E1'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);
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
            // Storage may be unavailable.
        }
    }

    // =====================================================
    // BLOCK PALETTE
    // =====================================================

    getBlockPalette (index)
    {
        return this.blockPalette[
            index %
            this.blockPalette.length
        ];
    }

    // =====================================================
    // CREATE BLOCK
    // =====================================================

    createBlock (
        x,
        y,
        width,
        palette,
        isMoving = false,
        isPerfect = false
    )
    {
        const container =
            this.add.container(
                x,
                y
            );

        container.blockWidth =
            width;

        container.blockHeight =
            this.blockHeight;

        container.palette =
            palette;

        container.isPerfect =
            isPerfect;

        container.visual =
            this.add.graphics();

        container.add(
            container.visual
        );

        this.drawBlockVisual(
            container
        );

        // Moving blocks have a little more presence.
        if (isMoving)
        {
            container.setAlpha(0.98);
        }

        return container;
    }

    // =====================================================
    // DRAW BLOCK VISUAL
    // =====================================================

    drawBlockVisual (
        block
    )
    {
        const graphics =
            block.visual;

        graphics.clear();

        const width =
            Math.max(
                18,
                block.blockWidth
            );

        const height =
            this.blockHeight;

        const radius =
            Math.min(
                8,
                height / 2,
                width / 2
            );

        const palette =
            block.palette;

        // -------------------------------------------------
        // Soft outer glow
        // -------------------------------------------------

        graphics.fillStyle(
            palette.glow,
            block.isPerfect
                ? 0.18
                : 0.055
        );

        graphics.fillRoundedRect(
            -width / 2 - 5,
            -height / 2 - 4,
            width + 10,
            height + 8,
            radius + 3
        );

        // -------------------------------------------------
        // Shadow
        // -------------------------------------------------

        graphics.fillStyle(
            0x000000,
            0.24
        );

        graphics.fillRoundedRect(
            -width / 2 + 2,
            -height / 2 + 4,
            width,
            height,
            radius
        );

        // -------------------------------------------------
        // Dark outer body
        // -------------------------------------------------

        graphics.fillStyle(
            palette.shadow,
            1
        );

        graphics.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            radius
        );

        // -------------------------------------------------
        // Main body
        // -------------------------------------------------

        graphics.fillStyle(
            palette.body,
            1
        );

        graphics.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height - 3,
            radius
        );

        // -------------------------------------------------
        // Soft top highlight
        // -------------------------------------------------

        const highlightWidth =
            Math.max(
                5,
                width - 10
            );

        graphics.fillStyle(
            palette.highlight,
            0.30
        );

        graphics.fillRoundedRect(
            -highlightWidth / 2,
            -height / 2 + 3,
            highlightWidth,
            4,
            2
        );

        // -------------------------------------------------
        // Tiny left-edge shine
        // -------------------------------------------------

        if (width > 24)
        {
            graphics.fillStyle(
                0xFFFFFF,
                0.10
            );

            graphics.fillRoundedRect(
                -width / 2 + 4,
                -height / 2 + 8,
                3,
                height - 16,
                1.5
            );
        }

        // -------------------------------------------------
        // Perfect block gets an extra edge
        // -------------------------------------------------

        if (block.isPerfect)
        {
            graphics.lineStyle(
                2,
                0xFFF7AE,
                0.75
            );

            graphics.strokeRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height - 1,
                radius
            );
        }
        else
        {
            graphics.lineStyle(
                1,
                0xFFFFFF,
                0.12
            );

            graphics.strokeRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height - 1,
                radius
            );
        }
    }

    // =====================================================
    // UPDATE BLOCK VISUAL
    // =====================================================

    updateBlockVisual (
        block,
        width,
        palette,
        isPerfect
    )
    {
        block.blockWidth =
            width;

        block.palette =
            palette;

        block.isPerfect =
            isPerfect;

        this.drawBlockVisual(
            block
        );
    }

    // =====================================================
    // MOVING BLOCK
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
            this.getBlockPalette(this.score),
            true,
            false
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
        // Move current block
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

            // Right wall
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

            // Left wall
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
        // Camera
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

        if (
            this.currentBlock.y <
            this.cameraFollowY
        )
        {
            targetScrollY =
                this.currentBlock.y -
                this.cameraFollowY;
        }

        // Never move downward.
        targetScrollY =
            Math.min(
                0,
                targetScrollY
            );

        const currentScrollY =
            this.cameras.main.scrollY;

        // Smooth follow.
        this.cameras.main.scrollY =
            currentScrollY +
            (
                targetScrollY -
                currentScrollY
            ) * 0.18;
    }

    // =====================================================
    // DROP
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
        // Previous block bounds
        // -------------------------------------------------

        const previousLeft =
            this.baseX -
            this.baseWidth / 2;

        const previousRight =
            this.baseX +
            this.baseWidth / 2;

        // -------------------------------------------------
        // Current block bounds
        // -------------------------------------------------

        const currentLeft =
            this.currentBlock.x -
            this.currentWidth / 2;

        const currentRight =
            this.currentBlock.x +
            this.currentWidth / 2;

        // -------------------------------------------------
        // Calculate overlap
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
        // Complete miss
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
        // Perfect check
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
            finalX =
                this.baseX;

            finalWidth =
                this.baseWidth;
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
        // Overhang
        // -------------------------------------------------

        let overhang = null;

        if (!isPerfect)
        {
            if (
                currentLeft <
                previousLeft
            )
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
            else if (
                currentRight >
                previousRight
            )
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
        // Landing position
        // -------------------------------------------------

        const targetY =
            this.baseY -
            this.blockHeight;

        // -------------------------------------------------
        // Landing animation
        // -------------------------------------------------

        this.tweens.add({
            targets:
                this.currentBlock,

            x:
                finalX,

            y:
                targetY,

            duration:
                150,

            ease:
                'Quad.easeOut',

            onComplete:
                () =>
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
        // Falling overhang
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
                    this.getBlockPalette(
                        this.score
                    ),
                    false,
                    false
                );

            fallingPiece.setDepth(1);

            this.tweens.add({
                targets:
                    fallingPiece,

                y:
                    fallingPiece.y +
                    360,

                angle:
                    this.movingDirection *
                    18,

                alpha:
                    0,

                duration:
                    520,

                ease:
                    'Cubic.easeIn',

                onComplete:
                    () =>
                    {
                        fallingPiece.destroy();
                    }
            });
        }

        // -------------------------------------------------
        // Final block appearance
        // -------------------------------------------------

        const finalPalette =
            isPerfect
                ? this.perfectPalette
                : this.getBlockPalette(
                    this.score
                );

        this.updateBlockVisual(
            this.currentBlock,
            finalWidth,
            finalPalette,
            isPerfect
        );

        this.currentBlock.setScale(
            1,
            1
        );

        // -------------------------------------------------
        // SCORE
        // -------------------------------------------------

        this.combo++;

        this.multiplier =
            Math.min(
                5,
                1 +
                Math.floor(
                    this.combo / 5
                )
            );

        // -------------------------------------------------
        // Perfect streak
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
        // Points
        // -------------------------------------------------

        let pointsEarned =
            this.multiplier;

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

        // Hide the controls hint after the
        // first successful placement.
        if (this.score > 0 && this.combo === 1)
        {
            this.hideInstructionHint();
        }

        // -------------------------------------------------
        // High score
        // -------------------------------------------------

        if (
            this.score >
            this.highScore
        )
        {
            this.highScore =
                this.score;

            this.newHighScore =
                true;

            this.saveHighScore();

            this.bestText.setText(
                `BEST ${this.highScore}`
            );
        }

        // -------------------------------------------------
        // Feedback
        // -------------------------------------------------

        this.updateComboUI();

        this.showPointsText(
            finalX,
            this.baseY -
            this.blockHeight,
            pointsEarned,
            isPerfect
        );

        this.createImpactParticles(
            finalX,
            this.baseY -
            this.blockHeight / 2,
            isPerfect
                ? this.perfectPalette.glow
                : finalPalette.body,
            isPerfect ? 14 : 8
        );

        // -------------------------------------------------
        // Landing squash/stretch
        // -------------------------------------------------

        this.tweens.add({
            targets:
                this.currentBlock,

            scaleX:
                1.06,

            scaleY:
                0.84,

            duration:
                65,

            ease:
                'Quad.easeOut',

            yoyo:
                true
        });

        // -------------------------------------------------
        // Camera feedback
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
                40,
                0.0008
            );
        }

        // -------------------------------------------------
        // Perfect text
        // -------------------------------------------------

        if (isPerfect)
        {
            this.showPerfectText();
        }

        // -------------------------------------------------
        // New base
        // -------------------------------------------------

        this.baseX =
            finalX;

        this.baseWidth =
            finalWidth;

        this.baseY -=
            this.blockHeight;

        // -------------------------------------------------
        // Difficulty
        // -------------------------------------------------

        this.blockSpeed +=
            this.speedIncrease;

        this.blockSpeed =
            Math.min(
                this.maxBlockSpeed,
                this.blockSpeed
            );

        // -------------------------------------------------
        // Next block
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

        hideInstructionHint ()
    {
        if (!this.instructionText)
        {
            return;
        }

        // Don't let this animation happen more than once.
        if (this.instructionHidden)
        {
            return;
        }

        this.instructionHidden = true;

        this.tweens.add({
            targets: [
                this.instructionText,
                this.instructionPanel
            ],

            alpha: 0,

            duration: 350,

            ease: 'Quad.easeOut',

            onComplete: () =>
            {
                this.instructionText.setVisible(false);
                this.instructionPanel.setVisible(false);
            }
        });
    }

        hideInstructionHint ()
    {
        if (
            !this.instructionText ||
            !this.instructionPanel
        )
        {
            return;
        }

        // Prevent this from happening more than once.
        if (this.instructionHidden)
        {
            return;
        }

        this.instructionHidden = true;

        this.tweens.add({
            targets: [
                this.instructionText,
                this.instructionPanel
            ],

            alpha: 0,

            duration: 350,

            ease: 'Quad.easeOut',

            onComplete: () =>
            {
                this.instructionText.setVisible(
                    false
                );

                this.instructionPanel.setVisible(
                    false
                );
            }
        });
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
                `COMBO  ×${this.multiplier}`
            );

            this.tweens.add({
                targets:
                    this.comboText,

                scale:
                    1.12,

                duration:
                    90,

                yoyo:
                    true,

                ease:
                    'Quad.easeOut'
            });
        }

        if (
            this.perfectStreak < 2
        )
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
    // PERFECT TEXT
    // =====================================================

    showPerfectText ()
    {
        const text =
            this.add.text(
                this.currentBlock.x,
                this.currentBlock.y - 34,
                'PERFECT!',
                {
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        25,

                    color:
                        '#FDE047',

                    stroke:
                        '#311B00',

                    strokeThickness:
                        4
                }
            )
            .setOrigin(0.5);

        this.tweens.add({
            targets:
                text,

            y:
                text.y - 42,

            alpha:
                0,

            scale:
                1.25,

            duration:
                550,

            ease:
                'Cubic.easeOut',

            onComplete:
                () =>
                {
                    text.destroy();
                }
        });
    }

    // =====================================================
    // POINTS TEXT
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
                    fontFamily:
                        'Arial Black',

                    fontSize:
                        18,

                    color:
                        isPerfect
                            ? '#FDE047'
                            : '#F8FAFC'
                }
            )
            .setOrigin(0.5);

        this.tweens.add({
            targets:
                text,

            y:
                y - 15,

            alpha:
                0,

            duration:
                450,

            ease:
                'Cubic.easeOut',

            onComplete:
                () =>
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
                    2 +
                    Math.random() * 2,
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
                targets:
                    particle,

                x:
                    particle.x +
                    distanceX,

                y:
                    particle.y +
                    distanceY,

                alpha:
                    0,

                scale:
                    0.2,

                duration:
                    350 +
                    Math.random() * 250,

                ease:
                    'Cubic.easeOut',

                onComplete:
                    () =>
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

        this.currentBlock =
            null;

        this.gameOver =
            true;

        this.input.off(
            'pointerdown',
            this.dropBlock,
            this
        );

        if (this.input.keyboard)
        {
            this.input.keyboard.off(
                'keydown-SPACE',
                this.dropBlock,
                this
            );

            this.input.keyboard.off(
                'keydown-ENTER',
                this.dropBlock,
                this
            );
        }

        // Stronger final shake.
        this.cameras.main.shake(
            120,
            0.003
        );

        this.tweens.add({
            targets:
                missedBlock,

            y:
                missedBlock.y +
                330,

            angle:
                this.movingDirection *
                25,

            alpha:
                0,

            duration:
                500,

            ease:
                'Cubic.easeIn',

            onComplete:
                () =>
                {
                    this.scene.start(
                        'GameOver',
                        {
                            score:
                                this.score,

                            highScore:
                                this.highScore,

                            newHighScore:
                                this.newHighScore
                        }
                    );
                }
        });
    }
}