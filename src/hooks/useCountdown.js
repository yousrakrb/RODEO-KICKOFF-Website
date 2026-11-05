// src/hooks/useCountdown.js
import { useEffect, useState } from 'react';
import { getTimeLeft } from '../utils/getTimeLeft';

export function useCountdown() {
    const [time, setTime] = useState(getTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => setTime(getTimeLeft()), 1000);
        return () => clearInterval(interval); // stops the timer if component is removed, prevents a memory leak
    }, []);

    return time;
}