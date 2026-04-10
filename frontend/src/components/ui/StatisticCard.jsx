import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import './StatisticCard.css';

const StatisticCard = ({ title, value, icon: Icon, trend, trendValue, colorClass = "primary", delay = 0 }) => {
    const isPositive = trend === 'up';
    const animatedValue = useCountUp(value, 1500);

    return (
        <motion.div
            className={`stat-card stat-${colorClass} card hover-lift`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
        >
            <div className="stat-header flex justify-between items-center mb-4">
                <h3 className="stat-title text-muted font-semibold text-sm">{title}</h3>
                {Icon && (
                    <div className="stat-icon-wrapper">
                        <Icon size={20} className="stat-icon" />
                    </div>
                )}
            </div>

            <div className="stat-body">
                <div className="stat-value text-2xl font-bold text-main">{animatedValue}</div>

                {trend && (
                    <div className={`stat-trend mt-2 flex items-center text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        <span>{trendValue}%</span>
                        <span className="text-muted font-normal ml-2">vs last month</span>
                    </div>
                )}
            </div>

            {/* Decorative background blur element */}
            <div className="stat-glow"></div>
        </motion.div>
    );
};

export default StatisticCard;
