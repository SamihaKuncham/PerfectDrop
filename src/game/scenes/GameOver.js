import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create (data)
    {
        // ================================================
        // BACKGROUND
        // ================================================

        this.cameras.main.setBackgroundColor(
            '#080C1A'
        );

        const score =
            data.score ?? 0;

        const highScore =
            data.highScore ?? 0;

        const newHighScore =
            data.newHighScore ?? false;

        // ================================================
        // PANEL
        // ================================================

        this.add.rectangle(
            512,
            390,
            600,
            500,
            0x10162A,
            0.96
        )
        .setStrokeStyle(
            2,
            0x3341A0,
            1
        );

        // ================================================
        // TITLE
        // ================================================

        this.add.text(
            512,
            205,
            'GAME OVER',
            {
                fontFamily: 'Arial Black',
                fontSize: 58,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // ================================================
        // NEW HIGH SCORE
        // ================================================

        if (newHighScore)
        {
            const recordText =
                this.add.text(
                    512,
                    285,
                    'NEW HIGH SCORE!',
                    {
                        fontFamily: 'Arial Black',
                        fontSize: 25,
                        color: '#FDE047'
                    }
                )
                .setOrigin(0.5);

            this.tweens.add({
                targets: recordText,

                scale: 1.08,

                duration: 500,

                yoyo: true,

                repeat: -1,

                ease: 'Sine.easeInOut'
            });
        }

        // ================================================
        // SCORE LABEL
        // ================================================

        this.add.text(
            512,
            350,
            'SCORE',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#94a3b8'
            }
        ).setOrigin(0.5);

        // ================================================
        // SCORE
        // ================================================

        this.add.text(
            512,
            405,
            String(score),
            {
                fontFamily: 'Arial Black',
                fontSize: 70,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // ================================================
        // BEST SCORE
        // ================================================

        this.add.text(
            512,
            480,
            `BEST  ${highScore}`,
            {
                fontFamily: 'Arial',
                fontSize: 23,
                color: '#64748b'
            }
        ).setOrigin(0.5);

        // ================================================
        // PLAY AGAIN BUTTON
        // ================================================

        const playButton =
            this.add.rectangle(
                512,
                570,
                270,
                65,
                0x6366F1,
            )
            .setStrokeStyle(
                2,
                0x818CF8,
                1
            )
            .setInteractive({
                useHandCursor: true
            });

        const playText =
            this.add.text(
                512,
                570,
                'PLAY AGAIN',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 24,
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

        // ================================================
        // BUTTON HOVER
        // ================================================

        playButton.on(
            'pointerover',
            () =>
            {
                playButton.setFillStyle(
                    0x818CF8
                );
            }
        );

        playButton.on(
            'pointerout',
            () =>
            {
                playButton.setFillStyle(
                    0x6366F1
                );
            }
        );

        // ================================================
        // PLAY AGAIN
        // ================================================

        playButton.on(
            'pointerdown',
            () =>
            {
                this.scene.start('Game');
            }
        );

        // Make the PLAY AGAIN text clickable too.
        playText.setInteractive({
            useHandCursor: true
        });

        playText.on(
            'pointerdown',
            () =>
            {
                this.scene.start('Game');
            }
        );

        // ================================================
        // MAIN MENU
        // ================================================

        const menuButton =
            this.add.text(
                512,
                650,
                'MAIN MENU',
                {
                    fontFamily: 'Arial',
                    fontSize: 18,
                    color: '#94a3b8'
                }
            )
            .setOrigin(0.5)
            .setInteractive({
                useHandCursor: true
            });

        menuButton.on(
            'pointerover',
            () =>
            {
                menuButton.setColor(
                    '#ffffff'
                );
            }
        );

        menuButton.on(
            'pointerout',
            () =>
            {
                menuButton.setColor(
                    '#94a3b8'
                );
            }
        );

        menuButton.on(
            'pointerdown',
            () =>
            {
                this.scene.start(
                    'MainMenu'
                );
            }
        );
    }
}