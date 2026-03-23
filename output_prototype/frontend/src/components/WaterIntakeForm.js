import React, { useState } from 'react';

const WaterIntakeForm = ({ onLogIntake }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogIntake(amount);
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Water Intake</h2>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (ml)" required />
      <button type="submit">Log</button>
    </form>
  );
};

export default WaterIntakeForm;