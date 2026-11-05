// src/sections/Hero/Hero.jsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

export default function Hero() {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    // -60vh means "travel 60% of the viewport height upward" — scales with screen size automatically
    const y = useTransform(scrollYProgress, [0, 1], ['0vh', '-60vh']);
    const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);

    return (
        <section ref={sectionRef} className="hero" id="hero">
            <motion.div className="hero-image" style={{ y, opacity }}>
                <picture>
                    {/* phones: use the small image */}
                    <source
                        media="(max-width: 767px)"
                        srcSet="/assets/hero-small.png"
                    />
                    {/* everything else: the current image */}
                    <img
                        src="/assets/hero/hero-beige.png"
                        alt="The gates are open. Saddle up, riders, the trail awaits. Join us for the ride."
                        className="hero-beige-image"
                    />
                </picture>
            </motion.div>
        </section>
    );
}