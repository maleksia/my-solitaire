import { get } from 'svelte/store';
import { gameStore } from '../stores/gameStore.js';
import { statsStore } from '../stores/statsStore.js';
import { settingsStore } from '../stores/settingsStore.js';

const card = (value, suit, numericValue) => ({
    value,
    suit,
    numericValue,
    faceUp: true
});

function setTableau(columns, endStacks = [[], [], [], []]) {
    const state = get(gameStore);
    state.tableau = Array.from({ length: 7 }, (_, index) => columns[index] || []);
    state.endStacks = endStacks;
}

describe('Solitaire game actions', () => {
    beforeEach(() => {
        gameStore.newGame();
    });

    describe('Player settings', () => {
        afterEach(() => {
            settingsStore.reset();
        });

        test('updates deck theme, play area theme, and card size', () => {
            settingsStore.setDeckTheme('red');
            settingsStore.setPlayAreaTheme('blue');
            settingsStore.setCardScale(1.2);

            expect(get(settingsStore)).toMatchObject({
                deckTheme: 'red',
                playAreaTheme: 'blue',
                cardScale: 1.2
            });
        });

        describe('Game statistics', () => {
            test('counts games, redeals, and wins without double-counting a win', () => {
                const statsBefore = get(statsStore);
                statsStore.startGame();
                statsStore.incrementRedeals();
                statsStore.recordWin();
                statsStore.recordWin();

                const statsAfter = get(statsStore);
                expect(statsAfter.gamesPlayed).toBe(statsBefore.gamesPlayed + 1);
                expect(statsAfter.gamesWon).toBe(statsBefore.gamesWon + 1);
                expect(statsAfter.currentGame.redealsUsed).toBe(1);
            });
        });
    });

    test('moves a King to an empty tableau column and supports undo and redo', () => {
        setTableau([[card('K', 'hearts', 13)], []]);

        gameStore.moveCard(0, 1, 0);
        expect(get(gameStore).tableau[1][0].value).toBe('K');
        expect(get(gameStore).tableau[0]).toHaveLength(0);
        expect(get(statsStore).currentGame.moves).toBe(1);

        gameStore.undo();
        expect(get(gameStore).tableau[0][0].value).toBe('K');
        expect(get(gameStore).tableau[1]).toHaveLength(0);
        expect(get(statsStore).currentGame.moves).toBe(0);

        gameStore.redo();
        expect(get(gameStore).tableau[1][0].value).toBe('K');
        expect(get(statsStore).currentGame.moves).toBe(1);
    });

    test('moves one Ace to its empty foundation', () => {
        setTableau([[card('A', 'hearts', 1)]]);

        gameStore.moveSequenceToEndStack(0, 0);

        expect(get(gameStore).endStacks[0].map(item => item.value)).toEqual(['A']);
        expect(get(gameStore).tableau[0]).toHaveLength(0);
    });

    test('does not move attached cards directly to a foundation', () => {
        setTableau([[
            card('A', 'hearts', 1),
            card('2', 'hearts', 2)
        ]]);

        gameStore.moveSequenceToEndStack(0, 0);

        expect(get(gameStore).endStacks[0]).toHaveLength(0);
        expect(get(gameStore).tableau[0]).toHaveLength(2);
    });

    test('tracks redeals and restores the count with undo and redo', () => {
        setTableau([[card('A', 'hearts', 1)]]);

        gameStore.collectAndRedeal();
        expect(get(statsStore).currentGame.redealsUsed).toBe(1);

        gameStore.undo();
        expect(get(statsStore).currentGame.redealsUsed).toBe(0);

        gameStore.redo();
        expect(get(statsStore).currentGame.redealsUsed).toBe(1);
    });

    test('ends a game and blocks further moves until a new game starts', () => {
        setTableau([[card('K', 'hearts', 13)], []]);

        gameStore.endGame();
        expect(get(gameStore).isGameEnded).toBe(true);
        expect(gameStore.canMoveCard(0, 1, 0)).toBe(false);

        gameStore.moveCard(0, 1, 0);
        expect(get(gameStore).tableau[0]).toHaveLength(1);
        expect(get(gameStore).tableau[1]).toHaveLength(0);

        gameStore.newGame();
        expect(get(gameStore).isGameEnded).toBe(false);
    });

    test('moves a card only when it follows the foundation suit and rank', () => {
        setTableau([[card('2', 'hearts', 2)]], [[card('A', 'hearts', 1)], [], [], []]);

        gameStore.moveToEndStack(0, 0, 0);

        expect(get(gameStore).endStacks[0].map(item => item.value)).toEqual(['A', '2']);
        expect(get(gameStore).tableau[0]).toHaveLength(0);
    });

    test('rejects invalid move indices without changing game state', () => {
        setTableau([[card('K', 'hearts', 13)], []]);
        const movesBefore = get(gameStore).tableau.map(column => column.slice());

        gameStore.moveCard(0, 9, 0);
        gameStore.moveToEndStack(0, -1, 0);

        expect(get(gameStore).tableau).toEqual(movesBefore);
    });
});
