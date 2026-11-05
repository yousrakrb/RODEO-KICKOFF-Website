// src/components/FlipDigit/FlipDigit.jsx
import { useEffect, useRef, useState } from 'react';
import './FlipDigit.css';

export default function FlipDigit({ value }) {
    const [displayValue, setDisplayValue] = useState(value);
    const [flipping, setFlipping] = useState(false);
    const prevValue = useRef(value);

    useEffect(() => {
        if (value !== prevValue.current) {
            setFlipping(true);
            const timeout = setTimeout(() => {
                setDisplayValue(value);
                setFlipping(false);
                prevValue.current = value;
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [value]);

    return (
        <div className="flip-digit">
            <div className="flip-digit-static">{displayValue}</div>
            {flipping && (
                <div className="flip-digit-flip">
                    <div className="flip-top">{prevValue.current}</div>
                    <div className="flip-bottom">{value}</div>
                </div>
            )}
        </div>
    );
}