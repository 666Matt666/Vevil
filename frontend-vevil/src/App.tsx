import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchRates } from './services/currencyRates';
import './App.css';

function App() {
    useEffect(() => {
        fetchRates().catch(() => {});
    }, []);
    return (
        <main>
            <Outlet />
        </main>
    );
}

export default App
