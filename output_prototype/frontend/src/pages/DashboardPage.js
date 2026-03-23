import React from 'react';
import Dashboard from '../components/Dashboard';
import WaterIntakeForm from '../components/WaterIntakeForm';
import ReminderSettings from '../components/ReminderSettings';
import Profile from '../components/Profile';
import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  const handleLogIntake = (amount) => {
    console.log(`Logged ${amount} ml of water`);
  };

  const handleUpdateReminders = (frequency, time) => {
    console.log(`Updated reminders: ${frequency} at ${time}`);
  };

  const handleUpdateProfile = (profile) => {
    console.log('Updated profile:', profile);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <>
          <Dashboard dailyIntake={1500} goal={user.goal} history={[{ date: '2023-10-01', amount: 1500 }]} />
          <WaterIntakeForm onLogIntake={handleLogIntake} />
          <ReminderSettings onUpdateReminders={handleUpdateReminders} />
          <Profile user={user} onUpdateProfile={handleUpdateProfile} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;