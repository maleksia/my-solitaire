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
        
        if (width < 768) { // Mobile
            const cardWidth = Math.min(Math.floor(width / 8.5), 42);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.44);
            const columnSpacing = 1;
            const tableauWidth = width * 0.99;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        } 
        else if (width < 1024) { // Tablet
            const cardWidth = Math.min(Math.floor(width / 10), 75);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.42);
            const columnSpacing = 10;
            const tableauWidth = width * 0.95;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
        else { // Desktop
            const cardWidth = Math.min(Math.max(Math.floor(width / 12), 60), 100);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.3);
            const columnSpacing = 20;
            const tableauWidth = width * 0.9;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
    }

    return {
        subscribe,
        updateLayout
    };
}

export const layoutStore = createLayoutStore();