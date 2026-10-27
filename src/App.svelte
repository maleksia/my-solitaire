<script>
    import { onMount } from "svelte";
    import { gameStore } from "./stores/gameStore";
    import { layoutStore } from "./stores/layoutStore";
    import { statsStore } from "./stores/statsStore";
    import TableauColumn from "./components/TableauColumn.svelte";
    import EndStack from "./components/EndStack.svelte";
    import Timer from "./components/Timer.svelte";
    import Rules from "./components/Rules.svelte";
    import WinScreen from "./components/WinScreen.svelte";
    import {
        settingsStore,
        DECK_THEMES,
        PLAY_AREA_THEMES
    } from "./stores/settingsStore";
    import WelcomeScreen from "./components/WelcomeScreen.svelte";
    import PauseOverlay from "./components/PauseOverlay.svelte";
    import SettingsPanel from "./components/SettingsPanel.svelte";

    let showRules = false;
    let showSettings = false;
    let showWelcome = true;

    function initGame() {
        showWelcome = false;
        gameStore.newGame($settingsStore.difficulty);
    }

    onMount(() => {
        layoutStore.updateLayout();
        const unsubscribeSettings = settingsStore.subscribe(settings => {
            layoutStore.setCardScale(settings.cardScale);
            const deckTheme = DECK_THEMES[settings.deckTheme];
            const playAreaTheme = PLAY_AREA_THEMES[settings.playAreaTheme];
            document.documentElement.style.setProperty("--card-back-light", deckTheme.light);
            document.documentElement.style.setProperty("--card-back-dark", deckTheme.dark);
            document.documentElement.style.setProperty("--felt-start", playAreaTheme.start);
            document.documentElement.style.setProperty("--felt-end", playAreaTheme.end);
        });
        window.addEventListener("resize", layoutStore.updateLayout);
        window.addEventListener("keydown", handleKeydown);
        return () => {
            unsubscribeSettings();
            window.removeEventListener("resize", layoutStore.updateLayout);
            window.removeEventListener("keydown", handleKeydown);
        };
    });

    function handleRedeal() {
        if ($gameStore.redealsRemaining > 0) {
            gameStore.collectAndRedeal();
        }
    }

    function handleKeydown(event) {
        if (event.ctrlKey) {
            if (event.key === "z") {
                event.preventDefault();
                handleUndo();
            } else if (event.key === "y") {
                event.preventDefault();
                handleRedo();
            }
        }
    }
    function handleUndo() {
        gameStore.undo();
    }

    function handleRedo() {
        gameStore.redo();
    }

    function handleNewGame(fromWinScreen = false) {
        if (fromWinScreen) {
            gameStore.newGame($settingsStore.difficulty);
            showWelcome = false;
            return;
        }

        if (confirm("Start a new game? Current progress will be lost.")) {
            statsStore.reset();
            showWelcome = true;
        }
    }

    function handleRulesToggle() {
        showRules = !showRules;
    }
</script>

<main>
    {#if showWelcome}
        <WelcomeScreen onStartGame={initGame} />
    {:else}
        <div class="game-container">
            <header class="game-header">
                <div class="stats-area">
                    {#if $settingsStore.timerEnabled}
                        <Timer />
                        <div class="moves">
                            Moves: {$statsStore.currentGame.moves}
                        </div>
                    {/if}
                    <button class="btn info" on:click={handleRulesToggle}
                        >Rules</button
                    >
                    <button class="btn" on:click={() => (showSettings = true)}
                        >Settings</button
                    >
                </div>
                <div class="controls-area">
                    <button class="btn primary" on:click={handleNewGame}
                        >New Game</button
                    >
                    <button class="btn" on:click={() => gameStore.undo()}
                        >Undo</button
                    >
                    <button
                        class="btn redeal"
                        on:click={handleRedeal}
                        disabled={$gameStore.difficulty === "normal" &&
                            $gameStore.redealsRemaining <= 0}
                    >
                        Collect & Redeal ({$gameStore.difficulty === "easy"
                            ? "∞"
                            : $gameStore.redealsRemaining})
                    </button>
                    <button class="btn" on:click={() => gameStore.togglePause()}>
                        {$gameStore.isPaused ? 'Resume' : 'Pause'}
                    </button>
                </div>
            </header>

            <div class="play-area">
                <div class="end-stacks">
                    {#each $gameStore.endStacks as stack, i}
                        <EndStack {stack} stackIndex={i} />
                    {/each}
                </div>
                <div class="tableau">
                    {#each $gameStore.tableau as column, i}
                        <TableauColumn {column} columnIndex={i} />
                    {/each}
                </div>
            </div>
        </div>
        <WinScreen
            {showWelcome}
            showStats={$settingsStore.timerEnabled}
            onNewGame={() => handleNewGame(true)}
        />
        <Rules isOpen={showRules} on:close={() => (showRules = false)} />
        {#if showSettings}
            <SettingsPanel on:close={() => (showSettings = false)} />
        {/if}
        <PauseOverlay />
    {/if}
</main>

<style>
    :global(html) {
        min-height: 100%;
        background: linear-gradient(
            135deg,
            var(--felt-start, #004d40) 0%,
            var(--felt-end, #00695c) 100%
        ) fixed;
        background-color: var(--felt-start, #004d40);
    }

    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        background: transparent;
    }

    main {
        min-height: 100vh;
        background: transparent;
        padding: 20px;
        box-sizing: border-box;
    }

    .game-container {
        position: relative;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        backdrop-filter: blur(12px);
        margin-bottom: 20px;
    }

    .stats-area {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    .controls-area {
        display: flex;
        gap: 10px;
    }

    .btn {
        padding: 9px 15px;
        border: none;
        border-radius: 8px;
        background: #345b54;
        color: white;
        cursor: pointer;
        font-size: 0.94em;
        font-weight: 600;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.14);
        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    }

    .btn:hover {
        background: #426d65;
        transform: translateY(-1px);
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
    }

    .btn:focus-visible {
        outline: 3px solid rgba(255, 215, 0, 0.9);
        outline-offset: 2px;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .btn.primary {
        background: #218c54;
    }

    .btn.redeal {
        background: #a8474d;
    }

    .btn.info {
        background: #247f8c;
    }

    .play-area {
        display: flex;
        flex-direction: column;
        gap: clamp(24px, 4vw, 40px);
        padding: 20px 12px 28px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        background: rgba(0, 55, 47, 0.16);
        box-sizing: border-box;
    }

    .end-stacks {
        display: flex;
        gap: 20px;
        justify-content: center;
    }

    .tableau {
        display: flex;
        gap: 20px;
        justify-content: center;
    }

    .moves {
        font-size: 1.15em;
        font-family: monospace;
        padding: 9px 12px;
        background: rgba(0, 0, 0, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.94);
    }

    @media (max-width: 768px) {
        main {
            padding: 10px 8px;
        }

        .game-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 12px;
            margin-bottom: 12px;
        }

        .stats-area {
            font-size: 0.9em;
            justify-content: center;
            flex-wrap: wrap;
        }

        .controls-area {
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
        }

        .btn {
            padding: 6px 12px;
            font-size: 0.9em;
        }

        .tableau {
            gap: 0;
            padding: 0;
            justify-content: flex-start;
            width: max-content;
            min-width: 100%;
            margin: 0;
        }

        .end-stacks {
            gap: 4px;
            padding: 0;
            justify-content: center;
        }

        .play-area {
            width: 100%;
            min-height: 62vh;
            padding: 12px 4px 20px;
            gap: 20px;
            overflow-x: auto;
        }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
        main {
            padding: 15px 10px;
        }

        .game-header {
            padding: 15px;
            gap: 15px;
        }

        .tableau {
            gap: 10px;
            padding: 0 5px;
        }

        .end-stacks {
            gap: 10px;
        }

        .btn {
            padding: 7px 14px;
            font-size: 0.95em;
        }

        .stats-area {
            font-size: 0.95em;
        }
    }
</style>