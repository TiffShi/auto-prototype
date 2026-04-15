import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Switch>
                    <Route path="/" exact component={HomePage} />
                    <Route path="/login" component={Login} />
                    <Route path="/signup" component={Signup} />
                    <Route path="/dashboard" component={DashboardPage} />
                    <Route path="/settings" component={SettingsPage} />
                </Switch>
            </Router>
        </AuthProvider>
    );
}

export default App;