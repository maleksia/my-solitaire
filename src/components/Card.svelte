<script>
    export let card;
    export let index;
    export let columnIndex;
    export let column;
    export let selected = false;
    export let partOfSelectedStack = false;
    import { gameStore } from "../stores/gameStore";
    import { dragStore } from "../stores/dragStore";
    import { layoutStore } from "../stores/layoutStore";
    
    $: isSelected = selected || partOfSelectedStack ||
        ($gameStore.selectedColumn === columnIndex &&
            $gameStore.selectedCard === index);
    
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
        const ghostContainer = document.createElement("div");
        const dragData = JSON.stringify({ columnIndex, cardIndex: index });

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", dragData);
        dragStore.startDrag(columnIndex, index, cardSequence.length, {
            isNativeDrag: true
        });
        
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        
        ghostContainer.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
        pointer-events: none;
        width: ${$layoutStore.cardWidth}px;
        height: ${$layoutStore.cardHeight + (cardSequence.length - 1) * $layoutStore.cardSpacing}px;
        background: transparent;
        opacity: 1;
    `;
        
        cardSequence.forEach((sequenceCard, i) => {
            const cardElement = document.createElement("div");
            const isRedSuit = sequenceCard.suit === "hearts" || sequenceCard.suit === "diamonds";
            const color = isRedSuit ? "#e44145" : "#252525";
            
            cardElement.style.cssText = `
            position: absolute;
            top: ${i * $layoutStore.cardSpacing}px;
            width: ${$layoutStore.cardWidth}px;
            height: ${$layoutStore.cardHeight}px;
            background: white;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            box-shadow: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            opacity: 1;
            transform-origin: 0 0;
        `;
            
            const fontSize = window.innerWidth < 768 ? '1em' : '2.4em';
            const centerFontSize = window.innerWidth < 768 ? '1.4em' : '2.7em';
            const padding = window.innerWidth < 768 ? '2px' : '6px';
            
            cardElement.innerHTML = `
            <div style="position: relative; height: 100%; background: white; border-radius: 8px;">
                <div style="position: absolute; top: ${padding}; left: ${padding}; display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: ${fontSize}; font-weight: bold; color: ${color};">${sequenceCard.value}</span>
                    <span style="font-size: ${fontSize}; color: ${color};">${suitSymbols[sequenceCard.suit]}</span>
                </div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: ${centerFontSize}; color: ${color}; opacity: 0.7;">${suitSymbols[sequenceCard.suit]}</div>
                <div style="position: absolute; bottom: ${padding}; right: ${padding}; display: flex; align-items: center; gap: 4px; transform: rotate(180deg);">
                    <span style="font-size: ${fontSize}; font-weight: bold; color: ${color};">${sequenceCard.value}</span>
                    <span style="font-size: ${fontSize}; color: ${color};">${suitSymbols[sequenceCard.suit]}</span>
                </div>
            </div>
        `;
            
            ghostContainer.appendChild(cardElement);
        });
        document.body.appendChild(ghostContainer);
        event.dataTransfer.setDragImage(ghostContainer, offsetX, offsetY);

        requestAnimationFrame(() => ghostContainer.remove());
        
    }
    
    function handleDragEnd() {
        dragStore.reset();
}
    let touchStartPos = { x: 0, y: 0 };
    let touchStartTime = 0;
    let touchTimeout;
    let isDragging = false;
    
    function handleTouchStart(event) {
        if (!card.faceUp) return;
        
        const touch = event.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        touchStartTime = Date.now();
        isDragging = false;
        
        touchTimeout = setTimeout(() => {
            if (!isDragging && card.faceUp) {
                handleRightClick(event);
            }
        }, 500);
    }
    
    function handleTouchMove(event) {
        if (!card.faceUp) return;
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartPos.x;
        const deltaY = touch.clientY - touchStartPos.y;
        
        if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
            isDragging = true;
            clearTimeout(touchTimeout);
            dragStore.startDrag(columnIndex, index, column.slice(index).length, {
                position: { x: touch.clientX, y: touch.clientY },
                offset: touchStartPos
            });
        }
        
        if (isDragging) {
            event.preventDefault();
            dragStore.updateTouchPosition(touch.clientX, touch.clientY);
            const element = event.currentTarget;
            element.style.opacity = '1';
            element.classList.add('dragging');
        }
    }
    
    function handleTouchEnd(event) {
        event.preventDefault();
        clearTimeout(touchTimeout);
        
        const element = event.currentTarget;
        const touchDuration = Date.now() - touchStartTime;
        
        if (isDragging) {
            const touch = event.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (dropTarget) {
                const column = dropTarget.closest('[data-column-index]');
                const endStack = dropTarget.closest('[data-stack-index]');
                
                if (column && column.dataset.columnIndex !== undefined) {
                    const toColumnIndex = parseInt(column.dataset.columnIndex);
                    if (!isNaN(toColumnIndex) && gameStore.canMoveCard(columnIndex, toColumnIndex, index)) {
                        gameStore.moveCard(columnIndex, toColumnIndex, index);
                    }
                } else if (endStack && endStack.dataset.stackIndex !== undefined) {
                    const toStackIndex = parseInt(endStack.dataset.stackIndex);
                    if (!isNaN(toStackIndex)) {
                        gameStore.moveToEndStack(columnIndex, index, toStackIndex);
                    }
                }
            }
            
            element.style.opacity = '1';
            element.style.transform = '';
            element.classList.remove('dragging');
            dragStore.reset();
            isDragging = false;
        } else {
            if (touchDuration < 300) {
                handleInteraction();
            }
        }
    }
    
    $: isTouchDragSource = $dragStore.isDragging && !$dragStore.isNativeDrag &&
        $dragStore.columnIndex === columnIndex && index >= $dragStore.startIndex;
    $: touchDragX = $dragStore.position.x - $dragStore.offset.x;
    $: touchDragY = $dragStore.position.y - $dragStore.offset.y;

</script>

<button
    class="card {card.faceUp ? 'face-up' : 'face-down'} {card.suit}
        {isSelected ? 'selected' : ''} {isDragging ? 'dragging' : ''}"
    class:native-drag-source={$dragStore.isNativeDrag &&
        $dragStore.columnIndex === columnIndex &&
        index >= $dragStore.startIndex}
    class:touch-drag-source={isTouchDragSource}
    style="
        top: {index * $layoutStore.cardSpacing}px;
        width: {$layoutStore.cardWidth}px;
        height: {$layoutStore.cardHeight}px;
        touch-action: none;
        will-change: transform;
        position: absolute;
        transform: {isTouchDragSource
            ? `translate3d(${touchDragX}px, ${touchDragY}px, 0)`
            : ''};
        z-index: {isTouchDragSource ? 1000 + index - $dragStore.startIndex : ''};
    "
    draggable={card.faceUp}
    on:click|stopPropagation={handleInteraction}
    on:keydown={handleInteraction}
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
    on:drop|preventDefault={() => {}}
    on:dblclick={handleDoubleClick}
    on:contextmenu={handleRightClick}
    on:touchstart|preventDefault={handleTouchStart}
    on:touchmove|preventDefault={handleTouchMove}
    on:touchend|preventDefault={handleTouchEnd}
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
        box-sizing: border-box;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }
    
    .dragging {
        opacity: 1 !important;
        pointer-events: none;
        z-index: 1000;
    }

    .native-drag-source {
        opacity: 0 !important;
        box-shadow: none !important;
    }

    .touch-drag-source {
        pointer-events: none;
        transition: none !important;
        box-shadow: none !important;
    }
    
    .face-up:hover:not(.dragging):not(.selected) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .selected, .selected.attached {
        border: 3px solid #ffd700 !important;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5) !important;
        z-index: 100;
        transform: translateY(-4px);
    }
    
    .selected:hover, .selected.attached:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.6) !important;
    }

    .corner {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px;
        font-size: 2.3em;
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
        font-size: 2.7em;
        opacity: 0.7;
    }
    
    .card-content {
        height: 100%;
        position: relative;
    }
    
    .face-up {
        cursor: pointer;
    }
    
    .face-down {
        background: linear-gradient(
        45deg,
        var(--card-back-light, #0879bd) 25%,
        var(--card-back-dark, #064577) 25%,
        var(--card-back-dark, #064577) 50%,
        var(--card-back-light, #0879bd) 50%,
        var(--card-back-light, #0879bd) 75%,
        var(--card-back-dark, #064577) 75%
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
    
    @media (hover: none) {
        .face-up:active {
            transform: scale(1.02);
            transition: transform 0.1s;
        }
        
        .selected {
            transform: translateY(-3px) scale(1.02);
        }

        .dragging {
            opacity: 1;
        }
    }

    @media (max-width: 480px) {
        .card {
            border-radius: 4px;
            border-width: 1px;
        }

        .corner {
            padding: 2px;
            font-size: 0.9em;
            gap: 2px;
        }

        .center-suit {
            font-size: 1.05em;
        }

        .selected {
            border-width: 1px;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }
    }

    @media (min-width: 481px) and (max-width: 768px) {
        .corner {
            padding: 3px;
            font-size: 1.2em;
        }

        .center-suit {
            font-size: 1.4em;
        }
    }

    @media (min-width: 769px ) and (max-width: 1024px) {
        .card {
            border-radius: 4px;
        }
        
        .corner {
            padding: 2px;
            font-size: 2em;
        }
        
        .value, .suit {
            font-size: 0.9em;
        }
        
        .center-suit {
            font-size: 1.9em;
        }
        
        .card-content {
            padding: 2px;
        }
    }

    .selected {
        border: 3px solid #ffd700 !important;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5) !important;
        z-index: 100;
    }

    .selected:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.6) !important;
    }

    .face-up:hover:not(.dragging) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .face-up.selected:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.6) !important;
    }
</style>