// src/hooks/useSmoothScroll.js
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook to initialize Lenis smooth momentum-based scrolling site-wide,
 * seamlessly synchronized with GSAP ScrollTrigger via requestAnimationFrame.
 */
export function useSmoothScroll() {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            lerp: 0.075,        // Momentum responsiveness (0.05 floaty -> 0.1 snappy)
            wheelMultiplier: 0.9,
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;
        window.lenis = lenis;

        // Sync Lenis scroll events with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // requestAnimationFrame loop calling lenis.raf(time)
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Clean up on unmount
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
            if (window.lenis === lenis) {
                delete window.lenis;
            }
        };
    }, []);

    return lenisRef;
}

export default useSmoothScroll;
