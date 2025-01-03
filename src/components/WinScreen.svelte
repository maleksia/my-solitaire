<script>
    import { statsStore } from "../stores/statsStore";
    import { gameStore } from "../stores/gameStore";

    export let onNewGame;
    export let showWelcome;

    function handleNewGame() {
        showWelcome = true;
        onNewGame();
    }
</script>

{#if $gameStore.isGameWon}
    <div
        class="win-overlay"
        on:click|stopPropagation
        on:keydown={(e) => e.key === "Escape" && handleNewGame()}
        role="dialog"
        aria-labelledby="win-title"
    >
        <div class="win-content">
            <h2 id="win-title">Congratulations!</h2>
            <p>You won the game!</p>
            <div class="stats">
                <p>
                    Time: {Math.floor(
                        $statsStore.currentGame.elapsedTime / 60000,
                    )}:{Math.floor(
                        ($statsStore.currentGame.elapsedTime % 60000) / 1000,
                    )
                        .toString()
                        .padStart(2, "0")}
                </p>
                <p>Moves: {$statsStore.currentGame.moves}</p>
            </div>
            <button class="new-game-btn" on:click={handleNewGame}>
                Play Again
            </button>
        </div>
    </div>
{/if}

<style>
    .win-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .win-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
    }

    .stats {
        margin: 1rem 0;
    }

    .new-game-btn {
        padding: 0.5rem 1rem;
        font-size: 1.2rem;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>
