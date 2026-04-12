import React, { useState } from 'react';
import { logWaterIntake } from '../services/api';

function WaterIntakeForm() {
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await logWaterIntake({ amount: parseFloat(amount), date: new Date().toISOString() });
            alert('Water intake logged!');
        } catch (error) {
            console.error('Failed to log water intake', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="number"
                placeholder="Amount (ml)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit">Log Water Intake</button>
        </form>
    );
}

export default WaterIntakeForm;