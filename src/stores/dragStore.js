import { writable } from 'svelte/store';

function createDragStore() {
    const { subscribe, update, set } = writable({
        isDragging: false,
        isNativeDrag: false,
        columnIndex: null,
        startIndex: null,
        sequenceLength: 0,
        position: { x: 0, y: 0 },
        cards: [],
        offset: { x: 0, y: 0 }
    });

    return {
        subscribe,
        startDrag: (
            columnIndex,
            startIndex,
            sequenceLength,
            { cards = [], position = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, isNativeDrag = false } = {}
        ) => set({
            isDragging: true,
            isNativeDrag,
            columnIndex,
            startIndex,
            sequenceLength,
            cards,
            position,
            offset
        }),
        updateTouchPosition: (x, y) => update(state => ({
            ...state,
            position: { x, y }
        })),
        reset: () => set({
            isDragging: false,
            isNativeDrag: false,
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