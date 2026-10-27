import { writable } from 'svelte/store';

const STORAGE_KEY = 'solitaire-settings';

export const DECK_THEMES = {
    blue: { label: 'Classic blue', light: '#0879bd', dark: '#064577' },
    red: { label: 'Ruby red', light: '#c83d52', dark: '#741f3c' },
    green: { label: 'Forest green', light: '#278b62', dark: '#14523f' }
};

export const PLAY_AREA_THEMES = {
    green: { label: 'Classic green', start: '#004d40', end: '#00695c' },
    blue: { label: 'Ocean blue', start: '#123b63', end: '#176a83' },
    purple: { label: 'Royal purple', start: '#39245d', end: '#694078' }
};

const defaultSettings = {
    difficulty: 'normal',
    timerEnabled: true,
    deckTheme: 'blue',
    playAreaTheme: 'green',
    cardScale: 1
};

function loadSettings() {
    if (typeof localStorage === 'undefined') return defaultSettings;

    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return {
            ...defaultSettings,
            ...saved,
            difficulty: saved.difficulty === 'easy' ? 'easy' : 'normal',
            timerEnabled: typeof saved.timerEnabled === 'boolean'
                ? saved.timerEnabled
                : defaultSettings.timerEnabled,
            deckTheme: DECK_THEMES[saved.deckTheme]
                ? saved.deckTheme
                : defaultSettings.deckTheme,
            playAreaTheme: PLAY_AREA_THEMES[saved.playAreaTheme]
                ? saved.playAreaTheme
                : defaultSettings.playAreaTheme,
            cardScale: [0.8, 0.9, 1, 1.1, 1.2].includes(saved.cardScale)
                ? saved.cardScale
                : defaultSettings.cardScale
        };
    } catch (error) {
        console.warn('Could not load saved Solitaire settings.', error);
        return defaultSettings;
    }
}

function createSettingsStore() {
    const settings = writable(loadSettings());
    const { subscribe, update } = settings;

    function updateAndPersist(updater) {
        update(state => {
            const nextState = updater(state);
            if (typeof localStorage !== 'undefined') {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
                } catch (error) {
                    console.warn('Could not save Solitaire settings.', error);
                }
            }
            return nextState;
        });
    }

    return {
        subscribe,
        set: (nextState) => updateAndPersist(() => nextState),
        update: (updater) => updateAndPersist(updater),
        setDifficulty: (difficulty) => updateAndPersist(state => ({ ...state, difficulty })),
        toggleTimer: () => updateAndPersist(state => ({ ...state, timerEnabled: !state.timerEnabled })),
        setDeckTheme: (deckTheme) => updateAndPersist(state => ({ ...state, deckTheme })),
        setPlayAreaTheme: (playAreaTheme) => updateAndPersist(state => ({ ...state, playAreaTheme })),
        setCardScale: (cardScale) => updateAndPersist(state => ({ ...state, cardScale })),
        reset: () => updateAndPersist(() => ({ ...defaultSettings }))
    };
}

const settingsStore = createSettingsStore();
export { settingsStore };
