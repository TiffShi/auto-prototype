import React from 'react';

function ProgressBar({ current, goal }) {
    const percentage = (current / goal) * 100;

    return (
        <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${percentage}%` }}></div>
            <span>{current}ml / {goal}ml</span>
        </div>
    );
}

export default ProgressBar;