import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ items }) => {
    return (
        <div className="activity-feed">
            {items.map((item, index) => (
                <div className="feed-item" key={item.id || index}>
                    <div className="feed-timeline">
                        <div className={`feed-dot bg-${item.type || 'primary'}`}></div>
                        {index !== items.length - 1 && <div className="feed-line"></div>}
                    </div>
                    <div className="feed-content">
                        <p className="feed-title text-sm text-main font-semibold">{item.title}</p>
                        <p className="feed-desc text-xs text-muted mt-1">{item.description}</p>
                        <span className="feed-time text-xs text-muted mt-2 block">{item.time}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
