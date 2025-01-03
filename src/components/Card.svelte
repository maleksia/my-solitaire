<script>
    export let card;
    export let index;
    export let columnIndex;
    export let column;
    import { gameStore } from "../stores/gameStore";
    import { dragStore } from "../stores/dragStore";
    import { layoutStore } from "../stores/layoutStore";

    $: isSelected =
        ($gameStore.selectedCard === index &&
            $gameStore.selectedColumn === columnIndex) ||
        ($gameStore.selectedColumn === columnIndex &&
            $gameStore.selectedCard !== null &&
            $gameStore.selectedCard < index &&
            card.faceUp &&
            areCardsInOrder(column.slice($gameStore.selectedCard, index + 1)));

    const suitSymbols = {
        hearts: "♥",
        diamonds: "♦",
        clubs: "♣",
        spades: "♠",
    };

    function handleInteraction() {
        if (!card.faceUp) return;

        // If no card is selected, select this card
        if ($gameStore.selectedCard === null) {
            gameStore.selectCard(columnIndex, index);
            return;
        }

        // If clicking the same card, deselect it
        if (
            $gameStore.selectedColumn === columnIndex &&
            $gameStore.selectedCard === index
        ) {
            gameStore.selectCard(null, null);
            return;
        }

        // Moving to this column
        const sourceCol = $gameStore.selectedColumn;
        const sourceIdx = $gameStore.selectedCard;
        const sourceCard = $gameStore.tableau[sourceCol][sourceIdx];

        // Moving to empty column
        if (column.length === 0) {
            if (sourceCard.value === "K") {
                gameStore.moveCard(sourceCol, columnIndex, sourceIdx);
            }
        } else {
            gameStore.moveCard(sourceCol, columnIndex, sourceIdx);
        }

        gameStore.selectCard(null, null);
    }

    function handleDoubleClick() {
        if (!card.faceUp) return;
        if (index < column.length - 1) return;
        gameStore.moveSequenceToEndStack(columnIndex, index);
    }

    function handleRightClick(event) {
        event.preventDefault();
        if (!card.faceUp) return;
        if (index < column.length - 1) return;
        gameStore.moveSequenceToEndStack(columnIndex, index);
    }

    function handleDragStart(event) {
        if (!card.faceUp) {
            event.preventDefault();
            return;
        }

        const cardSequence = column.slice(index);
        dragStore.startDrag(columnIndex, index, cardSequence.length);

        const rect = event.target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const ghostContainer = document.createElement("div");
        ghostContainer.style.cssText = `
        position: fixed;
        left: -1000px;
        top: -1000px;
        z-index: 1000;
        pointer-events: none;
        width: ${$layoutStore.cardWidth}px;
        background: transparent;
    `;

        cardSequence.forEach((sequenceCard, i) => {
            const cardElement = document.createElement("div");
            const color =
                sequenceCard.suit === "hearts" ||
                sequenceCard.suit === "diamonds"
                    ? "#e44145"
                    : "#252525";

            cardElement.style.cssText = `
            position: absolute;
            top: ${i * $layoutStore.cardSpacing}px;
            width: ${$layoutStore.cardWidth}px;
            height: ${$layoutStore.cardHeight}px;
            background: white;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            transform-origin: 0 0;
            opacity: 1; /* Korttien näkyvyys */
        `;

            cardElement.innerHTML = `
            <div style="position: relative; height: 100%; background: white; border-radius: 8px;">
                <div style="position: absolute; top: 6px; left: 6px; display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 1.4em; font-weight: bold; color: ${color};">${sequenceCard.value}</span>
                    <span style="font-size: 1.4em; color: ${color};">${suitSymbols[sequenceCard.suit]}</span>
                </div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2.5em; color: ${color};">${suitSymbols[sequenceCard.suit]}</div>
                <div style="position: absolute; bottom: 6px; right: 6px; display: flex; align-items: center; gap: 4px; transform: rotate(180deg);">
                    <span style="font-size: 1.4em; font-weight: bold; color: ${color};">${sequenceCard.value}</span>
                    <span style="font-size: 1.4em; color: ${color};">${suitSymbols[sequenceCard.suit]}</span>
                </div>
            </div>
        `;

            ghostContainer.appendChild(cardElement);
        });

        document.body.appendChild(ghostContainer);

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setDragImage(ghostContainer, offsetX, offsetY);

        event.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
                columnIndex,
                cardIndex: index,
            }),
        );

        requestAnimationFrame(() => {
            document.body.removeChild(ghostContainer);
        });
    }

    function handleDragEnd() {
        dragStore.reset();
    }

    $: shouldBeHidden =
        $dragStore.isDragging &&
        $dragStore.columnIndex === columnIndex &&
        index >= $dragStore.startIndex;

    function areCardsInOrder(cards) {
        if (cards.length <= 1) return true;
        for (let i = 0; i < cards.length - 1; i++) {
            if (
                cards[i].suit !== cards[i + 1].suit ||
                cards[i].numericValue !== cards[i + 1].numericValue - 1
            ) {
                return false;
            }
        }
        return true;
    }

    let touchStartTime = 0;
    let touchTimeout;

    function handleTouchStart(event) {
        touchStartTime = Date.now();
        
        touchTimeout = setTimeout(() => {
            if (card.faceUp) {
                handleRightClick(event);
            }
        }, 500);
    }

    function handleTouchEnd(event) {
        const touchDuration = Date.now() - touchStartTime;
        clearTimeout(touchTimeout);

        event.preventDefault();

        if (touchDuration < 300) {
            handleDoubleClick();
            return;
        }

        handleInteraction();
    }

    function handleTouchMove() {
        clearTimeout(touchTimeout);
    }

</script>

<button
    class="card {card.faceUp ? 'face-up' : 'face-down'} {card.suit} 
    {isSelected ? 'selected' : ''}"
    style="
        top: {index * $layoutStore.cardSpacing}px;
        width: {$layoutStore.cardWidth}px;
        height: {$layoutStore.cardHeight}px;
        visibility: {shouldBeHidden ? 'hidden' : 'visible'};
    "
    draggable={card.faceUp}
    on:click={handleInteraction}
    on:keydown={handleInteraction}
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
    on:dblclick={handleDoubleClick}
    on:contextmenu={handleRightClick}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
    on:touchmove={handleTouchMove}
>
    {#if card.faceUp}
        <div class="card-content">
            <div class="corner top-left">
                <span class="value">{card.value}</span>
                <span class="suit">{suitSymbols[card.suit]}</span>
            </div>
            <div class="center-suit">{suitSymbols[card.suit]}</div>
            <div class="corner bottom-right">
                <span class="value">{card.value}</span>
                <span class="suit">{suitSymbols[card.suit]}</span>
            </div>
        </div>
    {/if}
</button>

<style>
    .card {
        position: absolute;
        background: white;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .dragging {
        opacity: 1 !important;
        pointer-events: none;
    }

    .face-up:hover:not(.dragging) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .selected {
        border: 2px solid #ffd700;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        transform: translateY(-3px);
        z-index: 10;
    }

    .selected.attached {
        box-shadow:
            0 0 0 3px #ffd700,
            0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .selected:hover {
        border: 2px solid #ffd700;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
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

    .card-content {
        height: 100%;
        position: relative;
    }

    .face-up {
        cursor: pointer;
    }

    .face-up:hover:not(.selected) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .face-down {
        background: linear-gradient(
            45deg,
            #006699 25%,
            #005588 25%,
            #005588 50%,
            #006699 50%,
            #006699 75%,
            #005588 75%
        );
        background-size: 20px 20px;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(0, 0, 0, 0.2);
    }

    .hearts,
    .diamonds {
        color: #e44145;
    }

    .spades,
    .clubs {
        color: #252525;
    }

    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .corner {
            font-size: calc(1em * var(--card-scale, 1));
        }

        .center-suit {
            font-size: calc(1.5em * var(--card-scale, 1));
        }
    }

    @media (hover: none) {
        .face-up:active {
            transform: scale(1.02);
            transition: transform 0.1s;
        }

        .selected {
            transform: translateY(-3px) scale(1.02);
        }
    }
</style>
