import { writable, get } from 'svelte/store';

function createUndoStore() {
    const { subscribe, set, update } = writable({
        past: [],
        future: []
    });

    let store = {
        subscribe,
        pushState: (state) => {
            console.log("Pushing state:", state);
            update(history => ({
                past: [...history.past, state],
                future: []
            }));
        },
        undo: () => {
            const currentState = get(undoStore);  // Use the store itself
            console.log("Current undo history:", currentState);

            if (currentState.past.length === 0) {
                console.log("No moves to undo");
                return null;
            }

            const lastState = currentState.past[currentState.past.length - 1];
            console.log("Restoring state:", lastState);

            update(history => ({
                past: history.past.slice(0, -1),
                future: [lastState, ...history.future]
            }));

            return lastState;
        },
        clear: () => {
            console.log("Clearing undo history");
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