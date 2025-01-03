<script>
    import { settingsStore } from "../stores/settingsStore";
    import { gameStore } from "../stores/gameStore";
    import { fade } from "svelte/transition";
    export let onStartGame;

    const difficultyText = {
        normal: "Normal rules with three redeals allowed",
        easy: "Easier rules with unlimited redeals",
    };

    function handleStartGame() {
        gameStore.dealInitialCards();
        gameStore.newGame($settingsStore.difficulty);
        onStartGame();
    }

    function handleDifficultyChange(difficulty) {
        settingsStore.setDifficulty(difficulty);
    }

    function handleTimerToggle() {
        settingsStore.toggleTimer();
    }
</script>

<div class="welcome-overlay">
    <div class="welcome-content">
        <h1>Solitaire</h1>
        <div class="settings">
            <div class="setting-group difficulty-section">
                <label for="difficulty-normal">Difficulty:</label>
                <div
                    class="radio-group"
                    role="radiogroup"
                    aria-labelledby="difficulty-label"
                >
                    <label class="radio-label">
                        <input
                            id="difficulty-normal"
                            type="radio"
                            name="difficulty"
                            value="normal"
                            aria-labelledby="difficulty-label"
                            checked={$settingsStore.difficulty === "normal"}
                            on:change={() => handleDifficultyChange("normal")}
                        />
                        <span class="radio-text">Normal</span>
                    </label>
                    <label class="radio-label">
                        <input
                            type="radio"
                            name="difficulty"
                            value="easy"
                            checked={$settingsStore.difficulty === "easy"}
                            on:change={() => handleDifficultyChange("easy")}
                        />
                        <span class="radio-text">Easier</span>
                    </label>
                </div>
                {#key $settingsStore.difficulty}
                    <div class="difficulty-description" in:fade>
                        {difficultyText[$settingsStore.difficulty]}
                    </div>
                {/key}
            </div>

            <div class="setting-group">
                <label id="timer-label" for="timer-toggle"
                    >Timer & Move count</label
                >
                <label class="toggle">
                    <input
                        id="timer-toggle"
                        type="checkbox"
                        checked={$settingsStore.timerEnabled}
                        on:change={handleTimerToggle}
                    />
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        <button class="start-btn" on:click={handleStartGame}>Start Game</button>
    </div>
</div>

<style>
    .welcome-overlay {
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

    .welcome-content {
        background: #2a4741;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .settings {
        margin: 2rem 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .setting-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
    }

    .start-btn {
        padding: 0.75rem 2rem;
        font-size: 1.2rem;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .start-btn:hover {
        background: #45a049;
    }

    .toggle {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #4caf50;
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }
    .radio-group {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-left: 1rem;
    }

    .radio-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .radio-label input[type="radio"] {
        appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid #4caf50;
        border-radius: 50%;
        margin: 0;
        cursor: pointer;
        position: relative;
    }

    .radio-label input[type="radio"]:checked::before {
        content: "";
        position: absolute;
        width: 12px;
        height: 12px;
        background: #4caf50;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .radio-text {
        font-size: 1rem;
        color: white;
    }

    .difficulty-section {
        flex-direction: column;
        align-items: center;
    }

    .difficulty-description {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 0.5rem;
        font-style: italic;
        text-align: center;
        min-height: 1.2em;
    }
</style>
