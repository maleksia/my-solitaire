export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const VALUE_MAP = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export function shuffleDeck(deck) {
    const shuffled = [...deck];
    
    // Multiple passes for better randomization
    for (let pass = 0; pass < 3; pass++) {
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }
    }
    
    return shuffled;
}

export function createDeck() {
    const deck = [];
    
    // Create initial deck in order
    for (const suit of SUITS) {
        for (let i = 0; i < VALUES.length; i++) {
            deck.push({
                suit,
                value: VALUES[i],
                numericValue: i + 1,
                faceUp: false
            });
        }
    }

    return deck;
}

export function canStackCard(sourceCard, targetCard) {
    console.log('Checking stack:', { sourceCard, targetCard });

    // Allow Kings to move to empty columns
    if (!targetCard) {
        console.log('Empty column, checking for King');
        return sourceCard.value === 'K';
    }

    // Check if cards can be stacked (same suit, descending order)
    const canStack = sourceCard.suit === targetCard.suit &&
        sourceCard.numericValue === targetCard.numericValue - 1;
    console.log('Can stack:', canStack);
    return canStack;
}

export const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
};