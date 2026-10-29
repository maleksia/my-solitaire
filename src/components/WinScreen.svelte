<script>
    import { statsStore } from "../stores/statsStore";
    import { gameStore } from "../stores/gameStore";

    export let onNewGame;
    export let showStats = true;

    const difficultyModes = [
        { key: "easy", label: "Easy" },
        { key: "normal", label: "Normal" }
    ];

    function handleNewGame() {
        onNewGame();
    }

    function formatTime(milliseconds) {
        return `${Math.floor(milliseconds / 60000)}:${Math.floor(
            (milliseconds % 60000) / 1000,
        )
            .toString()
            .padStart(2, "0")}`;
    }

    function formatWinRate(won, played) {
        return played === 0 ? "—" : `${((won / played) * 100).toFixed(1)}%`;
    }
</script>

{#if $gameStore.isGameWon || $gameStore.isGameEnded}
    <div
        class="win-overlay"
        on:click|stopPropagation
        on:keydown={(e) => e.key === "Escape" && handleNewGame()}
        role="dialog"
        aria-labelledby="win-title"
    >
        <div class="win-content">
            <h2 id="win-title">
                {$gameStore.isGameWon ? "Congratulations!" : "Game ended"}
            </h2>
            <p>
                {$gameStore.isGameWon
                    ? "You won the game!"
                    : "Here are your stats for this game."}
            </p>
            <div class="stats">
                {#if showStats}
                    <p>
                        Time: {formatTime($statsStore.currentGame.elapsedTime)}
                    </p>
                    <p>Moves: {$statsStore.currentGame.moves}</p>
                {/if}
                <p>Redeals used: {$statsStore.currentGame.redealsUsed}</p>
                <p>Games played: {$statsStore.gamesPlayed}</p>
                <p>Games won: {$statsStore.gamesWon}</p>
                <p>
                    Overall win rate: {formatWinRate(
                        $statsStore.gamesWon,
                        $statsStore.gamesPlayed,
                    )}
                </p>
            </div>
            <section class="lifetime-stats" aria-labelledby="lifetime-stats-title">
                <h3 id="lifetime-stats-title">Lifetime stats by difficulty</h3>
                <div class="mode-stats">
                    {#each difficultyModes as mode}
                        {@const modeStats = $statsStore.byDifficulty[mode.key]}
                        <article class="mode-card">
                            <h4>{mode.label}</h4>
                            <dl>
                                <div>
                                    <dt>Games played</dt>
                                    <dd>{modeStats.gamesPlayed}</dd>
                                </div>
                                <div>
                                    <dt>Games won</dt>
                                    <dd>{modeStats.gamesWon}</dd>
                                </div>
                                <div>
                                    <dt>Win rate</dt>
                                    <dd>
                                        {formatWinRate(
                                            modeStats.gamesWon,
                                            modeStats.gamesPlayed,
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Best winning time</dt>
                                    <dd>
                                        {modeStats.bestTimeMs === null
                                            ? "—"
                                            : formatTime(modeStats.bestTimeMs)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Fewest moves to win</dt>
                                    <dd>{modeStats.fewestMoves ?? "—"}</dd>
                                </div>
                            </dl>
                        </article>
                    {/each}
                </div>
            </section>
            <button class="new-game-btn" on:click={handleNewGame}>
                {$gameStore.isGameWon ? "Play Again" : "Start New Game"}
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
        width: min(720px, calc(100vw - 32px));
        max-height: 90vh;
        overflow-y: auto;
    }

    .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 8px;
        margin: 1.25rem 0;
    }

    .stats p {
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(0, 77, 64, 0.08);
        color: #2a4741;
        font-weight: 600;
    }

    .lifetime-stats h3 {
        margin: 0 0 0.75rem;
        color: #2a4741;
    }

    .mode-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 10px;
        margin-bottom: 1.25rem;
        text-align: left;
    }

    .mode-card {
        padding: 12px;
        border-radius: 8px;
        background: rgba(0, 77, 64, 0.06);
    }

    .mode-card h4 {
        margin: 0 0 8px;
        color: #2a4741;
        text-align: center;
    }

    .mode-card dl {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px 12px;
        margin: 0;
        font-size: 0.9rem;
    }

    .mode-card dl div {
        display: contents;
    }

    .mode-card dt {
        color: #52635f;
    }

    .mode-card dd {
        margin: 0;
        color: #2a4741;
        font-weight: 600;
        text-align: right;
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
