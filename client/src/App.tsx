import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <div className="App" style={{ height: '100vh', width: '100%' }}> {/* Use full width */}
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </div>
  );
}

export default App;
