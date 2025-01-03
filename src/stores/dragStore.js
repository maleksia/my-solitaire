import { writable } from 'svelte/store';

function createDragStore() {
    const { subscribe, set } = writable({
        isDragging: false,
        columnIndex: null,
        startIndex: null,
        sequenceLength: 0
    });

    return {
        subscribe,
        startDrag: (columnIndex, startIndex, sequenceLength) => set({
            isDragging: true,
            columnIndex,
            startIndex,
            sequenceLength
        }),
        endDrag: () => set({
            isDragging: false,
            columnIndex: null,
            startIndex: null,
            sequenceLength: 0
        }),
        reset: () => set({
            isDragging: false,
            columnIndex: null,
            startIndex: null,
            sequenceLength: 0
        })
    };
}

export const dragStore = createDragStore();