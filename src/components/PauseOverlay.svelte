<script>
    import { gameStore } from '../stores/gameStore';
</script>

{#if $gameStore.isPaused}
    <div class="pause-overlay">
        <div class="pause-content">
            <h2>Game Paused</h2>
            <button on:click={() => gameStore.togglePause()}>Resume</button>
        </div>
    </div>
{/if}

<style>
    .pause-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .pause-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
    }

    button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #4a6964;
        color: white;
        cursor: pointer;
        font-size: 1em;
        margin-top: 1rem;
    }

    button:hover {
        background: #5a7974;
    }
</style>
