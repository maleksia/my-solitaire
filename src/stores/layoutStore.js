import { writable } from 'svelte/store';

function createLayoutStore() {
    let cardScale = 1;
    const { subscribe, set } = writable({
        cardWidth: 80,
        cardHeight: 120,
        cardSpacing: 35,
        columnSpacing: 20,
        tableauWidth: 0
    });

    function setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth) {
        const scaledCardWidth = Math.floor(cardWidth * cardScale);
        const scaleRatio = scaledCardWidth / cardWidth;
        set({
            cardWidth: scaledCardWidth,
            cardHeight: Math.floor(scaledCardWidth * 1.5),
            cardSpacing: Math.floor(cardSpacing * scaleRatio),
            columnSpacing,
            tableauWidth
        });
    }

    function updateLayout() {
        const width = window.innerWidth;
        
        if (width < 480) {
            const cardWidth = Math.min(Math.floor((width - 24) / 6.4), 58);
            const cardHeight = Math.floor(cardWidth * 1.5);
            const cardSpacing = Math.floor(cardHeight * 0.46);
            const columnSpacing = 2;
            const tableauWidth = width * 0.98;
            setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth);
        } 
        else if (width < 768) {
            const cardWidth = Math.min(Math.floor(width / 8), 65);
            const cardSpacing = Math.floor(cardWidth * 1.5 * 0.46);
            const columnSpacing = 6; 
            const tableauWidth = width * 0.98;
            setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth);
        }
        else if (width < 1024) {
            const cardWidth = Math.min(Math.floor(width / 9), 80);
            const cardSpacing = Math.floor(cardWidth * 1.5 * 0.4);
            const columnSpacing = 10;
            const tableauWidth = width * 0.95;
            setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth);
        }
        else if (width < 1250) {
            const cardWidth = Math.min(Math.floor(width / 8), 100);
            const cardSpacing = Math.floor(cardWidth * 1.5 * 0.39);
            const columnSpacing = 15;
            const tableauWidth = width * 0.95;
            setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth);
        }
        else {
            const cardWidth = Math.min(Math.floor(width / 8), 140);
            const cardSpacing = Math.floor(cardWidth * 1.5 * 0.35);
            const columnSpacing = 225;
            const tableauWidth = Math.min(width * 0.9, 1400);
            setScaledLayout(cardWidth, cardSpacing, columnSpacing, tableauWidth);
        }
    }

    function setCardScale(scale) {
        cardScale = scale;
        updateLayout();
    }

    return {
        subscribe,
        updateLayout,
        setCardScale
    };
}

export const layoutStore = createLayoutStore();