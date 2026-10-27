<script>
    import { settingsStore } from "../stores/settingsStore";
    import { fade } from "svelte/transition";
    export let onStartGame;

    const difficultyText = {
        normal: "Normal rules with three redeals allowed",
        easy: "Easier rules with unlimited redeals",
    };

    function handleStartGame() {
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
        background: rgba(0, 31, 27, 0.72);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
        backdrop-filter: blur(6px);
        box-sizing: border-box;
    }

    .welcome-content {
        width: min(100%, 440px);
        background: linear-gradient(155deg, #24564b, #183d37);
        padding: clamp(24px, 6vw, 40px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 18px;
        text-align: center;
        color: white;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
        box-sizing: border-box;
    }

    h1 {
        margin: 0;
        font-size: clamp(2.2rem, 8vw, 3.2rem);
        letter-spacing: 0.04em;
    }

    .settings {
        margin: 28px 0;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .setting-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
    }

    .setting-group > label:first-child {
        font-weight: 600;
    }

    .start-btn {
        width: 100%;
        padding: 0.85rem 2rem;
        font-size: 1.2rem;
        font-weight: 700;
        background: #27a767;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    }

    .start-btn:hover {
        background: #2fbd78;
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.26);
    }

    .start-btn:focus-visible {
        outline: 3px solid #ffe27a;
        outline-offset: 3px;
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

    @media (max-width: 420px) {
        .setting-group {
            gap: 10px;
        }

        .radio-group {
            gap: 12px;
            margin-left: 0;
        }
    }
</style>
