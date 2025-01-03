<script>
    export let isOpen = false;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    function closeRules() {
        dispatch('close');
    }
</script>

{#if isOpen}
    <div     class="modal-backdrop" 
    on:click={closeRules}
    on:keydown={(e) => e.key === 'Escape' && closeRules()}
    role="dialog"
    aria-labelledby="rules-title"
>
    <div class="modal-content" on:click|stopPropagation on:keydown={(e) => e.key === 'Enter' && closeRules()}>
        <button class="close-button" on:click={closeRules}>×</button>
        <h2 id="rules-title">Solitaire Rules</h2>
            <div class="rules-content">
                <h3>Game Objective</h3>
                <ul>
                    <li>Build four foundation piles from Ace to King, following the same suit.</li>
                </ul>
                
                <h3>Card Movement Rules</h3>
                <ul>
                    <li><strong>Tableau Rules:</strong>
                        <ul>
                            <li>Cards in tableau piles must be arranged in <strong>descending order</strong> by the <strong>same suit</strong>.</li>
                            <li>For example: ♥️ 7 can be placed on ♥️ 8, but not on any other suit or color.</li>
                            <li>You can move <strong>single card</strong> or <strong>sequences of cards</strong></li>
                        </ul>
                    </li>
                    <li><strong>Empty Tableau Spaces:</strong>
                        <ul>
                            <li>Only a <strong>King</strong> can be placed in an empty tableau spot, regardless of suit.</li>
                        </ul>
                    </li>
                    <li><strong>Foundation Piles:</strong>
                        <ul>
                            <li>Foundation piles are built starting from the <strong>Ace</strong> and progressing to the <strong>King</strong> in <strong>ascending order</strong> and following the <strong>same suit</strong>.</li>
                        </ul>
                    </li>
                </ul>
                

                <h3>Controls</h3>
                <ul>
                    <li>Click to select/deselect cards</li>
                    <li>Drag and drop cards between piles</li>
                    <li>Use Collect & Redeal when stuck (3 times max on normal mode & unlimited times on easier mode)</li>
                </ul>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        border: none;
        background: none;
        font-size: 24px;
        cursor: pointer;
    }

    .rules-content {
        margin-top: 20px;
    }

    h2 {
        color: #2a4741;
        margin-bottom: 20px;
    }

    h3 {
        color: #4a6964;
        margin-top: 15px;
    }

    ul {
        margin-left: 20px;
    }

    li {
        margin: 5px 0;
    }
</style>