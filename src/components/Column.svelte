<script>
    export let cards = [];
    export let columnIndex;
    import Card from './Card.svelte';
    import { gameStore } from '../stores/gameStore';

    $: isCardPartOfSelectedStack = (cardIndex) => {
        if ($gameStore.selectedCard === null || $gameStore.selectedColumn !== columnIndex) return false;
        return cardIndex >= $gameStore.selectedCard && cards[cardIndex].faceUp;
    };
</script>

{#each cards as card, cardIndex}
    <Card
        {card}
        {columnIndex}
        index={cardIndex}
        column={cards}
        selected={$gameStore.selectedColumn === columnIndex && $gameStore.selectedCard === cardIndex}
        partOfSelectedStack={isCardPartOfSelectedStack(cardIndex)}
        on:click={() => gameStore.selectCard(columnIndex, cardIndex)}
    />
{/each}
