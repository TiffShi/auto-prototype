import React, { useState } from 'react';
import { setReminder } from '../services/api';

function ReminderSettings() {
    const [time, setTime] = useState('');
    const [frequency, setFrequency] = useState('daily');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await setReminder({ time, frequency });
            alert('Reminder set successfully!');
        } catch (error) {
            console.error('Failed to set reminder', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
            />
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
            </select>
            <button type="submit">Set Reminder</button>
        </form>
    );
}

export default ReminderSettings;