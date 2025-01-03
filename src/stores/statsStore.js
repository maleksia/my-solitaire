import { writable } from 'svelte/store';

function createStatsStore() {
    const { subscribe, update, set } = writable({
        currentGame: {
            moves: 0,
            startTime: null,
            elapsedTime: 0
        }
    });

    let timerInterval;

    return {
        subscribe,
        incrementMoves: () => {
            update(stats => ({
                ...stats,
                currentGame: {
                    ...stats.currentGame,
                    moves: stats.currentGame.moves + 1
                }
            }));
        },
        startTimer: () => {
            update(stats => ({
                ...stats,
                currentGame: {
                    ...stats.currentGame,
                    startTime: Date.now()
                }
            }));
            timerInterval = setInterval(() => {
                update(stats => ({
                    ...stats,
                    currentGame: {
                        ...stats.currentGame,
                        elapsedTime: Date.now() - stats.currentGame.startTime
                    }
                }));
            }, 1000);
        },
        stopTimer: () => {
            clearInterval(timerInterval);
        },
        reset: () => {
            clearInterval(timerInterval);
            set({
                currentGame: {
                    moves: 0,
                    startTime: null,
                    elapsedTime: 0
                }
            });
        }
    };
}

const statsStore = createStatsStore();
export { statsStore };