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
        
        if (width < 480) {
            const cardWidth = Math.min(Math.floor(width / 7.5), 40);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.44);
            const columnSpacing = 2;
            const tableauWidth = width * 0.98;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        } 
        else if (width < 768) {
            const cardWidth = Math.min(Math.floor(width / 8), 65);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.4);
            const columnSpacing = 6; 
            const tableauWidth = width * 0.98;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
        else if (width < 1024) {
            const cardWidth = Math.min(Math.floor(width / 9), 80);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.4);
            const columnSpacing = 10;
            const tableauWidth = width * 0.95;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
        else if (width < 1250) {
            const cardWidth = Math.min(Math.floor(width / 8), 100);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.39);
            const columnSpacing = 15;
            const tableauWidth = width * 0.95;
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
        else {
            const cardWidth = Math.min(Math.floor(width / 8), 140);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.35);
            const columnSpacing = 225;
            const tableauWidth = Math.min(width * 0.9, 1400);
    
            set({ cardWidth, cardHeight, cardSpacing, columnSpacing, tableauWidth });
        }
    }

    return {
        subscribe,
        updateLayout
    };
}

export const layoutStore = createLayoutStore();