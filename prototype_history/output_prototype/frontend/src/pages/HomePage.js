import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div>
            <h1>Welcome to the Water Intake Tracker</h1>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
        </div>
    );
}

export default HomePage;