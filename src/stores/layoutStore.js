import { writable } from 'svelte/store';

function createLayoutStore() {
    const { subscribe, set } = writable({
        cardWidth: 80,
        cardHeight: 120,
        cardSpacing: 35,
        columnSpacing: 20,
        tableauWidth: 0
    });

    function updateLayout() {
        const width = window.innerWidth;
        
        const cardWidth = Math.min(Math.max(Math.floor(width / 12), 60), 100);
        const cardHeight = Math.floor(cardWidth * 1.5);
        const cardSpacing = Math.floor(cardHeight * 0.3);
        const columnSpacing = 20;
        const tableauWidth = width * 0.9;

        set({ 
            cardWidth, 
            cardHeight, 
            cardSpacing, 
            columnSpacing,
            tableauWidth
        });
    }

    return {
        subscribe,
        updateLayout
    };
}

export const layoutStore = createLayoutStore();