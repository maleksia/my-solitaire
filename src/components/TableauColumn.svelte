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
        // Adjust position of attached cards
        const attachedCards = $gameStore.tableau[$gameStore.selectedColumn].slice($gameStore.selectedCard);
        attachedCards.forEach((card, index) => {
          gameStore.moveCard($gameStore.selectedColumn, columnIndex, $gameStore.selectedCard + index);
        });
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    try {
      if (!data) return;

      const { columnIndex: fromColumn, cardIndex } = JSON.parse(data);
      if (Number.isInteger(fromColumn) && Number.isInteger(cardIndex) &&
          gameStore.canMoveCard(fromColumn, columnIndex, cardIndex)) {
        gameStore.moveCard(fromColumn, columnIndex, cardIndex);
      }
    } catch (err) {
      console.error("Drop error:", err);
    } finally {
      dragStore.reset();
    }
  }

  function handleColumnInteraction() {
    if ($gameStore.selectedCard !== null) {
      gameStore.selectCard(null, null);
    }
  }

  $: canAcceptDrop =
    $dragStore.isDragging &&
    gameStore.canMoveCard(
      $dragStore.columnIndex,
      columnIndex,
      $dragStore.startIndex
    );

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      event.currentTarget.classList.remove("can-drop");
    }
  }

  let renderKey = 0;

  $: {
    // Force re-render when these values change
    $gameStore.tableau;
    $gameStore.lastUpdate;
    renderKey++;
  }
  $: isEmpty = column.length === 0;
  $: columnHeight = $layoutStore.cardHeight +
    Math.max(0, column.length - 1) * $layoutStore.cardSpacing;
  $: columnWidth = $layoutStore.cardWidth;
</script>

<div
  class="tableau-column {canAcceptDrop ? 'can-drop' : ''} {isEmpty
    ? 'empty'
    : ''}"
  data-column-index={columnIndex}
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
    if (e.key === "Enter" || e.key === " ") {
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
      <Card 
        {card} 
        {columnIndex} 
        {column} 
        index={i} 
        selected={$gameStore.selectedColumn === columnIndex &&
          $gameStore.selectedCard !== null &&
          i >= $gameStore.selectedCard &&
          card.faceUp}
        onClick={handleCardClick} 
      />
    {/each}
  {/key}
</div>

<style>
  .tableau-column {
    position: relative;
    margin: 0 2px;
    border-radius: 8px;
    transition: all 0.2s ease;
    box-sizing: border-box;
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
    width: 100%;
    height: 100%;
    box-sizing: border-box;
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

  .tableau-column.can-drop {
    outline: 2px solid rgba(255, 215, 0, 0.8);
    outline-offset: 3px;
    background: rgba(255, 215, 0, 0.12);
  }

  .tableau-column.can-drop .empty-text {
    color: rgba(255, 215, 0, 0.8);
    opacity: 1;
  }

  @media (min-width: 769px) {
    .tableau-column {
      margin: 0 5px;
    }
  }

  @media (min-width: 1025px) {
    .tableau-column {
      margin: 0 10px;
    }
  }

  @media (max-width: 480px) {
    .tableau-column {
      margin: 0 2px;
    }

  }

  @media (min-width: 481px) and (max-width: 768px) {
    .tableau-column {
      margin: 0 3px;
    }
  }
</style>