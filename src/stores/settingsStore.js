import { writable } from 'svelte/store';

function createSettingsStore() {
    const settings = writable({
        difficulty: 'normal',
        timerEnabled: true
    });

    const { subscribe, set, update } = settings;

    return {
        subscribe,
        set,
        update,
        setDifficulty: (difficulty) => update(state => ({ ...state, difficulty })),
        toggleTimer: () => update(state => ({ ...state, timerEnabled: !state.timerEnabled })),
        reset: () => set({ difficulty: 'normal', timerEnabled: true })
    };
}

const settingsStore = createSettingsStore();
export { settingsStore };