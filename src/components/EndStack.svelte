<script>
  import { gameStore } from "../stores/gameStore";
  import { suitSymbols } from "../utils/cards";
  import { layoutStore } from "../stores/layoutStore";
  import { dragStore } from "../stores/dragStore";

  export let stack;
  export let stackIndex;

  function handleInteraction() {
        const { selectedCard, selectedColumn } = $gameStore;
        if (selectedCard !== null) {
            gameStore.moveToEndStack(selectedColumn, selectedCard, stackIndex);
        }
    }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    try {
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        const fromColumn = data.columnIndex;
        const cardIndex = data.cardIndex;
        const column = $gameStore.tableau[fromColumn];
        const card = column[cardIndex];

        if (cardIndex < column.length - 1 || !gameStore.canMoveToEndStack(card, stack[stack.length - 1])) {
            event.dataTransfer.dropEffect = 'none';
            dragStore.reset();
            return;
        }

        gameStore.moveToEndStack(fromColumn, cardIndex, stackIndex);
    } catch (err) {
        console.error("Drop error:", err);
        event.dataTransfer.dropEffect = 'none';
        dragStore.reset();
    }
}

    $: isRedSuit = stack.length > 0 && (stack[stack.length - 1].suit === "hearts" || stack[stack.length - 1].suit === "diamonds");
    $: shouldAnimate = $gameStore.winAnimation && $gameStore.winAnimationIndex === stackIndex && stack.length === 13;
</script>

<div
class="end-stack {shouldAnimate ? 'spin' : ''}"
style="width: {$layoutStore.cardWidth}px; height: {$layoutStore.cardHeight}px;"
data-stack-index={stackIndex}
on:dragover={handleDragOver}
on:drop={handleDrop}
on:click={handleInteraction}
on:keydown={(e) => e.key === 'Enter' && handleInteraction(e)}
role="button"
tabindex="0"
>
  {#if stack.length > 0}
    <div class="card {isRedSuit ? 'red' : 'black'}">
      <div class="card-content">
        <div class="corner top-left">
          <span class="value">{stack[stack.length - 1].value}</span>
          <span class="suit">{suitSymbols[stack[stack.length - 1].suit]}</span>
        </div>
        <div class="center-suit">
          {suitSymbols[stack[stack.length - 1].suit]}
        </div>
        <div class="corner bottom-right">
          <span class="value">{stack[stack.length - 1].value}</span>
          <span class="suit">{suitSymbols[stack[stack.length - 1].suit]}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="empty-stack" />
  {/if}
</div>

<style>
  .end-stack {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    margin: 0 10px;
    transition: border-color 0.2s ease;
  }

  .end-stack:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  .empty-stack {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    position: relative;
  }

  .empty-stack::before {
    content: "♠♥♣♦";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5em;
    color: rgba(255, 255, 255, 0.1);
    letter-spacing: 3px;
  }

  .card {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 8px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .card-content {
    height: 100%;
    position: relative;
  }

  .corner {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    font-size: 1.4em;
    font-weight: bold;
  }

  .top-left {
    top: 0;
    left: 0;
  }

  .bottom-right {
    bottom: 0;
    right: 0;
    transform: rotate(180deg);
  }

  .center-suit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2.5em;
    opacity: 0.7;
  }

  .empty-stack {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .card.red {
    color: #e44145;
  }

  .card.black {
    color: #252525;
  }

  @media (max-width: 768px) {
    .corner {
      font-size: 1em;
    }

    .center-suit {
      font-size: 1.5em;
    }
  }
  @keyframes spin {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  .spin {
    animation: spin 1s ease-in-out;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }
</style>
