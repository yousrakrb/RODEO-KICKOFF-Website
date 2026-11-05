// src/components/FloatingElement/FloatingElement.jsx
import { motion } from 'framer-motion';
import './FloatingElement.css';

export default function FloatingElement({ children, hoverLift = 15 }) {
    return (
        <motion.div
            className="floating-element"
            whileHover={{ y: -hoverLift, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
            {children}
        </motion.div>
    );
}