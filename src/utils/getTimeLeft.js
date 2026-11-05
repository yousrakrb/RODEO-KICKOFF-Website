// src/utils/getTimeLeft.js
const TARGET_DATE = new Date('2026-11-20T00:00:00');

export function getTimeLeft() {
    const diff = Math.max(0, TARGET_DATE - new Date());
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}