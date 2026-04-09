import { useState, useEffect } from 'react';
import { fetchWaterIntake } from '../services/api';

export const useWaterIntake = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchWaterIntake();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch water intake data', error);
            }
        };

        fetchData();
    }, []);

    return data;
};