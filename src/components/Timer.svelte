<script>
    import { statsStore } from '../stores/statsStore';
    import { gameStore } from '../stores/gameStore';

    let elapsedTime = 0;

    $: if (!$gameStore.isPaused) {
        elapsedTime = $statsStore.currentGame.elapsedTime;
    }

    $: minutes = Math.floor(elapsedTime / 60000);
    $: seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    $: formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
</script>

<div class="timer">
    {formattedTime}
</div>

<style>
    .timer {
        font-size: 1.5em;
        font-family: monospace;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin: 0 10px;
    }
</style>