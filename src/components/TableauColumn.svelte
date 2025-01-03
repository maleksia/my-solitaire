<script>
  import Card from "./Card.svelte";
  import { gameStore } from "../stores/gameStore";
  import { layoutStore } from "../stores/layoutStore";
  import { dragStore } from "../stores/dragStore";

  export let column;
  export let columnIndex;

  function handleCardClick(cardIndex) {
    console.log("Card clicked:", { columnIndex, cardIndex });

    if ($gameStore.selectedCard === null) {
      gameStore.selectCard(columnIndex, cardIndex);
    } else {
      // If clicking same card, deselect
      if (
        $gameStore.selectedColumn === columnIndex &&
        $gameStore.selectedCard === cardIndex
      ) {
        gameStore.selectCard(null, null);
      } else {
        // Try to move card
        gameStore.moveCard(
          $gameStore.selectedColumn,
          columnIndex,
          $gameStore.selectedCard,
        );
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    try {
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const fromColumn = Number(data.columnIndex);
      const cardIndex = Number(data.cardIndex);

      if (!isNaN(fromColumn) && !isNaN(cardIndex)) {
        if (gameStore.canMoveCard(fromColumn, columnIndex, cardIndex)) {
          gameStore.moveCard(fromColumn, columnIndex, cardIndex);
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
    dragStore.reset();
  }

  function handleColumnInteraction() {
    if ($gameStore.selectedCard !== null) {
      gameStore.selectCard(null, null);
    }
  }

  $: canAcceptKing =
    column.length === 0 &&
    $gameStore.selectedCard !== null &&
    $gameStore.tableau[$gameStore.selectedColumn]?.[$gameStore.selectedCard]
      ?.value === "K";

  function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.toggle("can-drop", canAcceptKing);
  }

  function handleDragLeave(event) {
    event.currentTarget.classList.remove("can-drop");
  }

  let renderKey = 0;

  $: {
    // Force re-render when these values change
    $gameStore.tableau;
    $gameStore.lastUpdate;
    renderKey++;
  }
  $: isEmpty = column.length === 0;
  $: columnHeight = $layoutStore.cardHeight;
  $: columnWidth = $layoutStore.cardWidth;
</script>

<div
    class="tableau-column {canAcceptKing ? 'can-accept-king' : ''} {isEmpty ? 'empty' : ''}"
    style="
        min-height: {columnHeight}px;
        flex: 0 0 {columnWidth}px;
    "
    {renderKey}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
    on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleColumnInteraction();
        }
    }}
>
  {#if isEmpty}
    <div class="empty-placeholder">
      <span class="empty-text">K</span>
    </div>
  {/if}
  {#key renderKey}
    {#each column as card, i}
      <Card {card} {columnIndex} {column} index={i} onClick={handleCardClick} />
    {/each}
  {/key}
</div>

<style>
    .tableau-column {
        position: relative;
        margin: 0 10px;
        border-radius: 8px;
        transition: all 0.2s ease; 
    }

    .empty {
        border: 2px dashed rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
    }

    .empty-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        color: rgba(255, 255, 255, 0.3);
        font-family: serif;
    }

    .empty-text {
        opacity: 0.5;
        font-style: italic;
    }

    .tableau-column.can-accept-king {
        border: 2px dashed rgba(255, 215, 0, 0.5);
        background: rgba(255, 215, 0, 0.1);
    }

    .tableau-column.can-accept-king .empty-text {
        color: rgba(255, 215, 0, 0.8);
        opacity: 1;
    }
</style>
