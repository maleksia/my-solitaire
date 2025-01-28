import { writable } from 'svelte/store';

function createDragStore() {
    const { subscribe, update, set } = writable({
        isDragging: false,
        columnIndex: null,
        startIndex: null,
        sequenceLength: 0,
        position: { x: 0, y: 0 },
        cards: [],
        offset: { x: 0, y: 0 }
    });

    return {
        subscribe,
        startDrag: (columnIndex, startIndex, sequenceLength, cards, position, offset) => set({
            isDragging: true,
            columnIndex,
            startIndex,
            sequenceLength,
            cards: cards || [],
            position: position || { x: 0, y: 0 },
            offset: offset || { x: 0, y: 0 }
        }),
        updateTouchPosition: (x, y) => update(state => ({
            ...state,
            position: { x, y }
        })),
        reset: () => set({
            isDragging: false,
            columnIndex: null,
            startIndex: null,
            sequenceLength: 0,
            position: { x: 0, y: 0 },
            cards: [],
            offset: { x: 0, y: 0 }
        })
    };
}

export const dragStore = createDragStore();