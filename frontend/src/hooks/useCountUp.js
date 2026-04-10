import { useState, useEffect } from 'react';

export const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        // Remove non-numeric characters for the counting animation
        const targetValue = parseFloat(end.toString().replace(/[^0-9.-]+/g, ""));
        const prefix = end.toString().replace(/[0-9.-].*/, '');
        const suffix = end.toString().replace(/.*[0-9.-]/, '');

        if (isNaN(targetValue)) {
            setCount(end);
            return;
        }

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = targetValue * easeProgress;

            // Format to match original decimal places if any
            const isFloat = end.toString().includes('.');
            const formattedCount = isFloat ? currentCount.toFixed(2) : Math.floor(currentCount);

            setCount(`${prefix}${formattedCount}${suffix}`);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            } else {
                setCount(end); // Ensure exact final string match
            }
        };

        animationFrame = requestAnimationFrame(step);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [end, duration]);

    return count;
};
