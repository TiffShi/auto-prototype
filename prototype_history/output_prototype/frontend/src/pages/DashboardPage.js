import React from 'react';
import WaterIntakeForm from '../components/WaterIntakeForm';
import WaterIntakeChart from '../components/Dashboard/WaterIntakeChart';
import ProgressBar from '../components/Dashboard/ProgressBar';
import { useWaterIntake } from '../hooks/useWaterIntake';

function DashboardPage() {
    const waterIntakeData = useWaterIntake();
    const dailyGoal = 2000; // Example daily goal in ml

    const totalIntake = waterIntakeData.reduce((total, entry) => total + entry.amount, 0);

    return (
        <div>
            <h1>Dashboard</h1>
            <WaterIntakeForm />
            <ProgressBar current={totalIntake} goal={dailyGoal} />
            <WaterIntakeChart data={waterIntakeData} />
        </div>
    );
}

export default DashboardPage;