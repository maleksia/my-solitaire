import { gameStore } from '../stores/gameStore.js';
import { createDeck } from '../utils/cards.js';

describe('Solitaire Game Tests', () => {
    let currentState;
    
    beforeEach(() => {
        // Reset store before each test
        gameStore.dealInitialCards();
        gameStore.subscribe(state => {
            currentState = state;
        });
    });

    test('King movement to empty column', () => {
        // Setup: Create tableau with King and empty column
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [{
            value: 'K',
            suit: 'hearts',
            faceUp: true,
            numericValue: 13
        }];
        
        currentState.tableau = mockTableau;
        
        // Act: Try to move King to empty column
        gameStore.moveCard(0, 1, 0);
        
        // Assert: King should be in new column
        expect(currentState.tableau[1].length).toBe(1);
        expect(currentState.tableau[1][0].value).toBe('K');
    });
    
});

describe('Right-click to Endstack Tests', () => {
    let currentState;
    
    beforeEach(() => {
        gameStore.dealInitialCards();
        gameStore.subscribe(state => {
            currentState = state;
        });
    });

    test('Right-click moves single Ace to empty endstack', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [{
            value: 'A',
            suit: 'hearts',
            faceUp: true,
            numericValue: 1
        }];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(1);
        expect(currentState.endStacks[0][0].value).toBe('A');
        expect(currentState.tableau[0].length).toBe(0);
    });

    test('Right-click moves sequence of same suit to endstack', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 },
            { value: '2', suit: 'hearts', faceUp: true, numericValue: 2 },
            { value: '3', suit: 'hearts', faceUp: true, numericValue: 3 }
        ];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(3);
        expect(currentState.endStacks[0][0].value).toBe('A');
        expect(currentState.endStacks[0][1].value).toBe('2');
        expect(currentState.endStacks[0][2].value).toBe('3');
        expect(currentState.tableau[0].length).toBe(0);
    });

    test('Right-click does not move invalid sequence', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 },
            { value: '2', suit: 'clubs', faceUp: true, numericValue: 2 } // Different suit
        ];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(1); // Only Ace should move
        expect(currentState.tableau[0].length).toBe(1); // 2 of clubs should remain
    });

    test('Right-click moves to non-empty endstack if valid', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: '2', suit: 'hearts', faceUp: true, numericValue: 2 }
        ];
        currentState.endStacks[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 }
        ];

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(2);
        expect(currentState.endStacks[0][1].value).toBe('2');
        expect(currentState.tableau[0].length).toBe(0);
    });
});

describe('Right-click to Endstack Tests', () => {
    let currentState;
    
    beforeEach(() => {
        gameStore.dealInitialCards();
        gameStore.subscribe(state => {
            currentState = state;
        });
    });

    test('Right-click moves single Ace to empty endstack', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [{
            value: 'A',
            suit: 'hearts',
            faceUp: true,
            numericValue: 1
        }];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(1);
        expect(currentState.endStacks[0][0].value).toBe('A');
        expect(currentState.tableau[0].length).toBe(0);
    });

    test('Right-click moves sequence of same suit to endstack', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 },
            { value: '2', suit: 'hearts', faceUp: true, numericValue: 2 },
            { value: '3', suit: 'hearts', faceUp: true, numericValue: 3 }
        ];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(3);
        expect(currentState.endStacks[0][0].value).toBe('A');
        expect(currentState.endStacks[0][1].value).toBe('2');
        expect(currentState.endStacks[0][2].value).toBe('3');
        expect(currentState.tableau[0].length).toBe(0);
    });

    test('Right-click does not move invalid sequence', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 },
            { value: '2', suit: 'clubs', faceUp: true, numericValue: 2 } // Different suit
        ];
        currentState.tableau = mockTableau;

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(1); // Only Ace should move
        expect(currentState.tableau[0].length).toBe(1); // 2 of clubs should remain
    });

    test('Right-click moves to non-empty endstack if valid', () => {
        // Setup
        const mockTableau = Array(7).fill().map(() => []);
        mockTableau[0] = [
            { value: '2', suit: 'hearts', faceUp: true, numericValue: 2 }
        ];
        currentState.endStacks[0] = [
            { value: 'A', suit: 'hearts', faceUp: true, numericValue: 1 }
        ];

        // Act
        gameStore.moveSequenceToEndStack(0, 0);

        // Assert
        expect(currentState.endStacks[0].length).toBe(2);
        expect(currentState.endStacks[0][1].value).toBe('2');
        expect(currentState.tableau[0].length).toBe(0);
    });
});