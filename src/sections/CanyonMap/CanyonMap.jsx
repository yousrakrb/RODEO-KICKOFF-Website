// src/sections/CanyonMap/CanyonMap.jsx
import { motion } from 'framer-motion';
import './CanyonMap.css';

export default function CanyonMap() {
    return (
        <section className="canyon-map-section" id="canyon-map">
            <motion.div
                className="canyon-map-container"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Title Image */}
                <div className="canyon-map-title-wrap">
                    <img
                        src="/assets/canyon-map/Thecanyon.png"
                        alt="The Grand Canyon Trip"
                        className="canyon-map-title-img"
                    />
                </div>

                {/* Illustrated Map Artwork */}
                <div className="canyon-map-artwork-wrap">
                    <img
                        src="/assets/canyon-map/map.png"
                        alt="Illustrated vintage parchment map of The Grand Canyon Trip - Pack your cowboy boots and hats, and book your canyon ticket!!"
                        className="canyon-map-artwork-img"
                    />
                </div>
            </motion.div>
        </section>
    );
}