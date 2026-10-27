import { writable, get } from 'svelte/store';

function createUndoStore() {
    const { subscribe, set, update } = writable({
        past: [],
        future: []
    });

    let store = {
        subscribe,
        pushState: (state) => {
            update(history => ({
                past: [...history.past, state],
                future: []
            }));
        },
        undo: (stateBeforeUndo) => {
            const history = get(undoStore);
            if (history.past.length === 0) {
                return null;
            }

            const lastState = history.past[history.past.length - 1];

            update(currentHistory => ({
                past: currentHistory.past.slice(0, -1),
                future: [stateBeforeUndo, ...currentHistory.future]
            }));

            return lastState;
        },
        redo: (currentState) => {
            const history = get(undoStore);
            if (history.future.length === 0) {
                return null;
            }

            const nextState = history.future[0];
            update(currentHistory => ({
                past: [...currentHistory.past, currentState],
                future: currentHistory.future.slice(1)
            }));

            return nextState;
        },
        clear: () => {
            set({
                past: [],
                future: []
            });
        }
    };

    return store;
}

const undoStore = createUndoStore();
export { undoStore };