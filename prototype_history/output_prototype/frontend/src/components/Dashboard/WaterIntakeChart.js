import React from 'react';
import { Line } from 'react-chartjs-2';

function WaterIntakeChart({ data }) {
    const chartData = {
        labels: data.map(entry => entry.date),
        datasets: [
            {
                label: 'Water Intake (ml)',
                data: data.map(entry => entry.amount),
                fill: false,
                backgroundColor: 'blue',
                borderColor: 'lightblue',
            },
        ],
    };

    return <Line data={chartData} />;
}

export default WaterIntakeChart;