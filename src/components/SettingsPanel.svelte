<script>
    import { createEventDispatcher } from "svelte";
    import { settingsStore, DECK_THEMES, PLAY_AREA_THEMES } from "../stores/settingsStore";

    const dispatch = createEventDispatcher();
    const cardSizes = [
        { value: 0.8, label: "Small" },
        { value: 0.9, label: "Compact" },
        { value: 1, label: "Standard" },
        { value: 1.1, label: "Large" },
        { value: 1.2, label: "Extra large" }
    ];

    function close() {
        dispatch("close");
    }

    function setCardScale(event) {
        settingsStore.setCardScale(Number(event.currentTarget.value));
    }
</script>

<svelte:window on:keydown={(event) => event.key === "Escape" && close()} />

<div class="settings-backdrop" on:click|self={close} role="presentation">
    <section
        class="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
    >
        <header class="panel-header">
            <div>
                <p class="eyebrow">PERSONALIZE YOUR GAME</p>
                <h2 id="settings-title">Settings</h2>
            </div>
            <button class="close-button" aria-label="Close settings" on:click={close}>×</button>
        </header>

        <label class="setting-row">
            <span>
                <strong>Card deck</strong>
                <small>Choose the back design for your cards</small>
            </span>
            <select
                aria-label="Card deck theme"
                value={$settingsStore.deckTheme}
                on:change={(event) => settingsStore.setDeckTheme(event.currentTarget.value)}
            >
                {#each Object.entries(DECK_THEMES) as [theme, details]}
                    <option value={theme}>{details.label}</option>
                {/each}
            </select>
        </label>

        <label class="setting-row">
            <span>
                <strong>Play area</strong>
                <small>Change the felt color</small>
            </span>
            <select
                aria-label="Play area theme"
                value={$settingsStore.playAreaTheme}
                on:change={(event) => settingsStore.setPlayAreaTheme(event.currentTarget.value)}
            >
                {#each Object.entries(PLAY_AREA_THEMES) as [theme, details]}
                    <option value={theme}>{details.label}</option>
                {/each}
            </select>
        </label>

        <div class="setting-row size-row">
            <label for="card-size">
                <strong>Card size</strong>
                <small>{cardSizes.find(size => size.value === $settingsStore.cardScale)?.label}</small>
            </label>
            <input
                id="card-size"
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                value={$settingsStore.cardScale}
                aria-label="Card size"
                on:input={setCardScale}
            />
        </div>

        <p class="hint">Card sizing stays responsive to your screen.</p>
    </section>
</div>

<style>
    .settings-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1100;
        display: grid;
        place-items: center;
        padding: 18px;
        box-sizing: border-box;
        background: rgba(0, 25, 22, 0.68);
        backdrop-filter: blur(5px);
    }

    .settings-panel {
        width: min(100%, 460px);
        padding: clamp(20px, 5vw, 30px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 18px;
        background: linear-gradient(155deg, #24564b, #183d37);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
        color: #fff;
        box-sizing: border-box;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 14px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a9d8c6;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
    }

    h2 {
        margin: 0;
        font-size: 1.8rem;
    }

    .close-button {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
    }

    .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.14);
    }

    .setting-row span,
    .size-row label {
        display: grid;
        gap: 5px;
    }

    .setting-row strong {
        font-size: 0.98rem;
    }

    .setting-row small {
        color: rgba(255, 255, 255, 0.68);
        font-size: 0.82rem;
    }

    select {
        min-width: 140px;
        margin: 0;
        padding: 9px 30px 9px 11px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 8px;
        background: #f7fbf9;
        color: #183d37;
    }

    .size-row {
        flex-wrap: wrap;
    }

    input[type="range"] {
        flex: 1 1 150px;
        min-width: 130px;
        margin: 0;
        accent-color: #69d39a;
    }

    .hint {
        margin: 8px 0 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 0.78rem;
    }
</style>
