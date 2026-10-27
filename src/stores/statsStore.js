import { writable } from 'svelte/store';

const LIFETIME_STATS_KEY = 'solitaire-lifetime-stats';

function loadLifetimeStats() {
    if (typeof localStorage === 'undefined') return { gamesPlayed: 0, gamesWon: 0 };
    try {
        const saved = JSON.parse(localStorage.getItem(LIFETIME_STATS_KEY) || '{}');
        return {
            gamesPlayed: Number.isInteger(saved.gamesPlayed) && saved.gamesPlayed >= 0
                ? saved.gamesPlayed
                : 0,
            gamesWon: Number.isInteger(saved.gamesWon) && saved.gamesWon >= 0
                ? saved.gamesWon
                : 0
        };
    } catch (error) {
        console.warn('Could not load Solitaire lifetime stats.', error);
        return { gamesPlayed: 0, gamesWon: 0 };
    }
}

function persistLifetimeStats(stats) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(LIFETIME_STATS_KEY, JSON.stringify({
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon
        }));
    } catch (error) {
        console.warn('Could not save Solitaire lifetime stats.', error);
    }
}

function createStatsStore() {
    const lifetimeStats = loadLifetimeStats();
    const { subscribe, update } = writable({
        ...lifetimeStats,
        currentGame: {
            moves: 0,
            startTime: null,
            elapsedTime: 0,
            redealsUsed: 0,
            winRecorded: false
        }
    });

    let timerInterval = null;
    let timerBaseElapsedTime = 0;

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
        undoMove: () => {
            update(stats => ({
                ...stats,
                currentGame: {
                    ...stats.currentGame,
                    moves: Math.max(stats.currentGame.moves - 1, 0)
                }
            }));
        },
        setMoves: (moves) => {
            update(stats => ({
                ...stats,
                currentGame: {
                    ...stats.currentGame,
                    moves
                }
            }));
        },
        startGame: () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timerBaseElapsedTime = 0;
            update(stats => {
                const nextStats = {
                    ...stats,
                    gamesPlayed: stats.gamesPlayed + 1,
                    currentGame: {
                        moves: 0,
                        startTime: null,
                        elapsedTime: 0,
                        redealsUsed: 0,
                        winRecorded: false
                    }
                };
                persistLifetimeStats(nextStats);
                return nextStats;
            });
        },
        incrementRedeals: () => {
            update(stats => ({
                ...stats,
                currentGame: {
                    ...stats.currentGame,
                    redealsUsed: stats.currentGame.redealsUsed + 1
                }
            }));
        },
        setRedealsUsed: (redealsUsed) => {
            update(stats => ({
                ...stats,
                currentGame: { ...stats.currentGame, redealsUsed }
            }));
        },
        recordWin: () => {
            update(stats => {
                if (stats.currentGame.winRecorded) return stats;
                const nextStats = {
                    ...stats,
                    gamesWon: stats.gamesWon + 1,
                    currentGame: { ...stats.currentGame, winRecorded: true }
                };
                persistLifetimeStats(nextStats);
                return nextStats;
            });
        },
        startTimer: () => {
            let startTime;
            let baseElapsedTime;
            update(stats => {
                if (stats.currentGame.startTime !== null) {
                    return stats;
                }
                startTime = Date.now();
                baseElapsedTime = stats.currentGame.elapsedTime;
                timerBaseElapsedTime = baseElapsedTime;
                return {
                    ...stats,
                    currentGame: {
                        ...stats.currentGame,
                        startTime
                    }
                };
            });
            if (startTime === undefined) return;

            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                update(stats => ({
                    ...stats,
                    currentGame: {
                        ...stats.currentGame,
                        elapsedTime: timerBaseElapsedTime + Date.now() - startTime
                    }
                }));
            }, 1000);
        },
        pauseTimer: () => {
            clearInterval(timerInterval);
            timerInterval = null;
            update(stats => {
                const { startTime } = stats.currentGame;
                if (startTime === null) return stats;
                timerBaseElapsedTime += Date.now() - startTime;
                return {
                    ...stats,
                    currentGame: {
                        ...stats.currentGame,
                        startTime: null,
                        elapsedTime: timerBaseElapsedTime
                    }
                };
            });
        },
        stopTimer: () => {
            clearInterval(timerInterval);
            timerInterval = null;
            update(stats => {
                const { startTime } = stats.currentGame;
                if (startTime === null) return stats;
                timerBaseElapsedTime += Date.now() - startTime;
                return {
                    ...stats,
                    currentGame: {
                        ...stats.currentGame,
                        startTime: null,
                        elapsedTime: timerBaseElapsedTime
                    }
                };
            });
        },
        reset: () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timerBaseElapsedTime = 0;
            update(stats => ({
                ...stats,
                currentGame: {
                    moves: 0,
                    startTime: null,
                    elapsedTime: 0,
                    redealsUsed: 0,
                    winRecorded: false
                }
            }));
        }
    };
}

const statsStore = createStatsStore();
export { statsStore };