import { writable } from 'svelte/store';

const LIFETIME_STATS_KEY = 'solitaire-lifetime-stats';

function loadDifficultyStats(saved = {}) {
    return {
        gamesPlayed: Number.isInteger(saved.gamesPlayed) && saved.gamesPlayed >= 0
            ? saved.gamesPlayed
            : 0,
        gamesWon: Number.isInteger(saved.gamesWon) && saved.gamesWon >= 0
            ? saved.gamesWon
            : 0,
        bestTimeMs: Number.isFinite(saved.bestTimeMs) && saved.bestTimeMs >= 0
            ? saved.bestTimeMs
            : null,
        fewestMoves: Number.isInteger(saved.fewestMoves) && saved.fewestMoves >= 0
            ? saved.fewestMoves
            : null
    };
}

function loadLifetimeStats() {
    if (typeof localStorage === 'undefined') {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            byDifficulty: { easy: loadDifficultyStats(), normal: loadDifficultyStats() }
        };
    }
    try {
        const saved = JSON.parse(localStorage.getItem(LIFETIME_STATS_KEY) || '{}') || {};
        return {
            gamesPlayed: Number.isInteger(saved.gamesPlayed) && saved.gamesPlayed >= 0
                ? saved.gamesPlayed
                : 0,
            gamesWon: Number.isInteger(saved.gamesWon) && saved.gamesWon >= 0
                ? saved.gamesWon
                : 0,
            byDifficulty: {
                easy: loadDifficultyStats(saved.byDifficulty?.easy),
                normal: loadDifficultyStats(saved.byDifficulty?.normal)
            }
        };
    } catch (error) {
        console.warn('Could not load Solitaire lifetime stats.', error);
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            byDifficulty: { easy: loadDifficultyStats(), normal: loadDifficultyStats() }
        };
    }
}

function persistLifetimeStats(stats) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(LIFETIME_STATS_KEY, JSON.stringify({
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon,
            byDifficulty: stats.byDifficulty
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
            difficulty: 'normal',
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
        startGame: (difficulty = 'normal') => {
            clearInterval(timerInterval);
            timerInterval = null;
            timerBaseElapsedTime = 0;
            update(stats => {
                const normalizedDifficulty = difficulty === 'easy' ? 'easy' : 'normal';
                const nextStats = {
                    ...stats,
                    gamesPlayed: stats.gamesPlayed + 1,
                    byDifficulty: {
                        ...stats.byDifficulty,
                        [normalizedDifficulty]: {
                            ...stats.byDifficulty[normalizedDifficulty],
                            gamesPlayed: stats.byDifficulty[normalizedDifficulty].gamesPlayed + 1
                        }
                    },
                    currentGame: {
                        moves: 0,
                        startTime: null,
                        elapsedTime: 0,
                        redealsUsed: 0,
                        difficulty: normalizedDifficulty,
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
                const { difficulty, elapsedTime, moves } = stats.currentGame;
                const modeStats = stats.byDifficulty[difficulty];
                const nextStats = {
                    ...stats,
                    gamesWon: stats.gamesWon + 1,
                    byDifficulty: {
                        ...stats.byDifficulty,
                        [difficulty]: {
                            ...modeStats,
                            gamesWon: modeStats.gamesWon + 1,
                            bestTimeMs: modeStats.bestTimeMs === null
                                ? elapsedTime
                                : Math.min(modeStats.bestTimeMs, elapsedTime),
                            fewestMoves: modeStats.fewestMoves === null
                                ? moves
                                : Math.min(modeStats.fewestMoves, moves)
                        }
                    },
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
                    difficulty: 'normal',
                    winRecorded: false
                }
            }));
        }
    };
}

const statsStore = createStatsStore();
export { statsStore };