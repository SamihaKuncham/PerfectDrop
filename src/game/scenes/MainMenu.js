import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // ================================================
        // BACKGROUND
        // ================================================

        this.add.image(
            512,
            384,
            'background'
        );

        // ================================================
        // LOGO
        // ================================================

        this.add.image(
            512,
            260,
            'logo'
        );

        // ================================================
        // TITLE
        // ================================================

        this.add.text(
            512,
            405,
            'PERFECT DROP',
            {
                fontFamily: 'Arial Black',
                fontSize: 42,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5);

        // ================================================
        // HIGH SCORE
        // ================================================

        let highScore = 0;

        try
        {
            highScore =
                parseInt(
                    localStorage.getItem(
                        'perfectDropHighScore'
                    ) || '0',
                    10
                );
        }
        catch (error)
        {
            highScore = 0;
        }

        this.add.text(
            512,
            460,
            `BEST SCORE  ${highScore}`,
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#cbd5e1'
            }
        ).setOrigin(0.5);

        // ================================================
        // PLAY BUTTON
        // ================================================

        const playButton =
            this.add.rectangle(
                512,
                545,
                280,
                75,
                0x4f46e5
            )
            .setStrokeStyle(
                2,
                0x818cf8,
                1
            )
            .setInteractive({
                useHandCursor: true
            });

        const playText =
            this.add.text(
                512,
                545,
                'PLAY',
                {
                    fontFamily: 'Arial Black',
                    fontSize: 30,
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

        // ================================================
        // HOVER
        // ================================================

        playButton.on(
            'pointerover',
            () =>
            {
                playButton.setFillStyle(
                    0x6366f1
                );
            }
        );

        playButton.on(
            'pointerout',
            () =>
            {
                playButton.setFillStyle(
                    0x4f46e5
                );
            }
        );

        // ================================================
        // START GAME
        // ================================================

        playButton.on(
            'pointerdown',
            () =>
            {
                this.scene.start('Game');
            }
        );

        // Clicking the word PLAY works too.
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
        // INSTRUCTIONS
        // ================================================

        this.add.text(
            512,
            655,
            'Tap the moving block to build your tower',
            {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#cbd5e1'
            }
        ).setOrigin(0.5);
    }
}