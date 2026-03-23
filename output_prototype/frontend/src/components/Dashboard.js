import React from 'react';

const Dashboard = ({ dailyIntake, goal, history }) => {
  const progress = (dailyIntake / goal) * 100;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Daily Intake: {dailyIntake} ml</p>
      <p>Goal: {goal} ml</p>
      <div>
        <h3>Progress</h3>
        <div style={{ width: '100%', backgroundColor: '#e0e0e0' }}>
          <div style={{ width: `${progress}%`, backgroundColor: '#76c7c0', height: '24px' }}></div>
        </div>
      </div>
      <div>
        <h3>History</h3>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>{entry.date}: {entry.amount} ml</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;