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
    import { settingsStore } from "./stores/settingsStore";
    import WelcomeScreen from "./components/WelcomeScreen.svelte";

    let showRules = false;
    let showWelcome = true;

    function initGame() {
        showWelcome = false;
        gameStore.dealInitialCards();
        gameStore.newGame($settingsStore.difficulty);
    }

    onMount(() => {
        layoutStore.updateLayout();
        window.addEventListener("resize", layoutStore.updateLayout);
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("resize", layoutStore.updateLayout);
            window.removeEventListener("keydown", handleKeydown);
        };
    });

    function handleRedeal() {
        console.log("Redeal clicked");
        if ($gameStore.redealsRemaining > 0) {
            console.log("Calling collectAndRedeal...");
            gameStore.collectAndRedeal();
        }
    }

    function handleBackgroundInteraction(event) {
        if (event.target === event.currentTarget) {
            gameStore.selectCard(null, null);
        }
    }

    function handleKeydown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBackgroundInteraction(event);
        }
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

    function handleNewGame() {
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
                    <Timer />
                    <div class="moves">
                        Moves: {$statsStore.currentGame.moves}
                    </div>
                    <button class="btn info" on:click={handleRulesToggle}
                        >Rules</button
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
                    disabled={$gameStore.difficulty === "normal" && $gameStore.redealsRemaining <= 0}
                >
                        Collect & Redeal ({$gameStore.difficulty === "easy"
                            ? "∞"
                            : $gameStore.redealsRemaining})
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
        <WinScreen {showWelcome} onNewGame={handleNewGame} />
        <Rules isOpen={showRules} on:close={() => (showRules = false)} />
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
    }

    main {
        min-height: 100vh;
        background: linear-gradient(135deg, #004d40 0%, #00695c 100%);
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
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
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
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #4a6964;
        color: white;
        cursor: pointer;
        font-size: 1em;
        transition: background 0.2s;
    }

    .btn:hover {
        background: #5a7974;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn.primary {
        background: #28a745;
    }

    .btn.redeal {
        background: #dc3545;
    }

    .btn.info {
        background: #17a2b8;
    }

    .play-area {
        display: flex;
        flex-direction: column;
        gap: 40px;
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
        font-size: 1.5em;
        font-family: monospace;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin: 0 10px;
    }

    @media (max-width: 768px) {
        .game-header {
            flex-direction: column;
            gap: 20px;
        }

        .controls-area {
            flex-wrap: wrap;
            justify-content: center;
        }
    }

    @media (max-width: 768px) {
        main {
            padding: 10px 5px;
        }

        .game-header {
            flex-direction: column;
            gap: 10px;
        }

        .stats-area {
            font-size: 0.9em;
        }

        .btn {
            padding: 6px 12px;
            font-size: 0.9em;
        }
    }

    @media (max-width: 768px) {
        main {
            padding: 5px 2px;
        }

        .game-header {
            flex-direction: column;
            gap: 10px;
            padding: 10px 5px;
        }

        .tableau {
            gap: 5px;  /* Reduce gap between columns */
            padding: 0 2px;  /* Add minimal padding */
            justify-content: space-between;  /* Distribute space evenly */
        }

        .end-stacks {
            gap: 5px;
        }
    }
</style>
