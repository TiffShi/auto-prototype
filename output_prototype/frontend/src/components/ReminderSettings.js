import React, { useState } from 'react';

const ReminderSettings = ({ onUpdateReminders }) => {
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateReminders(frequency, time);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reminder Settings</h2>
      <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency (e.g., every 2 hours)" required />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      <button type="submit">Update</button>
    </form>
  );
};

export default ReminderSettings;