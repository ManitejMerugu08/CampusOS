import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width = '100%', height = '20px', className = '', style = {} }) => {
    return (
        <motion.div
            className={`bg-border-color rounded-md overflow-hidden relative ${className}`}
            style={{ width, height, ...style }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="absolute inset-0 z-10"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    width: '200%'
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
            />
        </motion.div>
    );
};

export default Skeleton;
