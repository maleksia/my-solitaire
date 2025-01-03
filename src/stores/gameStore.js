import { writable, get } from 'svelte/store';
import { canStackCard, shuffleDeck, createDeck } from '../utils/cards';
import { undoStore } from './undoStore';
import { statsStore } from './statsStore';

function createGameStore() {
  const { subscribe, update, set } = writable({
    tableau: Array(7).fill().map(() => []),
    endStacks: Array(4).fill().map(() => []),
    difficulty: 'normal',
    redealsRemaining: 3,
    selectedCard: null,
    selectedColumn: null,
    isGameWon: false,
    hasStarted: false,
    lastUpdate: Date.now(),
    winAnimation: false,
    winAnimationIndex: -1
  });

  function newGame(difficulty = 'normal') {
    statsStore.reset();
    const deck = shuffleDeck(createDeck());
    undoStore.clear();
    set({
      hasStarted: false,
      tableau: dealCards(deck),
      endStacks: Array(4).fill().map(() => []),
      redealsRemaining: difficulty === 'easy' ? Infinity : 3,
      selectedCard: null,
      selectedColumn: null,
      difficulty: difficulty,
      isGameWon: false,
      lastUpdate: Date.now()
    });
  }

  function moveSelectedCard(fromColumn, fromIndex, toColumn) {
    update(state => {
      const sourceCards = state.tableau[fromColumn].slice(fromIndex);
      const sourceCard = sourceCards[0];
      const targetColumn = state.tableau[toColumn];

      if (targetColumn.length === 0) {
        if (sourceCard.value === 'K') {
          const oldState = {
            tableau: JSON.parse(JSON.stringify(state.tableau)),
            endStacks: JSON.parse(JSON.stringify(state.endStacks)),
            redealsRemaining: state.redealsRemaining
          };

          undoStore.pushState(oldState);
          moveCard(fromColumn, toColumn, fromIndex);
        }
        return {
          ...state,
          selectedCard: null,
          selectedColumn: null
        };
      }

      if (canStackCard(sourceCard, targetColumn[targetColumn.length - 1])) {
        moveCard(fromColumn, toColumn, fromIndex);
      }

      return {
        ...state,
        selectedCard: null,
        selectedColumn: null
      };
    });
  }

  function selectCard(columnIndex, cardIndex) {
    update(state => {
      if (columnIndex === null || cardIndex === null) {
        return {
          ...state,
          selectedCard: null,
          selectedColumn: null
        };
      }

      // Invalid column index
      if (!state.tableau[columnIndex]) {
        console.log('Invalid column index:', columnIndex);
        return state;
      }

      // If we have a card selected, try to move it
      if (state.selectedCard !== null) {
        moveSelectedCard(state.selectedColumn, state.selectedCard, columnIndex, cardIndex);
        return state;
      }

      // Select new card if face up
      const card = state.tableau[columnIndex][cardIndex];
      if (!card || !card.faceUp) return state;

      return {
        ...state,
        selectedCard: cardIndex,
        selectedColumn: columnIndex
      };
    });
  }

  function forceRefresh() {
    update(state => ({
      ...state,
      lastUpdate: Date.now()
    }));
  }

  function dealCards(cards) {
    const tableau = Array(7).fill().map(() => []);
    let cardIndex = 0;

    // Deal cards row by row
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (cardIndex < cards.length) {
          const card = cards[cardIndex];
          // Card is face-up if it's in column less than or equal to current row
          card.faceUp = col <= row;
          tableau[col].push(card);
          cardIndex++;
        }
      }
    }

    // Deal remaining cards to first three columns face-up
    while (cardIndex < cards.length) {
      const targetCol = (cardIndex - 49) % 3;
      const card = cards[cardIndex];
      card.faceUp = true;
      tableau[targetCol].push(card);
      cardIndex++;
    }

    // Ensure at least one face-up card in each non-empty column
    tableau.forEach(column => {
      if (column.length > 0 && !column.some(card => card.faceUp)) {
        column[column.length - 1].faceUp = true;
      }
    });

    return tableau;
  }

  function dealInitialCards() {
    update(state => {
      const deck = shuffleDeck(createDeck());
      return {
        ...state,
        tableau: dealCards(deck),
        endStacks: Array(4).fill().map(() => []),
        redealsRemaining: 3,
        selectedCard: null,
        selectedColumn: null,
        isGameWon: false
      };
    });
  }

  function collectAndRedeal() {
    update(state => {
      const isEasyMode = state.difficulty === 'easy';
      if (!isEasyMode && state.redealsRemaining <= 0) return state;

      // Save current state before modification
      const oldState = {
        tableau: JSON.parse(JSON.stringify(state.tableau)),
        endStacks: JSON.parse(JSON.stringify(state.endStacks)),
        redealsRemaining: state.redealsRemaining
      };

      let collectedCards = [];

      // Process columns right to left (6 to 0)
      for (let col = 6; col >= 0; col--) {
        const column = state.tableau[col];
        if (column.length === 0) continue;

        let lastIndex = column.length - 1;

        // Collect face-up cards from bottom up
        while (lastIndex >= 0 && column[lastIndex].faceUp) {
          collectedCards.push(column[lastIndex]);
          lastIndex--;
        }

        // Collect face-down cards from bottom up
        while (lastIndex >= 0) {
          collectedCards.push(column[lastIndex]);
          lastIndex--;
        }
      }

      // Reverse cards before dealing
      collectedCards.reverse();

      const newRedealsRemaining = isEasyMode ? Infinity : state.redealsRemaining - 1;

      // Save old state to undo history before applying changes
      undoStore.pushState(oldState);

      const newState = {
        ...state,
        tableau: dealCards(collectedCards),
        redealsRemaining: newRedealsRemaining,
        selectedCard: null,
        selectedColumn: null,
        lastUpdate: Date.now()
      };

      forceRefresh();
      return newState;
    });
  }

  function moveCard(fromColumn, toColumn, cardIndex) {
    update(state => {
      if (!state.hasStarted) {
        statsStore.startTimer();
        state.hasStarted = true;
      }

      if (fromColumn === toColumn) return state;

      if (!state.tableau[fromColumn] || cardIndex >= state.tableau[fromColumn].length) {
        return state;
      }

      const sourceCards = state.tableau[fromColumn].slice(cardIndex);
      const targetColumn = state.tableau[toColumn];
      const sourceCard = sourceCards[0];

      // Save state before any changes
      const oldState = {
        tableau: JSON.parse(JSON.stringify(state.tableau)),
        endStacks: JSON.parse(JSON.stringify(state.endStacks)),
        redealsRemaining: state.redealsRemaining
      };

      // Empty column - only allow Kings
      if (targetColumn.length === 0) {
        if (sourceCard.value === 'K') {
          statsStore.incrementMoves();
          undoStore.pushState(oldState);

          const newTableau = [...state.tableau];
          newTableau[fromColumn] = state.tableau[fromColumn].slice(0, cardIndex);
          newTableau[toColumn] = sourceCards;

          if (newTableau[fromColumn].length > 0 &&
            !newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp) {
            newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp = true;
          }

          return {
            ...state,
            tableau: newTableau,
            selectedCard: null,
            selectedColumn: null
          };
        }
        return state;
      }

      // Non-empty column - check if cards can stack
      const targetCard = targetColumn[targetColumn.length - 1];
      if (canStackCard(sourceCard, targetCard)) {
        statsStore.incrementMoves();
        undoStore.pushState(oldState);

        const newTableau = [...state.tableau];
        newTableau[fromColumn] = state.tableau[fromColumn].slice(0, cardIndex);
        newTableau[toColumn] = [...targetColumn, ...sourceCards];

        if (newTableau[fromColumn].length > 0 &&
          !newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp) {
          newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp = true;
        }

        return {
          ...state,
          tableau: newTableau,
          selectedCard: null,
          selectedColumn: null
        };
      }

      return state;
    });
  }

  function canMoveToEndStack(card, topCard) {
    if (!topCard) {
      return card.value === 'A';
    }
    return card.suit === topCard.suit && card.numericValue === topCard.numericValue + 1;
  }

  function moveToEndStack(fromColumn, cardIndex, stackIndex) {
    update(state => {
      const card = state.tableau[fromColumn][cardIndex];
      const targetStack = state.endStacks[stackIndex];
      const topCard = targetStack.length > 0 ? targetStack[targetStack.length - 1] : null;

      // Check if card has attached cards
      const hasAttachedCards = cardIndex < state.tableau[fromColumn].length - 1;
      if (hasAttachedCards) {
        return state;
      }

      if (canMoveToEndStack(card, topCard)) {
        statsStore.incrementMoves();

        const oldState = {
          tableau: JSON.parse(JSON.stringify(state.tableau)),
          endStacks: JSON.parse(JSON.stringify(state.endStacks)),
          redealsRemaining: state.redealsRemaining
        };

        undoStore.pushState(oldState);

        const newTableau = [...state.tableau];
        const newEndStacks = [...state.endStacks];

        newTableau[fromColumn] = newTableau[fromColumn].slice(0, cardIndex);
        newEndStacks[stackIndex] = [...targetStack, card];

        if (newTableau[fromColumn].length > 0 &&
          !newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp) {
          newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp = true;
        }

        return {
          ...state,
          tableau: newTableau,
          endStacks: newEndStacks,
          selectedCard: null,
          selectedColumn: null,
          isGameWon: checkWin(newEndStacks)
        };
      }
      return state;
    });
  }

  function undo() {
    const previousState = undoStore.undo();
    if (previousState) {
      set({
        ...get(gameStore),
        tableau: previousState.tableau,
        endStacks: previousState.endStacks,
        redealsRemaining: previousState.redealsRemaining,
        selectedCard: null,
        selectedColumn: null,
        lastUpdate: Date.now()
      });
    }
  }

  function moveSequenceToEndStack(fromColumn, startIndex) {
    update(state => {
      const column = state.tableau[fromColumn];
      if (!column || startIndex >= column.length) return state;

      // Don't allow if card has attachments
      if (startIndex < column.length - 1) {
        return state;
      }

      const card = column[startIndex];
      if (!card.faceUp) return state;

      // Try to move to any available endstack
      for (let stackIndex = 0; stackIndex < state.endStacks.length; stackIndex++) {
        const stack = state.endStacks[stackIndex];
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;

        if (canMoveToEndStack(card, topCard)) {
          statsStore.incrementMoves();

          const oldState = {
            tableau: JSON.parse(JSON.stringify(state.tableau)),
            endStacks: JSON.parse(JSON.stringify(state.endStacks)),
            redealsRemaining: state.redealsRemaining
          };

          undoStore.pushState(oldState);

          const newTableau = [...state.tableau];
          const newEndStacks = [...state.endStacks];

          // Remove card from tableau
          newTableau[fromColumn] = column.slice(0, startIndex);

          // Add to endstack
          newEndStacks[stackIndex] = [...stack, card];

          // Flip new top card if needed
          if (newTableau[fromColumn].length > 0 &&
            !newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp) {
            newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp = true;
          }

          return {
            ...state,
            tableau: newTableau,
            endStacks: newEndStacks,
            selectedCard: null,
            selectedColumn: null,
            isGameWon: checkWin(newEndStacks)
          };
        }
      }
      return state;
    });
  }

  function checkWin(endStacks) {
    const isWon = endStacks.every(stack => stack.length === 13);
    if (isWon) {
      statsStore.stopTimer();
      update(state => ({
        ...state,
        isGameWon: true,
        winAnimation: true,
        winAnimationIndex: 0
      }));

      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          update(state => ({
            ...state,
            winAnimationIndex: i
          }));
        }, i * 500);
      }
    }
    return isWon;
  }

  function canMoveCard(fromColumn, toColumn, cardIndex) {
    const state = get(gameStore);
    const sourceCard = state.tableau[fromColumn][cardIndex];
    const targetColumn = state.tableau[toColumn];

    // Moving to empty column
    if (targetColumn.length === 0) {
      return sourceCard.value === 'K';
    }

    // Moving to non-empty column
    const targetCard = targetColumn[targetColumn.length - 1];
    return canStackCard(sourceCard, targetCard);
  }

  const store = {
    subscribe,
    dealInitialCards,
    selectCard,
    moveCard,
    moveToEndStack,
    canMoveToEndStack,
    moveSequenceToEndStack,
    collectAndRedeal,
    undo,
    newGame,
    forceRefresh,
    canMoveCard
  };

  return store;
}

// Create and export store instance
const gameStore = createGameStore();
console.log('Game store created with methods:', Object.keys(gameStore));
export { gameStore };