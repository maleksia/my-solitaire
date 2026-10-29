import { writable, get } from 'svelte/store';
import { canStackCard, shuffleDeck, createDeck } from '../utils/cards';
import { undoStore } from './undoStore';
import { statsStore } from './statsStore';

function createGameStore() {
  let winAnimationTimeouts = [];
  const { subscribe, update, set } = writable({
    tableau: Array(7).fill().map(() => []),
    endStacks: Array(4).fill().map(() => []),
    difficulty: 'normal',
    redealsRemaining: 3,
    selectedCard: null,
    selectedColumn: null,
    isGameWon: false,
    isGameEnded: false,
    hasStarted: false,
    lastUpdate: Date.now(),
    winAnimation: false,
    winAnimationIndex: -1,
    isPaused: false // Add isPaused property
  });

  function createUndoSnapshot(state) {
    return {
      tableau: JSON.parse(JSON.stringify(state.tableau)),
      endStacks: JSON.parse(JSON.stringify(state.endStacks)),
      redealsRemaining: state.redealsRemaining,
      redealsUsed: get(statsStore).currentGame.redealsUsed,
      moves: get(statsStore).currentGame.moves,
      hasStarted: state.hasStarted,
      isGameWon: state.isGameWon,
      winAnimation: state.winAnimation,
      winAnimationIndex: state.winAnimationIndex
    };
  }

  function saveUndoState(state) {
    undoStore.pushState(createUndoSnapshot(state));
  }

  function clearWinAnimation() {
    winAnimationTimeouts.forEach(clearTimeout);
    winAnimationTimeouts = [];
  }

  function startWinAnimation() {
    statsStore.stopTimer();
    clearWinAnimation();
    for (let i = 0; i < 4; i++) {
      winAnimationTimeouts.push(setTimeout(() => {
        update(state => state.isGameWon ? {
          ...state,
          winAnimationIndex: i
        } : state);
      }, i * 500));
    }
  }

  function newGame(difficulty = 'normal') {
    statsStore.startGame();
    const deck = shuffleDeck(createDeck());
    undoStore.clear();
    clearWinAnimation();
    set({
      hasStarted: false,
      tableau: dealCards(deck),
      endStacks: Array(4).fill().map(() => []),
      redealsRemaining: difficulty === 'easy' ? Infinity : 3,
      selectedCard: null,
      selectedColumn: null,
      difficulty: difficulty,
      isGameWon: false,
      isGameEnded: false,
      lastUpdate: Date.now(),
      isPaused: false,
      winAnimation: false,
      winAnimationIndex: -1
    });
  }

  function togglePause() {
    const state = get(gameStore);
    if (state.isGameWon || state.isGameEnded) return;
    const isPausing = !state.isPaused;
    if (isPausing) {
      statsStore.pauseTimer();
    } else if (state.hasStarted && !state.isGameWon) {
      statsStore.startTimer();
    }
    update(state => ({
      ...state,
      isPaused: isPausing
    }));
  }

  function endGame() {
    const state = get(gameStore);
    if (state.isGameWon || state.isGameEnded) return;

    statsStore.stopTimer();
    clearWinAnimation();
    update(current => ({
      ...current,
      isGameEnded: true,
      isPaused: false,
      selectedCard: null,
      selectedColumn: null
    }));
  }

  function selectCard(columnIndex, cardIndex) {
    const state = get(gameStore);
    if (state.isPaused || state.isGameWon || state.isGameEnded) return;
    if (columnIndex === null || cardIndex === null) {
      update(current => ({
        ...current,
        selectedCard: null,
        selectedColumn: null
      }));
      return;
    }

    if (!state.tableau[columnIndex]) return;

    if (state.selectedCard !== null) {
      moveCard(state.selectedColumn, columnIndex, state.selectedCard);
      update(current => ({
        ...current,
        selectedCard: null,
        selectedColumn: null
      }));
      return;
    }

    const card = state.tableau[columnIndex][cardIndex];
    if (!card || !card.faceUp) return;

    update(current => ({
      ...current,
      selectedCard: cardIndex,
      selectedColumn: columnIndex
    }));
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
    statsStore.startGame();
    undoStore.clear();
    clearWinAnimation();
    update(state => {
      const deck = shuffleDeck(createDeck());
      return {
        ...state,
        tableau: dealCards(deck),
        endStacks: Array(4).fill().map(() => []),
        redealsRemaining: 3,
        selectedCard: null,
        selectedColumn: null,
        isGameWon: false,
        isGameEnded: false,
        hasStarted: false,
        isPaused: false,
        winAnimation: false,
        winAnimationIndex: -1
      };
    });
  }

  function collectAndRedeal() {
    update(state => {
      if (state.isPaused || state.isGameWon || state.isGameEnded) return state;
      const isEasyMode = state.difficulty === 'easy';
      if (!isEasyMode && state.redealsRemaining <= 0) return state;

      // Save current state before modification
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
      saveUndoState(state);
      statsStore.incrementRedeals();

      const newState = {
        ...state,
        tableau: dealCards(collectedCards),
        redealsRemaining: newRedealsRemaining,
        selectedCard: null,
        selectedColumn: null,
        lastUpdate: Date.now()
      };

      return newState;
    });
  }

  function moveCard(fromColumn, toColumn, cardIndex) {
    update(state => {
      if (fromColumn === toColumn) return state;

      if (state.isPaused || state.isGameWon || state.isGameEnded ||
        !state.tableau[fromColumn] || !state.tableau[toColumn] ||
        !Number.isInteger(cardIndex) || cardIndex < 0 ||
        cardIndex >= state.tableau[fromColumn].length) {
        return state;
      }

      const sourceCards = state.tableau[fromColumn].slice(cardIndex);
      const targetColumn = state.tableau[toColumn];
      const sourceCard = sourceCards[0];
      if (!sourceCard.faceUp) return state;

      // Empty column - only allow Kings
      if (targetColumn.length === 0) {
        if (sourceCard.value === 'K') {
          saveUndoState(state);
          statsStore.incrementMoves();
          statsStore.startTimer();

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
            hasStarted: true,
            selectedCard: null,
            selectedColumn: null
          };
        }
        return state;
      }

      // Non-empty column - check if cards can stack
      const targetCard = targetColumn[targetColumn.length - 1];
      if (canStackCard(sourceCard, targetCard)) {
        saveUndoState(state);
        statsStore.incrementMoves();
        statsStore.startTimer();

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
          hasStarted: true,
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
      if (state.isPaused || state.isGameWon || state.isGameEnded ||
        !state.tableau[fromColumn] || !state.endStacks[stackIndex] ||
        !Number.isInteger(cardIndex) || cardIndex < 0 ||
        cardIndex >= state.tableau[fromColumn].length) return state;

      const card = state.tableau[fromColumn][cardIndex];
      const targetStack = state.endStacks[stackIndex];
      const topCard = targetStack.length > 0 ? targetStack[targetStack.length - 1] : null;

      // Check if card has attached cards
      const hasAttachedCards = cardIndex < state.tableau[fromColumn].length - 1;
      if (hasAttachedCards) {
        return state;
      }

      if (card.faceUp && canMoveToEndStack(card, topCard)) {
        saveUndoState(state);
        statsStore.incrementMoves();
        statsStore.startTimer();

        const newTableau = [...state.tableau];
        const newEndStacks = [...state.endStacks];

        newTableau[fromColumn] = newTableau[fromColumn].slice(0, cardIndex);
        newEndStacks[stackIndex] = [...targetStack, card];

        if (newTableau[fromColumn].length > 0 &&
          !newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp) {
          newTableau[fromColumn][newTableau[fromColumn].length - 1].faceUp = true;
        }

        const isGameWon = checkWin(newEndStacks);
        if (isGameWon) {
          statsStore.recordWin();
          startWinAnimation();
        }
        return {
          ...state,
          tableau: newTableau,
          endStacks: newEndStacks,
          hasStarted: true,
          selectedCard: null,
          selectedColumn: null,
          isGameWon,
          winAnimation: isGameWon,
          winAnimationIndex: isGameWon ? 0 : -1
        };
      }
      return state;
    });
  }

  function undo() {
    const currentState = get(gameStore);
    if (currentState.isGameEnded) return;
    const previousState = undoStore.undo(createUndoSnapshot(currentState));
    if (previousState) {
      statsStore.setMoves(previousState.moves);
      clearWinAnimation();
      if (previousState.isGameWon) statsStore.stopTimer();
      else if (previousState.hasStarted && !currentState.isPaused) statsStore.startTimer();
      set({
        ...currentState,
        tableau: previousState.tableau,
        endStacks: previousState.endStacks,
        redealsRemaining: previousState.redealsRemaining,
        hasStarted: previousState.hasStarted,
        isGameWon: previousState.isGameWon,
        winAnimation: previousState.winAnimation,
        winAnimationIndex: previousState.winAnimationIndex,
        selectedCard: null,
        selectedColumn: null,
        lastUpdate: Date.now()
      });
      statsStore.setRedealsUsed(previousState.redealsUsed);
    }
  }

  function redo() {
    const currentState = get(gameStore);
    if (currentState.isGameEnded) return;
    const nextState = undoStore.redo(createUndoSnapshot(currentState));
    if (nextState) {
      statsStore.setMoves(nextState.moves);
      clearWinAnimation();
      if (nextState.isGameWon) {
        statsStore.stopTimer();
      } else if (nextState.hasStarted && !currentState.isPaused) {
        statsStore.startTimer();
      }
      set({
        ...currentState,
        tableau: nextState.tableau,
        endStacks: nextState.endStacks,
        redealsRemaining: nextState.redealsRemaining,
        hasStarted: nextState.hasStarted,
        isGameWon: nextState.isGameWon,
        winAnimation: nextState.winAnimation,
        winAnimationIndex: nextState.winAnimationIndex,
        selectedCard: null,
        selectedColumn: null,
        lastUpdate: Date.now()
      });
      statsStore.setRedealsUsed(nextState.redealsUsed);
      if (nextState.isGameWon) startWinAnimation();
    }
  }

  function moveSequenceToEndStack(fromColumn, startIndex) {
    update(state => {
      if (state.isPaused || state.isGameWon || state.isGameEnded) return state;
      const column = state.tableau[fromColumn];
      if (!column || !Number.isInteger(startIndex) ||
        startIndex < 0 || startIndex >= column.length) return state;

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
          saveUndoState(state);
          statsStore.incrementMoves();
          statsStore.startTimer();

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

          const isGameWon = checkWin(newEndStacks);
          if (isGameWon) {
            statsStore.recordWin();
            startWinAnimation();
          }
          return {
            ...state,
            tableau: newTableau,
            endStacks: newEndStacks,
            hasStarted: true,
            selectedCard: null,
            selectedColumn: null,
            isGameWon,
            winAnimation: isGameWon,
            winAnimationIndex: isGameWon ? 0 : -1
          };
        }
      }
      return state;
    });
  }

  function checkWin(endStacks) {
    return endStacks.every(stack => stack.length === 13);
  }

  function canMoveCard(fromColumn, toColumn, cardIndex) {
    const state = get(gameStore);
    if (state.isPaused || state.isGameWon || state.isGameEnded ||
      !state.tableau[fromColumn] || !state.tableau[toColumn] ||
      !Number.isInteger(cardIndex) || cardIndex < 0 ||
      cardIndex >= state.tableau[fromColumn].length) return false;

    const sourceCard = state.tableau[fromColumn][cardIndex];
    const targetColumn = state.tableau[toColumn];
    if (!sourceCard.faceUp || fromColumn === toColumn) return false;

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
    redo,
    newGame,
    forceRefresh,
    canMoveCard,
    togglePause,
    endGame
  };

  return store;
}

// Create and export store instance
const gameStore = createGameStore();
export { gameStore };